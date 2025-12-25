
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Heart, LogOut, User as UserIcon, Bell, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homePath = user ? '/dashboard' : '/';

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={homePath} className="flex items-center gap-2 text-teal-600 font-bold text-xl">
              <Heart fill="currentColor" />
              <span>Medicare</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link to={homePath} className="text-slate-600 hover:text-teal-600 px-3 py-2 rounded-md font-medium">
                {user ? 'Dashboard' : 'Home'}
              </Link>
              {user?.role === 'patient' && (
                <>
                  <Link to="/book" className="text-slate-600 hover:text-teal-600 px-3 py-2 rounded-md font-medium">Book Appointment</Link>
                </>
              )}
              {user?.role === 'doctor' && (
                <Link to="/records" className="text-slate-600 hover:text-teal-600 px-3 py-2 rounded-md font-medium">Analytics</Link>
              )}
              <Link to="/contact" className="text-slate-600 hover:text-teal-600 px-3 py-2 rounded-md font-medium">Contact</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-teal-600 font-medium">Login</Link>
                <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition">Register</Link>
                <Link to="/admin/login" className="bg-[#7c3aed] text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-lg shadow-purple-200">
                  <Shield size={18} />
                  Admin Portal
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 hover:text-teal-600 transition relative">
                    <Bell size={20} />
                    {notifCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Live Updates</h5>
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-bold">
                          <p className="text-slate-900 mb-1">New medical report authorized by Dr. Mohit.</p>
                          <p className="text-teal-500 uppercase tracking-tighter">2 mins ago</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-bold">
                          <p className="text-slate-900 mb-1">Appointment status changed: Scheduled.</p>
                          <p className="text-teal-500 uppercase tracking-tighter">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="flex items-center gap-2 text-slate-700 text-sm font-black italic border-r pr-4 uppercase tracking-tighter">
                  <UserIcon size={16} className="text-teal-500" /> {user.username}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-black text-xs uppercase tracking-widest">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b px-4 pt-2 pb-4 space-y-1">
          <Link to={homePath} className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsOpen(false)}>
            {user ? 'Dashboard' : 'Home'}
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="block px-3 py-2 text-teal-600 font-medium" onClick={() => setIsOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              {user.role === 'patient' && <Link to="/book" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Book Appointment</Link>}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-500 font-medium">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
