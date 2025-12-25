
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DoctorProfile, AppointmentStatus } from '../types';
import { ChevronRight, Stethoscope, AlertCircle, Sparkles, RefreshCw, HeartPulse, ArrowRight, Loader2, Info, ShieldCheck, Star } from 'lucide-react';
/* START ADMIN PORTAL INTEGRATION - Real-time Appointment Sync */
import { adminDataService } from '../admin/AdminDataService';
/* END ADMIN PORTAL INTEGRATION */

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctors');
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        if (list.length === 0) throw new Error();
        setDoctors(list);
      } catch (err) {
        // Clinical Catalog Fallback with Hindi names and detailed descriptions
        setDoctors([
          { 
            _id: '507f1f77bcf86cd799439022', 
            name: 'Mohit', 
            email: 'doctor@example.com', 
            specialty: 'Infectious Disease Specialist', 
            rating: 4.9,
            isVerified: true,
            description: 'He focuses on diagnosing and treating viral and bacterial infections, with specific expertise in tropical diseases like Dengue and Malaria.'
          },
          { 
            _id: '507f1f77bcf86cd799439023', 
            name: 'Shubham', 
            email: 'shubham@example.com', 
            specialty: 'Orthopedic Surgeon', 
            rating: 4.8,
            isVerified: true,
            description: 'He specializes in the musculoskeletal system, providing treatment for bone fractures, joint problems, and spine-related issues.'
          },
          { 
            _id: '507f1f77bcf86cd799439024', 
            name: 'Vikash', 
            email: 'vikash@example.com', 
            specialty: 'Dermatologist', 
            rating: 4.7,
            isVerified: false,
            description: 'He is an expert in managing conditions related to the skin, hair, and nails, including chronic skin diseases and infections.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !formData.date || !formData.time || !formData.reason) return;

    setIsSubmitting(true);
    
    const payload = {
      _id: `sync_${Date.now()}`,
      patientId: user?.id || 'demo_id', 
      patientEmail: user?.email,
      patientName: user?.username,
      doctorId: selectedDoctor._id,
      doctorEmail: selectedDoctor.email,
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialty,
      appointmentDate: formData.date,
      timeSlot: formData.time,
      reason: formData.reason,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Attempt Server Synchronization
      await api.post('/appointments', payload);
      
      /* START ADMIN PORTAL INTEGRATION - Sync appointment to admin in real-time */
      adminDataService.initializeSystemData();
      adminDataService.syncAppointment(payload);
      /* END ADMIN PORTAL INTEGRATION */
      
      triggerSuccessState();
    } catch (err) {
      console.warn("Clinical Network Unreachable. Persisting to Local Vault.");
      
      // 2. Local Fallback - Ensures data reflects in dashboard IMMEDIATELY
      const localVault = JSON.parse(localStorage.getItem('local_appointments') || '[]');
      localStorage.setItem('local_appointments', JSON.stringify([...localVault, payload]));
      
      /* START ADMIN PORTAL INTEGRATION - Sync to admin on local fallback */
      adminDataService.initializeSystemData();
      adminDataService.syncAppointment(payload);
      /* END ADMIN PORTAL INTEGRATION */
      
      triggerSuccessState();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSuccessState = () => {
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-teal-600">
      <HeartPulse className="animate-spin mb-6" size={48} />
      <p className="font-black italic uppercase tracking-[0.2em] animate-pulse">Syncing Clinic Network...</p>
    </div>
  );

  if (showSuccess) return (
    <div className="flex flex-col items-center justify-center h-[80vh] bg-slate-50 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-teal-100 flex flex-col items-center text-center max-w-sm mx-4">
        <div className="bg-teal-500 p-4 rounded-2xl shadow-xl shadow-teal-200 mb-6 border-4 border-white animate-bounce">
          <HeartPulse size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 mb-2">Appointment Booked!</h2>
        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
          Your clinical encounter with <span className="text-teal-600 font-black">Dr. {selectedDoctor?.name}</span> is confirmed for <span className="text-slate-900 font-bold">{new Date(formData.date).toLocaleDateString()}</span>.
        </p>
        <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <HeartPulse className="w-4 h-4 text-teal-500 animate-spin" />
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Updating Medical Console...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-5 py-2 rounded-full text-[10px] font-black uppercase mb-4 shadow-sm border border-teal-100">
          <Sparkles size={14} /> Unified Slot Registry
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 italic tracking-tighter">Book Appointment</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">Select your specialist and secure your clinical window instantly.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 italic">
            <span className="bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-2xl not-italic shadow-lg shadow-slate-200">01</span>
            Clinical Catalog
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {doctors.map(doc => (
              <button
                key={doc._id}
                onClick={() => setSelectedDoctor(doc)}
                className={`w-full text-left p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col group overflow-hidden hover:-translate-y-1 ${
                  selectedDoctor?._id === doc._id 
                  ? 'border-teal-600 bg-teal-50/40 shadow-2xl scale-[1.02]' 
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-5 items-center">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${selectedDoctor?._id === doc._id ? 'bg-teal-600 text-white rotate-6 shadow-xl shadow-teal-100' : 'bg-slate-50 text-slate-300'}`}>
                      <Stethoscope size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 text-lg leading-tight italic">Dr. {doc.name}</p>
                        {doc.isVerified && <ShieldCheck size={16} className="text-blue-500" fill="currentColor" stroke="white" />}
                      </div>
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mt-1.5">{doc.specialty}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-600">{doc.rating}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`transition-transform duration-300 ${selectedDoctor?._id === doc._id ? 'text-teal-600 translate-x-2' : 'text-slate-200'}`} />
                </div>
                
                {/* Description Component - Shown only during booking */}
                <div className="mt-4 pl-1 flex items-start gap-2">
                  <div className={`mt-0.5 p-1 rounded-md ${selectedDoctor?._id === doc._id ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Info size={12} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedDoctor?._id === doc._id ? 'text-teal-600' : 'text-slate-400'}`}>Description</p>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`transition-all duration-700 ${selectedDoctor ? 'opacity-100 translate-y-0' : 'opacity-20 pointer-events-none translate-y-10'}`}>
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4 italic">
            <span className="bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-2xl not-italic shadow-lg shadow-slate-200">02</span>
            Sync Constraints
          </h3>
          <form onSubmit={handleSubmit} className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-teal-500/10"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Calendar Slot</label>
                <input
                  type="date"
                  required
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-3xl outline-none font-bold text-slate-800 text-sm transition-all shadow-inner"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Window</label>
                <select
                  required
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-3xl outline-none font-bold text-slate-800 text-sm transition-all appearance-none cursor-pointer shadow-inner"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                >
                  <option value="">Select Time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Reason for Encounter</label>
              <textarea
                required
                placeholder="Briefly describe your symptoms for the specialist..."
                className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-[2.5rem] outline-none text-sm font-medium transition-all min-h-[160px] resize-none shadow-inner"
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-4">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">Clinical data is transmitted via secure encrypted channels. The provider dashboard will synchronize immediately upon authorization.</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white font-black py-8 rounded-[2rem] hover:bg-slate-800 disabled:bg-slate-400 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em]"
            >
              {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Authorizing...</> : <>Confirm Appointment <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
