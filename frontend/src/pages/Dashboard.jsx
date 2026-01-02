import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-teal-600">Upcoming Appointments</h2>
          <p className="text-slate-500">No upcoming appointments scheduled.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-teal-600">Recent Activity</h2>
          <ul className="space-y-2 text-slate-600">
            <li>• Logged in successfully</li>
            <li>• Updated profile information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
