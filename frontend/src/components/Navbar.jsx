import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-teal-600 font-bold text-xl">
              <Heart fill="currentColor" />
              <span>Medicare</span>
            </Link>
            <div className="hidden md:flex ml-8 space-x-4">
              <Link to="/" className="text-slate-600 hover:text-teal-600 font-medium">Home</Link>
              {user && <Link to="/dashboard" className="text-slate-600 hover:text-teal-600 font-medium">Dashboard</Link>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-teal-600 font-medium">Login</Link>
                <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700">Register</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Hi, {user.name}</span>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
