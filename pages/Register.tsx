
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, UserPlus, Shield, Sparkles, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [err, setErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Use the demo credentials to login instantly.');
      navigate('/login');
    } catch (err: any) {
      setErr(err.response?.data?.message || 'Registration failed. System might be offline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="text-center mb-10">
            <div className="bg-teal-50 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-6">
              <UserPlus className="text-teal-600" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Create Account</h1>
            <p className="text-slate-500 mt-2 font-medium">Join the intelligent healthcare network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {err && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-pulse">! {err}</div>}
            
            <div className="grid grid-cols-2 gap-4">
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, role: 'patient'})}
                 className={`py-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-1 shadow-sm ${formData.role === 'patient' ? 'border-teal-600 bg-teal-50 text-teal-600 scale-105' : 'border-slate-100 text-slate-300 hover:border-slate-200'}`}
               >
                 <User size={20} /> <span className="text-[10px] uppercase tracking-widest">Patient</span>
               </button>
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, role: 'doctor'})}
                 className={`py-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-1 shadow-sm ${formData.role === 'doctor' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 scale-105' : 'border-slate-100 text-slate-300 hover:border-slate-200'}`}
               >
                 <Shield size={20} /> <span className="text-[10px] uppercase tracking-widest">Doctor</span>
               </button>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-2">Full Name / Email Identity</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
                placeholder="John Doe or name@example.com"
                value={formData.username}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({ ...formData, username: val, email: val });
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-2">Security Key</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-teal-700 disabled:bg-slate-300 shadow-xl shadow-teal-100 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest mt-4"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-slate-100">
            <div className="flex items-center gap-2 justify-center mb-6">
              <Sparkles className="text-teal-500" size={14} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Instant Access Credentials</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Patient Profile</p>
                <p className="text-xs font-bold text-slate-700">patient@example.com / password123</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Doctor Profile</p>
                <p className="text-xs font-bold text-slate-700">doctor@example.com / password123</p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs font-medium text-slate-500">
              Already have an account? <Link to="/login" className="text-teal-600 font-black hover:underline underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
