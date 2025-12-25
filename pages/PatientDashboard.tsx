
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { Appointment, MedicalRecord, AppointmentStatus, Vitals } from '../types';
import { Calendar, FileText, Clock, RefreshCw, MessageCircle, Sparkles, Circle, User as UserIcon, Pill, X, Trash2, CalendarDays, ChevronRight, Stethoscope, ClipboardList, HeartPulse, Activity, Thermometer, Weight, ArrowRight, Star, TrendingUp, CheckCircle2, Zap, Edit2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatHub from '../components/ChatHub';
import HealthGraph from '../components/HealthGraph';
import SymptomChecker from '../components/SymptomChecker';
import Footer from '../components/Footer';
/* START ADMIN PORTAL INTEGRATION - Patient Dashboard Admin Sync */
import { adminDataService } from '../admin/AdminDataService';
/* END ADMIN PORTAL INTEGRATION */

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(user?.email, 'patient');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChat, setActiveChat] = useState<{email: string, name: string} | null>(null);
  const [selectedFullReport, setSelectedFullReport] = useState<MedicalRecord | null>(null);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<{doctorId: string, doctorName: string} | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [displayOnline, setDisplayOnline] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [patientProfile, setPatientProfile] = useState({
    bloodGroup: 'B-Negative',
    sensitivities: ['Penicillin', 'Latex', 'Pollen']
  });

  const bloodGroups = ['A-Positive', 'A-Negative', 'B-Positive', 'B-Negative', 'AB-Positive', 'AB-Negative', 'O-Positive', 'O-Negative'];
  const commonSensitivities = ['Penicillin', 'Latex', 'Pollen', 'Peanuts', 'Dust', 'Shellfish', 'Dairy', 'Soy', 'Gluten', 'Aspirin'];

  useEffect(() => {
    // Simulate connection sequence for UI demo
    const timer = setTimeout(() => setDisplayOnline(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!user?.email) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      let apiAppts: Appointment[] = [];
      let apiRecords: MedicalRecord[] = [];

      try {
        const apptsRes = await api.get(`/appointments/patient/${user.email}`);
        apiAppts = apptsRes.data.data || [];
      } catch (e) { /* Local Vault Fallback */ }

      try {
        const recordsRes = await api.get(`/medical/patient/${user.email}`);
        apiRecords = recordsRes.data.records || [];
      } catch (e) { /* Local Vault Fallback */ }

      /* START ADMIN PORTAL INTEGRATION - Sync patient appointments and records with admin */
      // Initialize admin data service
      adminDataService.initializeSystemData();
      
      // Sync all appointments to admin system
      apiAppts.forEach(appt => adminDataService.syncAppointment(appt));
      apiRecords.forEach(rec => adminDataService.syncMedicalRecord(rec));
      /* END ADMIN PORTAL INTEGRATION */

      // Merge API data with Local Vault
      const localAppts = JSON.parse(localStorage.getItem('local_appointments') || '[]')
        .filter((a: any) => a.patientEmail === user.email);
      const localRecords = JSON.parse(localStorage.getItem('local_medical_records') || '[]')
        .filter((r: any) => r.patientEmail === user.email);
      
      const allAppts = [...apiAppts, ...localAppts];
      const uniqueAppts = Array.from(new Map(allAppts.map(item => [item._id, item])).values());
      setAppointments(uniqueAppts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));

      const allRecords = [...apiRecords, ...localRecords];
      const uniqueRecords = Array.from(new Map(allRecords.map(item => [item._id, item])).values());
      setRecords(uniqueRecords.sort((a, b) => new Date(b.recordDate || 0).getTime() - new Date(a.recordDate || 0).getTime()));

      // Mock Vitals for display (as logging is removed)
      setVitals({
        _id: 'v_1',
        patientEmail: user.email,
        bloodPressure: '120/80',
        heartRate: 72,
        weight: 68.5,
        temperature: 98.6,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.warn('Clinical Sync Interrupted.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cancelLocalAppt = (id: string) => {
    if(!window.confirm("Purge appointment record?")) return;
    const localAppts = JSON.parse(localStorage.getItem('local_appointments') || '[]');
    const updated = localAppts.filter((a: any) => a._id !== id);
    localStorage.setItem('local_appointments', JSON.stringify(updated));
    setAppointments(prev => prev.filter(a => a._id !== id));
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedbackModal || !user) return;

    const newReview = {
      id: `rev_${Date.now()}`,
      doctorId: showFeedbackModal.doctorId,
      patientName: user.username,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
      date: 'Just now'
    };

    const existingReviews = JSON.parse(localStorage.getItem('doctor_reviews') || '[]');
    localStorage.setItem('doctor_reviews', JSON.stringify([newReview, ...existingReviews]));

    alert('Feedback submitted successfully!');
    setShowFeedbackModal(null);
    setFeedbackForm({ rating: 5, comment: '' });
  };

  const deleteRecord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(!window.confirm("Remove this medical record from your view?")) return;
    
    // Update local storage
    const localRecords = JSON.parse(localStorage.getItem('local_medical_records') || '[]');
    const updated = localRecords.filter((r: any) => r._id !== id);
    localStorage.setItem('local_medical_records', JSON.stringify(updated));
    
    // Update state
    setRecords(prev => prev.filter(r => r._id !== id));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-teal-600">
      <HeartPulse className="animate-spin mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest animate-pulse">Syncing Patient Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter underline decoration-teal-500/20 underline-offset-[12px]">Patient Profile</h1>
            <RefreshCw size={20} className={`text-teal-500 cursor-pointer hover:rotate-180 transition-transform ${refreshing ? 'animate-spin' : ''}`} onClick={() => fetchData(true)} />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-500 font-medium">{user?.username}</p>
            <span className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 shadow-sm ${displayOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <Circle size={8} fill="currentColor" /> {displayOnline ? 'Online Mode' : 'Offline Mode'}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/book" className="bg-teal-600 text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 hover:bg-teal-700 transition shadow-xl shadow-teal-100 active:scale-95 text-sm uppercase tracking-widest">
            <CalendarDays size={20} /> Book Appointment
          </Link>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Health Graph Section */}
          <HealthGraph />

          {/* Main Appointment Section - Shifted below vitals */}
          <section className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
                <Clock className="text-teal-500" size={28} /> My Appointments
              </h2>
              <span className="bg-slate-100 text-slate-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{appointments.length} Total</span>
            </div>
            
            <div className="space-y-5">
              {appointments.length === 0 ? (
                <div className="text-center py-16 text-slate-400 italic font-medium bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <Calendar className="mx-auto mb-4 opacity-20" size={48} />
                  No clinical encounters synchronized in the master registry.
                </div>
              ) : (
                appointments.map(appt => (
                  <div key={appt._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-teal-200 transition-all hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1 duration-300">
                    <div className="flex items-center gap-6 mb-4 sm:mb-0">
                      <div className="bg-white p-5 rounded-2xl shadow-sm text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                        <UserIcon size={28} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl tracking-tight leading-tight">Dr. {appt.doctorName}</p>
                        <p className="text-[11px] font-black text-teal-600 uppercase tracking-widest mt-1">{appt.specialization}</p>
                        <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Clock size={12} /> {appt.timeSlot} • {(() => {
                            try {
                              if (!appt.appointmentDate) return 'Date Expired';
                              const d = new Date(appt.appointmentDate);
                              return isNaN(d.getTime()) ? 'Date Expired' : d.toLocaleDateString();
                            } catch (e) {
                              return 'Date Expired';
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        appt.status === AppointmentStatus.SCHEDULED ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-teal-50 text-teal-600 border-teal-100'
                      }`}>
                        {appt.status}
                      </span>
                      <div className="flex gap-2">
                        {appt.status === AppointmentStatus.COMPLETED && (
                          <button 
                            onClick={() => setShowFeedbackModal({doctorId: appt.doctorId, doctorName: appt.doctorName})}
                            className="p-4 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white shadow-sm transition active:scale-95 border border-amber-100"
                            title="Leave Feedback"
                          >
                            <Star size={20} />
                          </button>
                        )}
                        <button 
                          onClick={() => setActiveChat({email: appt.doctorEmail, name: appt.doctorName})}
                          className="p-4 rounded-2xl bg-white text-slate-400 hover:text-teal-600 shadow-sm transition active:scale-95 border border-slate-100"
                        >
                          <MessageCircle size={20} />
                        </button>
                        <button 
                          onClick={() => cancelLocalAppt(appt._id)}
                          className="p-4 rounded-2xl bg-white text-slate-400 hover:text-red-500 shadow-sm transition active:scale-95 border border-slate-100"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 italic">
                  <Pill className="text-teal-500" size={24} /> Authorized Reports
                </h2>
                <Link to="/records" className="text-teal-600 font-black text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Vault Archive</Link>
             </div>
             <div className="space-y-2">
                {records.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-lg font-medium italic bg-slate-50 rounded-3xl border border-slate-100">No clinical reports retrieved.</div>
                ) : (
                  records.slice(0, 4).map(rec => (
                    <div key={rec._id} className="p-4 bg-teal-50/30 rounded-xl border border-teal-100/30 flex justify-between items-center hover:bg-teal-50 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-md" onClick={() => setSelectedFullReport(rec)}>
                       <div className="flex flex-col gap-1">
                          <p className="font-black text-slate-900 text-sm tracking-tight leading-none mb-1">{rec.recordType} <span className="text-xs text-teal-600 opacity-60 ml-1 font-bold">Dr. {rec.doctorName}</span></p>
                          <p className="text-xs font-bold text-slate-500 truncate max-w-[280px] italic">"{rec.diagnosis}"</p>
                          <button className="mt-2 text-[10px] font-black text-teal-600 uppercase tracking-[0.1em] flex items-center gap-1 group-hover:translate-x-1 transition-transform">View Full Report <ChevronRight size={12} /></button>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-black text-teal-600 border border-teal-100 uppercase tracking-tighter shadow-sm shrink-0">{new Date(rec.recordDate).toLocaleDateString()}</div>
                         <button 
                            onClick={(e) => deleteRecord(e, rec._id)}
                            className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg border border-slate-100 hover:border-red-100 transition-colors shadow-sm"
                            title="Remove Record"
                         >
                            <X size={14} />
                         </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200 group cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setShowSymptomChecker(true)}>
            <div className="relative z-10">
              <div className="bg-teal-500 w-16 h-16 flex items-center justify-center rounded-[1.5rem] mb-8 shadow-xl shadow-teal-500/20 group-hover:scale-110 transition-transform duration-500">
                <Sparkles size={32} />
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter mb-4">AI Symptom Checker</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Feeling unwell? Our advanced AI can analyze your symptoms and suggest potential causes instantly.</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 group-hover:bg-white/10 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">System Ready</span>
                 </div>
                 <ArrowRight size={16} className="text-teal-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-teal-500/20 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-[60px]"></div>
          </section>

          <section className="bg-red-50 rounded-[3.5rem] p-10 border border-red-100 hover:bg-red-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative group">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-red-900 font-black text-xl italic flex items-center gap-3 tracking-tight">Clinical Advisory</h3>
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="p-2 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all border border-red-100"
              >
                {isEditingProfile ? <Check size={16} /> : <Edit2 size={16} />}
              </button>
            </div>
            
            <p className="text-red-700 text-sm font-medium leading-relaxed italic mb-8">"Persistent monitoring of scheduled encounters ensures optimal care coordination within the network."</p>
            
            <div className="bg-white border border-red-200 p-6 rounded-[2rem] shadow-sm">
               <p className="text-[10px] font-black uppercase text-red-600 mb-2 tracking-[0.1em]">Patient Identity</p>
               
               {isEditingProfile ? (
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-red-400 uppercase mb-1 block">Blood Group</label>
                     <select 
                        value={patientProfile.bloodGroup}
                        onChange={(e) => setPatientProfile({...patientProfile, bloodGroup: e.target.value})}
                        className="w-full p-2 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-900 outline-none focus:ring-2 focus:ring-red-200"
                     >
                       {bloodGroups.map(bg => (
                         <option key={bg} value={bg}>{bg}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-red-400 uppercase mb-1 block">Sensitivities</label>
                     <div className="flex flex-wrap gap-2">
                       {commonSensitivities.map(allergy => (
                         <button
                           key={allergy}
                           onClick={() => {
                             const current = patientProfile.sensitivities;
                             const updated = current.includes(allergy) 
                               ? current.filter(s => s !== allergy)
                               : [...current, allergy];
                             setPatientProfile({...patientProfile, sensitivities: updated});
                           }}
                           className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                             patientProfile.sensitivities.includes(allergy)
                               ? 'bg-red-500 text-white border-red-500'
                               : 'bg-white text-red-400 border-red-100 hover:border-red-300'
                           }`}
                         >
                           {allergy}
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
               ) : (
                 <>
                   <p className="text-lg font-black text-slate-900 tracking-tight">Blood Group: <span className="text-red-600">{patientProfile.bloodGroup}</span></p>
                   <div className="h-px bg-red-50 my-4"></div>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 opacity-60">Known Sensitivities</p>
                   <div className="flex flex-wrap gap-2">
                     {patientProfile.sensitivities.length > 0 ? (
                       patientProfile.sensitivities.map(s => (
                         <span key={s} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-100">
                           {s}
                         </span>
                       ))
                     ) : (
                       <span className="text-xs text-slate-400 italic">None recorded</span>
                     )}
                   </div>
                 </>
               )}
            </div>
          </section>
        </div>
      </div>

      {/* Detailed Report Modal */}
      {selectedFullReport && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedFullReport(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
             <button onClick={() => setSelectedFullReport(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 p-2 bg-slate-50 rounded-xl transition-all">
                <X size={20} />
             </button>
             
             <div className="flex items-center gap-5 mb-8">
                <div className="bg-teal-600 text-white p-4 rounded-2xl shadow-lg shadow-teal-200">
                  <ClipboardList size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 leading-none">{selectedFullReport.recordType}</h3>
                   <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest mt-1.5 flex items-center gap-1.5"><Circle size={6} fill="currentColor" /> Authorized Clinical Record</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Practitioner</p>
                      <p className="text-base font-black text-slate-900">Dr. {selectedFullReport.doctorName}</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date Verified</p>
                      <p className="text-base font-black text-slate-900">{new Date(selectedFullReport.recordDate).toLocaleDateString()}</p>
                   </div>
                </div>

                <section>
                   <div className="flex items-center gap-3 mb-4">
                      <Stethoscope size={18} className="text-teal-600" />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Findings</h4>
                   </div>
                   <div className="bg-teal-50/30 p-8 rounded-[2rem] border border-teal-100/50">
                      <p className="text-[11px] font-black text-teal-600 uppercase tracking-widest mb-2 italic">Diagnosis:</p>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed italic mb-6">"{selectedFullReport.diagnosis}"</p>
                      
                      <p className="text-[11px] font-black text-teal-600 uppercase tracking-widest mb-2 italic">Treatment Plan:</p>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed italic">"{selectedFullReport.treatment}"</p>
                   </div>
                </section>

                {selectedFullReport.medications && selectedFullReport.medications.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Pill size={18} className="text-teal-600" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Prescribed Medications</h4>
                    </div>
                    <div className="space-y-3">
                        {selectedFullReport.medications.map((med, i) => (
                           <div key={i} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                              <div>
                                 <p className="font-black text-slate-900 text-sm tracking-tight">{med.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{med.dosage} • {med.frequency}</p>
                              </div>
                              <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">{med.duration}</div>
                           </div>
                        ))}
                    </div>
                  </section>
                )}
             </div>

             <div className="pt-8 mt-4 border-t border-slate-100">
                <button 
                  onClick={() => window.print()} 
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition shadow-xl text-xs uppercase tracking-widest"
                >
                  Download Formal PDF
                </button>
             </div>
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

      {showSymptomChecker && (
        <SymptomChecker onClose={() => setShowSymptomChecker(false)} />
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl">
          <div className="bg-white w-[350px] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter text-slate-900 mb-1">Rate Experience</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dr. <span className="text-amber-600">{showFeedbackModal.doctorName}</span></p>
              </div>
              <button onClick={() => setShowFeedbackModal(null)} className="bg-slate-50 p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitFeedback} className="space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className={`transition-transform hover:scale-110 ${star <= feedbackForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                  >
                    <Star size={32} />
                  </button>
                ))}
              </div>
              <textarea 
                required 
                className="w-full p-4 bg-slate-50 rounded-2xl font-medium border-none resize-none text-xs min-h-[100px] outline-none focus:bg-slate-100 transition-colors" 
                placeholder="Share your experience..." 
                value={feedbackForm.comment} 
                onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})} 
              />
              <button type="submit" className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-amber-600 transition active:scale-95 text-xs uppercase tracking-widest">Submit Feedback</button>
            </form>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default PatientDashboard;
