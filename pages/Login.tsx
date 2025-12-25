
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Stethoscope, AlertCircle, Sparkles, UserCheck, HeartPulse, Github } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setIsLoading(true);
    setTimeout(() => {
      // Simulate a successful login with a new patient account
      const newPatient = {
        id: 'social-' + Date.now(),
        username: provider === 'google' ? 'Google User' : 'GitHub User',
        email: provider === 'google' ? 'google_user@example.com' : 'github_user@example.com',
        role: 'patient'
      };
      login(newPatient, 'social-token-' + Date.now());
      navigate('/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      // Robust Fallback Interceptor
      
      // Check against local storage demo data
      const patients = JSON.parse(localStorage.getItem('registered_patients') || '[]');
      const doctors = JSON.parse(localStorage.getItem('registered_doctors') || '[]');
      
      const foundPatient = patients.find((p: any) => p.email === email && p.password === password);
      if (foundPatient) {
        login({ ...foundPatient, role: 'patient' }, 'demo-token-' + foundPatient.id);
        navigate('/dashboard');
        return;
      }

      const foundDoctor = doctors.find((d: any) => d.email === email && d.password === password);
      if (foundDoctor) {
        login({ ...foundDoctor, role: 'doctor' }, 'demo-token-' + foundDoctor.id);
        navigate('/dashboard');
        return;
      }

      if (email === 'patient@example.com' && password === 'MedicareDemo@2025') {
        login({ 
          id: '507f1f77bcf86cd799439011', 
          username: 'Demo Patient', 
          email: 'patient@example.com', 
          role: 'patient' 
        }, 'demo-token');
        navigate('/dashboard');
        return;
      }
      if (email === 'doctor@example.com' && password === 'MedicareDemo@2025') {
        login({ 
          id: '507f1f77bcf86cd799439022', 
          username: 'Dr. Mohit', 
          email: 'doctor@example.com', 
          role: 'doctor' 
        }, 'demo-token');
        navigate('/dashboard');
        return;
      }
      setErr(err.response?.data?.message || 'Login failed. Try Trial Access below.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="md:w-1/2 bg-teal-600 flex flex-col items-center justify-start pt-12 p-8 md:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/20 p-5 rounded-[2rem] w-fit mb-10 shadow-2xl backdrop-blur-xl border border-white/20">
            <HeartPulse size={48} className="text-white animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight italic tracking-tighter">Unified Care.</h2>
          <p className="text-teal-50 text-xl mb-12 opacity-90 font-medium leading-relaxed max-w-sm">
            The intelligent clinical engine for modern providers and patients.
          </p>
          <div className="flex items-center gap-4 bg-slate-900/20 p-5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="w-3 h-3 bg-teal-300 rounded-full animate-ping"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em]">WELCOME TO MEDICAL CARE</p>
          </div>
        </div>
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-teal-500 rounded-full blur-[150px] opacity-40"></div>
      </div>

      <div className="md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="max-w-md w-full">
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter italic">Clinical Login</h1>
            <p className="text-slate-500 font-medium">Synchronize your records and manage patient flow.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 mb-12 bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100">
            {err && (
              <div className="bg-red-50 text-red-600 p-5 rounded-3xl text-xs font-black border border-red-100 flex items-center gap-4">
                <AlertCircle className="shrink-0" size={20} />
                {err}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Email ID</label>
              <input
                type="email"
                required
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-3xl outline-none transition-all font-black text-slate-800 text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Passkey</label>
              <input
                type="password"
                required
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-3xl outline-none transition-all font-black text-slate-800 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black hover:bg-slate-800 disabled:bg-slate-300 shadow-2xl transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em]"
            >
              {isLoading ? 'Processing...' : <>SIGN IN <ArrowRight size={20} /></>}
            </button>

            <div className="relative flex py-2 items-center mt-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-slate-700 font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 py-4 bg-[#24292F] text-white rounded-[1.5rem] hover:bg-black hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                <Github size={20} />
                GitHub
              </button>
            </div>
          </form>

          <div className="pt-10 border-t-2 border-slate-100">
            <div className="flex items-center gap-3 justify-center mb-8">
              <Sparkles className="text-teal-500" size={18} />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic text-center">Trial & Demo Hub</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] hover:border-teal-500/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 shadow-sm border border-teal-100"><User size={24} /></div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Patient Profile</span>
                      <p className="text-base font-black text-slate-900">Demo Patient</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 text-[9px] font-black">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 uppercase mb-1">Email</p>
                    <p className="text-slate-800 truncate">patient@example.com</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 uppercase mb-1">Password</p>
                    <p className="text-slate-800">MedicareDemo@2025</p>
                  </div>
                </div>
                <button onClick={() => fillDemo('patient@example.com', 'MedicareDemo@2025')} className="w-full py-5 bg-teal-50 text-teal-600 rounded-[1.5rem] text-[10px] font-black uppercase hover:bg-teal-600 hover:text-white transition-all">Load Patient Profile</button>
              </div>

              <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] hover:border-indigo-500/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100"><Stethoscope size={24} /></div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Doctor Profile</span>
                      <p className="text-base font-black text-slate-900">Dr. Mohit</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 text-[9px] font-black">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 uppercase mb-1">Email</p>
                    <p className="text-slate-800 truncate">doctor@example.com</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 uppercase mb-1">Password</p>
                    <p className="text-slate-800">MedicareDemo@2025</p>
                  </div>
                </div>
                <button onClick={() => fillDemo('doctor@example.com', 'MedicareDemo@2025')} className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">Load Doctor Profile</button>
              </div>
            </div>

            <div className="mt-12 text-center">
               <p className="text-sm text-slate-500 font-medium">New to MyHealth? <Link to="/register" className="text-teal-600 font-black hover:underline underline-offset-8">Join the network</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
