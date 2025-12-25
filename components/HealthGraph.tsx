import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, CheckCircle2, Circle, Zap, CalendarDays, CalendarRange, Calendar, Edit2, Save, Plus, Trash2, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// Mock Data for different ranges
const daysData = [
  { name: 'Mon', health: 65 },
  { name: 'Tue', health: 72 },
  { name: 'Wed', health: 68 },
  { name: 'Thu', health: 75 },
  { name: 'Fri', health: 82 },
  { name: 'Sat', health: 78 },
  { name: 'Sun', health: 60 }, // Base value for today
];

const weeksData = [
  { name: 'Week 1', health: 55 },
  { name: 'Week 2', health: 62 },
  { name: 'Week 3', health: 48 },
  { name: 'Week 4', health: 60 }, // Current
];

const monthsData = [
  { name: 'Jan 25', health: 70 },
  { name: 'Feb 25', health: 45 },
  { name: 'Mar 25', health: 80 },
  { name: 'Apr 25', health: 85 },
  { name: 'May 25', health: 40 },
  { name: 'Jun 25', health: 60 }, // Current
];

const activitiesList = [
  { id: 1, label: 'Morning Medication', impact: 20 },
  { id: 2, label: '30 Min Physical Therapy', impact: 20 },
  { id: 3, label: 'Hydration Goal (2L)', impact: 20 },
  { id: 4, label: '8 Hours Sleep', impact: 20 },
  { id: 5, label: 'Evening Meditation', impact: 20 },
];

type TimeRange = 'days' | 'weeks' | 'months';

const HealthGraph: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('days');
  const [data, setData] = useState(daysData);
  const [activities, setActivities] = useState(
    activitiesList.map(a => ({ ...a, completed: false }))
  );
  const [currentScore, setCurrentScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState<Record<string, { score: number, activities: typeof activities }>>({});

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('health_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDisplayDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const changeDate = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);

    const dateKey = formatDate(newDate);
    if (history[dateKey]) {
      setActivities(history[dateKey].activities);
      setCurrentScore(history[dateKey].score);
    } else {
      // Reset for new day or unsaved day
      setActivities(activitiesList.map(a => ({ ...a, completed: false })));
      setCurrentScore(0);
    }
  };

  const handleSaveProgress = () => {
    const dateKey = formatDate(currentDate);
    const newHistory = {
      ...history,
      [dateKey]: {
        score: currentScore,
        activities: activities
      }
    };
    setHistory(newHistory);
    localStorage.setItem('health_history', JSON.stringify(newHistory));
    alert(`Progress saved for ${getDisplayDate(currentDate)}!`);
  };

  const handleResetProgress = () => {
    if (!window.confirm(`Are you sure you want to reset progress for ${getDisplayDate(currentDate)}?`)) return;
    
    // Reset current state
    setActivities(activitiesList.map(a => ({ ...a, completed: false })));
    setCurrentScore(0);

    // Update history
    const dateKey = formatDate(currentDate);
    const newHistory = { ...history };
    delete newHistory[dateKey];
    
    setHistory(newHistory);
    localStorage.setItem('health_history', JSON.stringify(newHistory));
  };

  // Handle Time Range Switch
  useEffect(() => {
    let newData;
    switch (timeRange) {
      case 'weeks':
        newData = [...weeksData];
        break;
      case 'months':
        newData = [...monthsData];
        break;
      case 'days':
      default:
        newData = [...daysData];
        break;
    }
    // Ensure the last point reflects the current score
    newData[newData.length - 1] = { ...newData[newData.length - 1], health: currentScore };
    setData(newData);
  }, [timeRange, currentScore]);

  // Handle Activity Toggle
  useEffect(() => {
    // Only auto-calculate if we are on "Today" or if we are editing. 
    // If viewing history, we don't want to auto-recalc unless user interacts.
    // But for simplicity, we'll let it recalc based on the 'activities' state which is loaded from history.
    const baseScore = 0;
    const bonus = activities
      .filter(a => a.completed)
      .reduce((acc, curr) => acc + curr.impact, 0);
    
    const newScore = Math.min(baseScore + bonus, 100);
    setCurrentScore(newScore);
  }, [activities]);

  const toggleActivity = (id: number) => {
    if (isEditing) return;
    setActivities(prev => prev.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  const updateActivityLabel = (id: number, newLabel: string) => {
    setActivities(prev => prev.map(a => 
      a.id === id ? { ...a, label: newLabel } : a
    ));
  };

  const recalculateImpacts = (list: typeof activities) => {
    const count = list.length;
    if (count === 0) return list;
    const impact = Math.floor(100 / count);
    const remainder = 100 % count;
    return list.map((item, index) => ({
      ...item,
      impact: index < remainder ? impact + 1 : impact
    }));
  };

  const deleteActivity = (id: number) => {
    setActivities(prev => {
      const filtered = prev.filter(a => a.id !== id);
      return recalculateImpacts(filtered);
    });
  };

  const addActivity = () => {
    setActivities(prev => {
      const newId = Math.max(...prev.map(a => a.id), 0) + 1;
      const newList = [...prev, { id: newId, label: 'New Goal', impact: 0, completed: false }];
      return recalculateImpacts(newList);
    });
  };

  // Calculate Gradient Offset for Red/Teal split
  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.health));
    const dataMin = Math.min(...data.map((i) => i.health));
  
    if (dataMax <= 40) return 0;
    if (dataMin >= 40) return 1;
  
    return (dataMax - 40) / (dataMax - dataMin);
  };
  
  const off = gradientOffset();

  return (
    <div className="flex flex-col gap-8">
      {/* Graph Section */}
      <div className="w-full bg-white p-8 rounded-[2.5rem] border-2 border-teal-50 shadow-sm h-full relative overflow-hidden group flex flex-col hover:border-teal-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity size={120} className="text-teal-600" />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 relative z-10 gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter flex items-center gap-3">
              <Activity className="text-teal-500" size={24} />
              Recovery Percentage
            </h3>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-900 shadow-sm">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-600 min-w-[100px] text-center">
                  {getDisplayDate(currentDate)}
                </span>
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-900 shadow-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {[
                { id: 'days', label: 'Days', icon: CalendarDays },
                { id: 'weeks', label: 'Weeks', icon: CalendarRange },
                { id: 'months', label: 'Months', icon: Calendar },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id as TimeRange)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    timeRange === range.id 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <range.icon size={14} />
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-black tracking-tighter transition-all duration-500 ease-out ${currentScore < 50 ? 'text-red-500' : 'text-teal-600'}`}>
              {currentScore}%
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
          </div>
        </div>

        <div className="h-[250px] w-full relative z-10 flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#0d9488" stopOpacity={1} />
                  <stop offset={off} stopColor="#ef4444" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset={off} stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff', 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{color: '#0f172a', fontWeight: 'bold', fontSize: '12px'}}
                labelStyle={{display: 'none'}}
                formatter={(value: number) => [
                  <span className={value < 50 ? 'text-red-500' : 'text-teal-600'}>{value}%</span>, 
                  'Recovery'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="url(#splitColor)" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#splitFill)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={100} className="text-yellow-400" />
        </div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xl font-black text-white italic tracking-tight flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            Daily Goals
          </h3>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            title={isEditing ? "Save Changes" : "Edit Goals"}
          >
            {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
          </button>
        </div>

        <div className="space-y-4 relative z-10 flex-grow overflow-y-auto max-h-[400px] pr-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                activity.completed && !isEditing
                  ? 'bg-teal-500/20 border-teal-500/50' 
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => deleteActivity(activity.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={activity.label}
                      onChange={(e) => updateActivityLabel(activity.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:border-teal-500 outline-none"
                      placeholder="Goal Name"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Impact:</span>
                      <span className="text-xs font-bold text-teal-500">{activity.impact}%</span>
                      <span className="text-[10px] text-slate-500">(Auto)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => toggleActivity(activity.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`transition-colors duration-300 ${activity.completed ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                      {activity.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <span className={`text-sm font-bold transition-colors duration-300 ${activity.completed ? 'text-white' : 'text-slate-400'}`}>
                      {activity.label}
                    </span>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                    activity.completed ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-500'
                  }`}>
                    +{activity.impact}%
                  </span>
                </button>
              )}
            </div>
          ))}
          
          {isEditing && (
            <button
              onClick={addActivity}
              className="w-full p-3 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Plus size={18} /> Add New Goal
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 relative z-10 flex justify-between items-center">
          <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[60%]">
            {isEditing 
              ? "Customize your daily recovery plan. Adjust impacts to prioritize critical tasks."
              : "Completing daily recovery activities directly impacts your wellness score. Keep up the momentum!"
            }
          </p>
          <div className="flex gap-3">
            <button 
              onClick={handleResetProgress}
              className="bg-slate-800 text-slate-400 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all border border-slate-700 hover:border-red-500/50 flex items-center gap-2 active:scale-95"
              title="Reset Day"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={handleSaveProgress}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20 flex items-center gap-2 active:scale-95"
            >
              <Save size={16} /> Save Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthGraph;
