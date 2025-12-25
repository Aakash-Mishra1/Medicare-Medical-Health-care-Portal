
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavigationControls: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Hide controls on landing, login, and register pages for a cleaner entry look
  const hideOnPaths = ['/', '/login', '/register'];
  if (hideOnPaths.includes(location.pathname)) return null;

  // Auto-hide logic for dashboard to keep it clean
  const isDashboard = location.pathname === '/dashboard';
  const containerClasses = isDashboard 
    ? "bg-white/50 backdrop-blur-sm border-b border-slate-100 sticky top-16 z-40 opacity-0 hover:opacity-100 transition-opacity duration-300"
    : "bg-white/50 backdrop-blur-sm border-b border-slate-100 sticky top-16 z-40";

  const handleBackClick = () => {
    // If we are at the root of the authenticated portal (Dashboard), prompt for logout.
    // Otherwise, perform normal browser back navigation to allow moving between repository, booking, etc.
    if (location.pathname === '/dashboard') {
      setShowLogoutConfirm(true);
    } else {
      navigate(-1);
    }
  };

  const handleForwardClick = () => {
    navigate(1);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBackClick}
              className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm active:scale-95 group"
              title={location.pathname === '/dashboard' ? "Logout and Exit" : "Go Back"}
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={handleForwardClick}
              className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm active:scale-95 group"
              title="Go Forward"
            >
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            Path: {location.pathname.substring(1) || 'home'}
          </span>
        </div>
      </div>

      {/* Centered Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          
          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-5 rounded-3xl text-red-500 mb-6 shadow-sm border border-red-100">
                <LogOut size={32} />
              </div>
              
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 mb-2">
                Exit Session?
              </h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                You are at the Command Center. Navigating back further will terminate your secure session and return you to the public home page.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={confirmLogout}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  Yes, Logout and Exit
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full bg-slate-50 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationControls;
