
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { Appointment, AppointmentStatus, MedicalRecord } from '../types';
import { Calendar, Users, Clipboard, CheckCircle, XCircle, FilePlus, X, Bell, HeartPulse, RefreshCw, ChevronRight, MessageCircle, Circle, ShieldCheck, Star, TrendingUp, Activity, Save } from 'lucide-react';
import ChatHub from '../components/ChatHub';
import Footer from '../components/Footer';
/* START ADMIN PORTAL INTEGRATION - Doctor Dashboard Admin Sync */
import { adminDataService } from '../admin/AdminDataService';
/* END ADMIN PORTAL INTEGRATION */

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(user?.email, 'doctor');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newApptAlert, setNewApptAlert] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetPatient, setTargetPatient] = useState<{name: string, email: string} | null>(null);
  const [activeChat, setActiveChat] = useState<{email: string, name: string} | null>(null);
  const [displayOnline, setDisplayOnline] = useState(false);

  useEffect(() => {
    // Simulate connection sequence for UI demo
    const timer = setTimeout(() => setDisplayOnline(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Mock Profile Data (In a real app, this would come from the API)
  const [profileStats, setProfileStats] = useState({
    isVerified: true,
    rating: 4.8,
    totalReviews: 124,
    successfulTreatments: 89,
    recentReviews: [
      { id: '1', patientName: 'Sarah J.', rating: 5, comment: 'Very professional and kind.', date: '2 days ago' },
      { id: '2', patientName: 'Mike T.', rating: 4, comment: 'Good diagnosis, but wait time was long.', date: '1 week ago' }
    ]
  });

  useEffect(() => {
    // Load reviews from local storage and merge with mock data
    const localReviews = JSON.parse(localStorage.getItem('doctor_reviews') || '[]');
    // Filter reviews for this doctor (assuming user.email matches doctorId or similar logic - for mock we just show all)
    // In a real app, we would filter by doctorId. Here we just prepend them.
    if (localReviews.length > 0) {
      setProfileStats(prev => ({
        ...prev,
        recentReviews: [...localReviews, ...prev.recentReviews],
        totalReviews: prev.totalReviews + localReviews.length
      }));
    }
  }, []);

  const [recordForm, setRecordForm] = useState({
    recordType: 'Prescription',
    diagnosis: '',
    treatment: '',
    meds: ''
  });

  const fetchAppointments = useCallback(async (isSilent = false) => {
    if (!user?.email) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      
      let apiList: Appointment[] = [];
      try {
        const res = await api.get(`/appointments/doctor/${user.email}`);
        apiList = res.data.data || [];
      } catch (e) { /* Silent Network Fallback */ }
      
      const localSync = JSON.parse(localStorage.getItem('local_appointments') || '[]')
        .filter((a: any) => a.doctorEmail === user.email);
      
      const allAppts = [...apiList, ...localSync];
      const uniqueAppts = Array.from(new Map(allAppts.map(item => [item._id, item])).values());

      /* START ADMIN PORTAL INTEGRATION - Sync doctor appointments with admin */
      adminDataService.initializeSystemData();
      uniqueAppts.forEach(appt => adminDataService.syncAppointment(appt));
      /* END ADMIN PORTAL INTEGRATION */

      setAppointments(uniqueAppts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      console.warn('Sync Protocol Interrupted. Operating in Local Node.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_appointment', (newAppt: any) => {
      setAppointments(prev => [newAppt, ...prev]);
      setNewApptAlert(`Incoming reservation from ${newAppt.patientName}`);
      setTimeout(() => setNewApptAlert(null), 8000);
    });

    socket.on('receive_direct_message', (msg: any) => {
      if (activeChat?.email !== msg.senderEmail) {
         setNewApptAlert(`New message from patient ${msg.senderName}`);
         setTimeout(() => setNewApptAlert(null), 8000);
      }
    });

    return () => {
      socket.off('new_appointment');
      socket.off('receive_direct_message');
    };
  }, [socket, activeChat]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      await api.put(`/appointments/${id}`, { status, updatedBy: user?.username });
      
      const localSync = JSON.parse(localStorage.getItem('local_appointments') || '[]');
      const updatedLocal = localSync.map((a: any) => a._id === id ? { ...a, status } : a);
      localStorage.setItem('local_appointments', JSON.stringify(updatedLocal));
    } catch (err) { 
      // Ensure state is updated locally regardless
      const localSync = JSON.parse(localStorage.getItem('local_appointments') || '[]');
      const updatedLocal = localSync.map((a: any) => a._id === id ? { ...a, status } : a);
      localStorage.setItem('local_appointments', JSON.stringify(updatedLocal));
    }
  };

  const createRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatient || !user) return;
    
    setIsSubmitting(true);

    const medications = recordForm.meds.split(',').map(m => ({
      name: m.trim(),
      dosage: '1 Tab',
      frequency: 'Stat',
      duration: '7 Days'
    }));

    const newRecord: MedicalRecord = {
      _id: `rec_${Date.now()}`,
      patientEmail: targetPatient.email,
      doctorName: user.username,
      doctorEmail: user.email,
      recordType: recordForm.recordType,
      diagnosis: recordForm.diagnosis,
      treatment: recordForm.treatment,
      medications,
      recordDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      await api.post('/medical', newRecord);
      /* START ADMIN PORTAL INTEGRATION - Sync medical record with admin */
      adminDataService.syncMedicalRecord(newRecord);
      /* END ADMIN PORTAL INTEGRATION */
      // Success handled in UI via isSubmitting check
    } catch (err) { 
      // Persist to Local Vault for Cross-Role Reflection
      const localRecords = JSON.parse(localStorage.getItem('local_medical_records') || '[]');
      localStorage.setItem('local_medical_records', JSON.stringify([...localRecords, newRecord]));
      /* START ADMIN PORTAL INTEGRATION - Sync to admin on local fallback */
      adminDataService.syncMedicalRecord(newRecord);
      /* END ADMIN PORTAL INTEGRATION */
    } finally {
      // Delay closing to show success message
      setTimeout(() => {
        setIsSubmitting(false);
        setShowModal(false);
        setRecordForm({ recordType: 'Prescription Protocol', diagnosis: '', treatment: '', meds: '' });
      }, 1500);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-blue-600">
      <HeartPulse className="animate-spin mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest animate-pulse">Scanning Clinical Registry...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {newApptAlert && (
          <div className="fixed top-24 right-8 z-[100] bg-slate-900 text-white p-6 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500 border border-slate-700 flex items-center gap-5">
            <div className="bg-blue-600 p-3 rounded-xl animate-pulse shadow-lg shadow-blue-500/50">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black italic uppercase tracking-widest text-[10px] text-blue-400 mb-1">Clinic Sync</p>
              <p className="font-bold text-sm tracking-tight">{newApptAlert}</p>
            </div>
          </div>
        )}

        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white p-3 rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50 group hover:scale-105 transition-transform duration-300">
                <Activity className="text-blue-600 group-hover:animate-pulse" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">Medical Command Center</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Manage appointments, records, and patient feedback.</p>
              </div>
              <RefreshCw size={20} className={`text-slate-400 cursor-pointer hover:text-blue-600 hover:rotate-180 transition-all ${refreshing ? 'animate-spin text-blue-600' : ''}`} onClick={() => fetchAppointments(true)} />
            </div>
            <div className="flex items-center gap-4 ml-2">
              <span className="px-4 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                {user?.username?.startsWith('Dr.') ? user.username : `Dr. ${user?.username}`}
              </span>
              <span className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 shadow-sm ${displayOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <Circle size={8} fill="currentColor" /> {displayOnline ? 'Online Mode' : 'Offline Mode'}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-900 px-8 py-6 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 flex gap-8 items-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-center relative z-10">
              <p className="text-4xl font-black text-white mb-1">{appointments.length}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Active Cases</p>
            </div>
            <div className="h-12 w-px bg-slate-700"></div>
            <div className="text-center relative z-10">
              <p className="text-4xl font-black text-blue-400 mb-1">{appointments.filter(a => a.status === 'Pending').length}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Pending</p>
            </div>
          </div>
        </header>

        {/* Professional Tools Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Profile Verification Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-100/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl shadow-sm ${profileStats.isVerified ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 italic tracking-tight">Verification</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${profileStats.isVerified ? 'text-blue-600' : 'text-slate-400'}`}>
                    {profileStats.isVerified ? 'Verified MD' : 'Pending Review'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Medical License</span>
                  <CheckCircle size={18} className="text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Board Cert.</span>
                  <CheckCircle size={18} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Case History Analytics */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 group hover:-translate-y-1 transition-transform duration-300 border border-slate-800">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black italic tracking-tight flex items-center gap-2">
                  <TrendingUp className="text-blue-400" size={20} /> Performance
                </h3>
                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5">Monthly</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Success</p>
                  <p className="text-2xl font-black text-white">{Math.round((profileStats.successfulTreatments / (appointments.length || 1)) * 100)}%</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Volume</p>
                  <p className="text-2xl font-black text-blue-400">{appointments.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-black/20 p-3 rounded-xl border border-white/5">
                <Activity size={12} className="text-blue-400" />
                <span>Top 5% in patient recovery speed</span>
              </div>
            </div>
          </div>

          {/* Patient Feedback & Ratings - REDESIGNED */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 italic tracking-tight flex items-center gap-2">
                  Patient Voice
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recent Feedback</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-slate-900">{profileStats.rating}</span>
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{profileStats.totalReviews} Reviews</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[200px]">
              {profileStats.recentReviews.map((review) => (
                <div key={review.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-md shadow-blue-200">
                        {review.patientName.charAt(0)}
                      </div>
                      <p className="font-bold text-slate-900 text-xs">{review.patientName}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-full border border-slate-100">{review.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-2 pl-8 relative">
                    <span className="absolute left-2 top-0 text-slate-300 text-xl font-serif">"</span>
                    {review.comment}
                  </p>
                  <div className="flex gap-0.5 pl-8">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outcome Tracking & Analytics - REMOVED */}

        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10">
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-white">
            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Appointment Registry</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Real-time patient queue and status monitoring</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.length === 0 ? (
                  <tr><td colSpan={4} className="px-12 py-20 text-center text-slate-400 font-medium italic">No synchronized appointments in master queue.</td></tr>
                ) : (
                  appointments.map(appt => (
                    <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xs group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200">
                            {appt.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{appt.patientName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{appt.patientEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">{appt.timeSlot}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            {(() => {
                              try {
                                if (!appt.appointmentDate) return 'Date Expired';
                                const d = new Date(appt.appointmentDate);
                                return isNaN(d.getTime()) ? 'Date Expired' : d.toLocaleDateString();
                              } catch (e) {
                                return 'Date Expired';
                              }
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          (appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.PENDING) ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.PENDING) ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></span>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setActiveChat({email: appt.patientEmail, name: appt.patientName})}
                            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200 active:scale-95"
                            title="Direct Messaging"
                          >
                            <MessageCircle size={18} />
                          </button>
                          {(appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.PENDING) && (
                            <>
                              <button 
                                onClick={() => { setTargetPatient({name: appt.patientName, email: appt.patientEmail}); setShowModal(true); }} 
                                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 hover:shadow-md"
                                title="Create Record"
                              >
                                <FilePlus size={18} />
                              </button>
                              <button 
                                onClick={() => updateStatus(appt._id, AppointmentStatus.COMPLETED)} 
                                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 hover:shadow-md"
                                title="Complete Appointment"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[325px] rounded-[1.75rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-slate-900 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-indigo-900/40"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black italic tracking-tight text-white mb-0.5">Clinical Report</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Patient: <span className="text-blue-400">{targetPatient?.name}</span></p>
                </div>
                <button onClick={() => setShowModal(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition text-white">
                  <X size={14} />
                </button>
              </div>
            </div>
            
            <form onSubmit={createRecord} className="p-4 space-y-2.5 relative">
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-200">
                  <div className="bg-blue-50 p-3 rounded-full mb-3 animate-bounce">
                    <CheckCircle size={24} className="text-blue-500" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 italic mb-1">Transmitting...</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Secure Record Sent Successfully</p>
                </div>
              )}
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Record Type</label>
                <div className="relative">
                  <select disabled={isSubmitting} className="w-full p-2.5 bg-slate-50 rounded-xl font-bold text-slate-700 text-[11px] appearance-none cursor-pointer outline-none border border-slate-100 focus:border-blue-500 transition-colors disabled:opacity-50" value={recordForm.recordType} onChange={e => setRecordForm({...recordForm, recordType: e.target.value})}>
                    <option>Prescription Protocol</option>
                    <option>Diagnostic Review</option>
                    <option>Lab Requisition</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Activity size={12} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Diagnosis</label>
                <textarea disabled={isSubmitting} required className="w-full p-2.5 bg-slate-50 rounded-xl font-medium text-slate-700 border border-slate-100 resize-none text-[11px] min-h-[50px] outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50" placeholder="Enter clinical diagnosis..." value={recordForm.diagnosis} onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})} />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Treatment Plan</label>
                <textarea disabled={isSubmitting} required className="w-full p-2.5 bg-slate-50 rounded-xl font-medium text-slate-700 border border-slate-100 resize-none text-[11px] min-h-[50px] outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50" placeholder="Outline treatment steps..." value={recordForm.treatment} onChange={e => setRecordForm({...recordForm, treatment: e.target.value})} />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Medications</label>
                <input disabled={isSubmitting} className="w-full p-2.5 bg-slate-50 rounded-xl font-bold text-slate-700 border border-slate-100 text-[11px] outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50" placeholder="e.g. Amoxicillin 500mg..." value={recordForm.meds} onChange={e => setRecordForm({...recordForm, meds: e.target.value})} />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 text-white font-black py-3 rounded-xl shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-1 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {isSubmitting ? 'Processing...' : 'Transmit Secure Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeChat && (
        <ChatHub 
          socket={socket} 
          receiverEmail={activeChat.email} 
          receiverName={activeChat.name}
          isOnline={isConnected} 
          onClose={() => setActiveChat(null)}
        />
      )}
      </div>
      <Footer />
    </div>
  );
};

export default DoctorDashboard;
