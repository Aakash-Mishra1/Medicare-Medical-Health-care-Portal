import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminContext';
import { ArrowRight, AlertCircle, HeartPulse, ShieldCheck, Lock, User } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { login, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ensure fresh session on mount
  useEffect(() => {
    logout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setIsLoading(true);

    try {
      // Demo admin fallback
      if (email === 'admin@example.com' && password === 'admin123') {
        login(
          {
            id: '507f1f77bcf86cd799439033',
            username: 'Admin',
            email: 'admin@example.com',
            role: 'admin',
            department: 'System Administration'
          },
          'admin-demo-token'
        );
        navigate('/admin/dashboard');
        return;
      }

      setErr('Invalid credentials. Use demo account below.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Section - Purple Theme matching Navbar Button */}
      <div className="md:w-1/2 bg-[#7c3aed] flex flex-col items-center justify-center p-8 md:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-md w-full space-y-8">
          <div className="bg-white/20 p-5 rounded-[2rem] w-fit shadow-2xl backdrop-blur-xl border border-white/20">
            <HeartPulse size={48} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 leading-tight italic tracking-tighter">Unified Care.</h2>
            <p className="text-purple-50 text-xl opacity-90 font-medium leading-relaxed max-w-sm">
              The intelligent clinical engine for modern providers and patients.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-[#4c1d95]/40 p-4 rounded-full border border-white/10 backdrop-blur-sm w-fit">
              <div className="w-3 h-3 bg-purple-300 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em]">WELCOME TO MEDICAL CARE</p>
            </div>
            
            <div className="flex items-center gap-2 text-purple-200/80">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">256-bit Encryption Active</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-[#4c1d95] rounded-full blur-[150px] opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      {/* Right Section - Login Form */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto bg-white">
        <div className="max-w-md w-full">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic">Clinical Login</h1>
            <p className="text-slate-500 font-medium">Synchronize your records and manage patient flow.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 mb-10 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
            {/* Security Badge on Form */}
            <div className="absolute top-0 right-0 bg-slate-100 px-4 py-2 rounded-bl-2xl">
              <Lock size={14} className="text-slate-400" />
            </div>

            {err && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black border border-red-100 flex items-center gap-3">
                <AlertCircle className="shrink-0" size={18} />
                {err}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Email ID</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#7c3aed] focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Passkey</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#7c3aed] focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm tracking-widest"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0f172a] text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border border-purple-100 rounded-[2rem] p-6 bg-white shadow-lg shadow-purple-50/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ADMIN PROFILE</p>
                <h3 className="text-xl font-black text-slate-900">Demo Admin</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">EMAIL</p>
                <p className="text-sm font-bold text-slate-900 truncate">admin@example.com</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PASSWORD</p>
                <p className="text-sm font-bold text-slate-900">admin123</p>
              </div>
            </div>

            <button 
              type="button"
              onClick={fillDemo}
              className="w-full py-5 bg-purple-50 text-purple-600 rounded-[1.5rem] text-[10px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              LOAD ADMIN PROFILE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
