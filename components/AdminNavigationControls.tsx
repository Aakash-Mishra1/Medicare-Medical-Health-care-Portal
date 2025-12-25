
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminAuth } from '../admin/AdminContext';

const AdminNavigationControls: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Only hide on root if needed, but user asked for it in login and portal.
  // We might want to hide it on non-admin paths, but this component will only be rendered for admin paths.
  
  const handleBackClick = () => {
    // If we are at the root of the authenticated portal (Dashboard), prompt for logout.
    if (location.pathname === '/admin/dashboard') {
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
    navigate('/admin/login');
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBackClick}
              className="p-2 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-[#7c3aed] hover:border-[#7c3aed]/50 transition-all shadow-sm active:scale-95 group"
              title={location.pathname === '/admin/dashboard' ? "Logout and Exit" : "Go Back"}
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={handleForwardClick}
              className="p-2 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-[#7c3aed] hover:border-[#7c3aed]/50 transition-all shadow-sm active:scale-95 group"
              title="Go Forward"
            >
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="h-4 w-px bg-slate-700 mx-2"></div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Navigation</span>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-sm w-full border border-slate-700 shadow-2xl p-6">
            <h3 className="text-xl font-black text-white mb-2">Exit Admin Portal?</h3>
            <p className="text-slate-400 text-sm mb-6">You are about to log out of the secure admin session.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-lg font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 py-2 rounded-lg font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavigationControls;
