import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminContext';
import { adminDataService } from './AdminDataService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import {
  BarChart3,
  Users,
  Calendar,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Activity,
  Download,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Plus,
  Search,
} from 'lucide-react';

/* START ADMIN PORTAL INTEGRATION - Real-time Admin Dashboard with Live Sync */

interface TabState {
  dashboard: boolean;
  users: boolean;
  appointments: boolean;
  reports: boolean;
  records: boolean;
  settings: boolean;
}

interface ModalState {
  type: 'appointment' | 'record' | 'addUser' | null;
  data: any;
}

const AdminDashboard: React.FC = () => {
  const { admin, logout, updateAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<keyof TabState>('dashboard');
  const [systemStats, setSystemStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  /* START ADMIN PORTAL INTEGRATION - View/Delete States */
  const [selectedModal, setSelectedModal] = useState<ModalState>({ type: null, data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timer | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: ''
  });
  
  // Settings State
  const [adminSettings, setAdminSettings] = useState({
    username: '',
    email: '',
    department: ''
  });

  useEffect(() => {
    if (admin) {
      setAdminSettings({
        username: admin.username,
        email: admin.email,
        department: admin.department || 'Administration'
      });
    }
  }, [admin]);
  /* END ADMIN PORTAL INTEGRATION */

  // Real-time data loader with auto-refresh
  const loadDashboardData = useCallback(() => {
    try {
      adminDataService.initializeSystemData();
      const stats = adminDataService.getSystemStats();
      const appts = adminDataService.getAllAppointments();
      const records = adminDataService.getAllMedicalRecords();
      const users = adminDataService.getAllUsers();

      setSystemStats(stats);
      setAppointments(appts || []);
      setMedicalRecords(records || []);
      setAllUsers(users || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 2 seconds for real-time updates
    /* START ADMIN PORTAL INTEGRATION - Real-time Auto Refresh */
    const interval = setInterval(() => {
      loadDashboardData();
    }, 2000);
    setRefreshInterval(interval);

    // Listen for storage events (changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (['local_appointments', 'local_medical_records', 'registered_patients', 'registered_doctors'].includes(e.key || '')) {
        loadDashboardData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
    /* END ADMIN PORTAL INTEGRATION */
  }, [loadDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleAppointmentStatusChange = (appointmentId: string, newStatus: string) => {
    const updatedAppt = appointments.find(a => a._id === appointmentId);
    if (updatedAppt) {
      updatedAppt.status = newStatus;
      adminDataService.syncAppointment(updatedAppt);
      
      // Sync to localStorage for persistence
      const localAppts = JSON.parse(localStorage.getItem('local_appointments') || '[]');
      const index = localAppts.findIndex((a: any) => a._id === appointmentId);
      if (index >= 0) {
        localAppts[index].status = newStatus;
        localStorage.setItem('local_appointments', JSON.stringify(localAppts));
      }
      
      loadDashboardData();
    }
  };

  const handleApproveDoctor = (doctorEmail: string) => {
    adminDataService.approveDoctorProfile(doctorEmail, true);
    loadDashboardData();
  };

  const handleToggleUserStatus = (email: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Deleted' ? 'Active' : 'Deleted';
    adminDataService.updateUserStatus(email, newStatus);
    loadDashboardData();
  };

  const handleDeleteUser = (email: string, role: string) => {
    if (window.confirm('Delete this user permanently? This action cannot be undone.')) {
      adminDataService.deleteUser(email, role);
      loadDashboardData();
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    adminDataService.addUser(newUser);
    setNewUser({ username: '', email: '', password: '', role: 'patient', specialization: '' });
    closeModal();
    loadDashboardData();
  };

  const handleSaveSettings = () => {
    if (admin) {
      const updatedAdmin = {
        ...admin,
        username: adminSettings.username,
        email: adminSettings.email,
        department: adminSettings.department
      };
      updateAdmin(updatedAdmin);
      alert('Settings saved successfully!');
    }
  };

  /* START ADMIN PORTAL INTEGRATION - View and Delete Handlers */
  const handleViewAppointment = (appointment: any) => {
    setSelectedModal({ type: 'appointment', data: appointment });
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('Delete this appointment permanently?')) {
      const localAppts = JSON.parse(localStorage.getItem('local_appointments') || '[]');
      const filtered = localAppts.filter((a: any) => a._id !== appointmentId);
      localStorage.setItem('local_appointments', JSON.stringify(filtered));
      
      // Remove from admin system
      adminDataService.deleteAppointment(appointmentId);
      loadDashboardData();
    }
  };

  const handleViewRecord = (record: any) => {
    setSelectedModal({ type: 'record', data: record });
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('Delete this medical record permanently?')) {
      const localRecords = JSON.parse(localStorage.getItem('local_medical_records') || '[]');
      const filtered = localRecords.filter((r: any) => r._id !== recordId);
      localStorage.setItem('local_medical_records', JSON.stringify(filtered));
      
      // Remove from admin system
      adminDataService.deleteMedicalRecord(recordId);
      loadDashboardData();
    }
  };

  const closeModal = () => {
    setSelectedModal({ type: null, data: null });
  };
  /* END ADMIN PORTAL INTEGRATION */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin mx-auto mb-4 text-[#7c3aed]" size={48} />
          <p className="text-white font-black italic">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex w-full overflow-x-hidden">
      {/* Modal for Viewing Details */}
      {/* START ADMIN PORTAL INTEGRATION - Detail View Modals */}
      {selectedModal.type === 'appointment' && selectedModal.data && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-700 max-h-96 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Calendar className="text-[#7c3aed]" size={24} />
                Appointment Details
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition hover:rotate-90">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Patient Name</p>
                  <p className="text-white font-bold">{selectedModal.data.patientName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Patient Email</p>
                  <p className="text-white font-bold">{selectedModal.data.patientEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Doctor Name</p>
                  <p className="text-white font-bold">{selectedModal.data.doctorName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Doctor Email</p>
                  <p className="text-white font-bold">{selectedModal.data.doctorEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Date</p>
                  <p className="text-white font-bold">{selectedModal.data.date || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Time</p>
                  <p className="text-white font-bold">{selectedModal.data.time || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Status</p>
                  <p className={`font-bold px-3 py-1 rounded-full w-fit text-sm ${
                    selectedModal.data.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                    selectedModal.data.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {selectedModal.data.status || 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Reason</p>
                  <p className="text-white font-bold">{selectedModal.data.reason || 'General Checkup'}</p>
                </div>
              </div>
              {selectedModal.data.notes && (
                <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-2">Notes</p>
                  <p className="text-slate-300 text-sm">{selectedModal.data.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold hover:bg-purple-500/20 hover:text-purple-300 transition hover:scale-[1.02] active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedModal.type === 'record' && selectedModal.data && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-700 max-h-96 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <ClipboardList className="text-[#7c3aed]" size={24} />
                Medical Record Details
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition hover:rotate-90">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Patient Email</p>
                  <p className="text-white font-bold">{selectedModal.data.patientEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Doctor Name</p>
                  <p className="text-white font-bold">{selectedModal.data.doctorName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Record Type</p>
                  <p className="text-white font-bold bg-purple-500/20 px-3 py-1 rounded-full w-fit text-sm">
                    {selectedModal.data.recordType || 'Report'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Date</p>
                  <p className="text-white font-bold">
                    {new Date(selectedModal.data.recordDate || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 space-y-3">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Diagnosis</p>
                  <p className="text-slate-300">{selectedModal.data.diagnosis || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Treatment</p>
                  <p className="text-slate-300">{selectedModal.data.treatment || 'N/A'}</p>
                </div>
                {selectedModal.data.medications && selectedModal.data.medications.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">Medications</p>
                    <div className="space-y-2">
                      {selectedModal.data.medications.map((med: any, i: number) => (
                        <div key={i} className="bg-slate-600 p-2 rounded text-sm text-slate-300">
                          <span className="font-bold">{med.name}</span> - {med.dosage} {med.frequency}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold hover:bg-purple-500/20 hover:text-purple-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedModal.type === 'addUser' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Users className="text-[#7c3aed]" size={24} />
                Add New User
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition hover:rotate-90">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              {newUser.role === 'doctor' && (
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={newUser.specialization}
                    onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                    className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors"
                    placeholder="e.g. Cardiology"
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-bold hover:bg-[#6d28d9] transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 mt-4"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
      {/* END ADMIN PORTAL INTEGRATION */}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 text-white transition-all duration-300 border-r border-slate-700 flex flex-col`}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-[#7c3aed] p-2 rounded-lg shadow-lg shadow-purple-500/20">
              <Shield size={24} className="text-white" />
            </div>
            {sidebarOpen && <span className="font-black text-lg italic tracking-tight">Admin</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition hover:scale-110 active:scale-95"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: BarChart3, label: 'Dashboard', key: 'dashboard' },
            { icon: Users, label: 'Users', key: 'users' },
            { icon: Calendar, label: 'Appointments', key: 'appointments' },
            { icon: ClipboardList, label: 'Medical Records', key: 'records' },
            { icon: TrendingUp, label: 'Reports', key: 'reports' },
            { icon: Settings, label: 'Settings', key: 'settings' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as keyof TabState)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-slate-300 rounded-xl transition-all duration-300 ${
                activeTab === item.key
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/30 translate-x-1'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 hover:translate-x-1'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-600/20 rounded-lg transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tight">Admin Portal</h1>
              <p className="text-slate-400 text-sm mt-1">Welcome, {admin?.username}</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-700/50 px-6 py-3 rounded-full border border-slate-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm font-semibold">System Online</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: (systemStats?.totalPatients || 0) + (systemStats?.totalDoctors || 0), icon: Users, color: 'bg-blue-500/20 text-blue-400', border: 'hover:border-purple-500/50' },
                  { label: 'Active Appointments', value: systemStats?.activeAppointments || 0, icon: Calendar, color: 'bg-purple-500/20 text-purple-400', border: 'hover:border-purple-500/50' },
                  { label: 'Pending Approvals', value: systemStats?.pendingApprovals || 0, icon: AlertCircle, color: 'bg-orange-500/20 text-orange-400', border: 'hover:border-purple-500/50' },
                  { label: 'System Health', value: (systemStats?.systemHealth || 98) + '%', icon: Zap, color: 'bg-green-500/20 text-green-400', border: 'hover:border-purple-500/50' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 ${stat.border} group cursor-default hover:bg-purple-500/5`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 group-hover:text-purple-300 transition-colors">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointment Statistics Graph */}
                <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/50 hover:bg-purple-500/5">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <TrendingUp size={24} className="text-[#7c3aed]" />
                    Appointment Status
                  </h2>
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length, color: '#3b82f6' },
                            { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: '#22c55e' },
                            { name: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length, color: '#ef4444' },
                            { name: 'Pending', value: appointments.filter(a => !a.status || a.status === 'Pending').length, color: '#eab308' },
                          ].filter(i => i.value > 0).length > 0 ? [
                            { name: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length, color: '#3b82f6' },
                            { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: '#22c55e' },
                            { name: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length, color: '#ef4444' },
                            { name: 'Pending', value: appointments.filter(a => !a.status || a.status === 'Pending').length, color: '#eab308' },
                          ].filter(i => i.value > 0) : [{ name: 'No Data', value: 1, color: '#475569' }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {([
                            { name: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length, color: '#3b82f6' },
                            { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: '#22c55e' },
                            { name: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length, color: '#ef4444' },
                            { name: 'Pending', value: appointments.filter(a => !a.status || a.status === 'Pending').length, color: '#eab308' },
                          ].filter(i => i.value > 0).length > 0 ? [
                            { name: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length, color: '#3b82f6' },
                            { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: '#22c55e' },
                            { name: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length, color: '#ef4444' },
                            { name: 'Pending', value: appointments.filter(a => !a.status || a.status === 'Pending').length, color: '#eab308' },
                          ].filter(i => i.value > 0) : [{ name: 'No Data', value: 1, color: '#475569' }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(value: number) => [`${value} Appointments`, 'Count']}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          formatter={(value) => <span className="text-slate-300 font-bold ml-1">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                      <p className="text-3xl font-black text-white">{appointments.length}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/50 hover:bg-purple-500/5">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Activity size={24} className="text-[#7c3aed]" />
                    Recent Appointments
                  </h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {[...appointments].reverse().slice(0, 5).map((appt, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleViewAppointment(appt)}
                        className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="bg-slate-800 p-3 rounded-lg group-hover:bg-[#7c3aed]/20 transition-colors">
                          <Calendar className="text-[#7c3aed] shrink-0" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm group-hover:text-[#a78bfa] transition-colors">{appt.patientName || 'Unknown'} <span className="text-slate-500 mx-1">→</span> {appt.doctorName || 'Unassigned'}</p>
                          <p className="text-slate-400 text-xs mt-1 font-medium">{appt.date || 'Pending Date'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          appt.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                          appt.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {appt.status || 'Pending'}
                        </span>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <div className="text-center py-10 text-slate-500 italic">
                        No recent activity found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-purple-500/5">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Users size={24} className="text-[#7c3aed]" />
                  User Management
                </h2>
                <button
                  onClick={() => setSelectedModal({ type: 'addUser', data: null })}
                  className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#6d28d9] transition flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                >
                  <Plus size={18} />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-700/50">
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...allUsers].sort((a, b) => {
                      if (a.role === 'doctor' && b.role !== 'doctor') return -1;
                      if (a.role !== 'doctor' && b.role === 'doctor') return 1;
                      return 0;
                    }).map((user, i) => (
                      <tr key={i} className="border-b border-slate-700 hover:bg-purple-500/5 transition-colors duration-200 group">
                        <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors">{user.username || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            user.role === 'doctor' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            user.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                            user.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {user.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          {user.role === 'doctor' && user.status === 'Pending' && (
                            <button
                              onClick={() => handleApproveDoctor(user.email)}
                              className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-xs font-bold hover:bg-green-500/30 transition hover:scale-105 active:scale-95"
                            >
                              Approve
                            </button>
                          )}
                          
                          {/* Toggle Status Button (Soft Delete / Activate) */}
                          <button
                            onClick={() => handleToggleUserStatus(user.email, user.status)}
                            className={`px-3 py-1 rounded text-xs font-bold transition hover:scale-105 active:scale-95 ${
                              user.status === 'Deleted' 
                                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                                : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                            }`}
                          >
                            {user.status === 'Deleted' ? 'Activate' : 'Deactivate'}
                          </button>

                          {/* Permanent Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(user.email, user.role)}
                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-xs font-bold hover:bg-red-500/30 transition hover:scale-105 active:scale-95"
                            title="Permanently Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-purple-500/5">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Calendar size={24} className="text-[#7c3aed]" />
                  All Appointments
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-700/50">
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt, i) => (
                      <tr key={i} className="border-b border-slate-700 hover:bg-purple-500/5 transition-colors duration-200 group">
                        <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors">{appt.patientName || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{appt.doctorName || 'Unassigned'}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{appt.date || 'TBD'}</td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={appt.status || 'Scheduled'}
                            onChange={(e) => handleAppointmentStatusChange(appt._id, e.target.value)}
                            className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs font-bold border border-slate-600 focus:border-[#7c3aed] outline-none hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/50 transition-colors cursor-pointer"
                          >
                            <option>Scheduled</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          {/* START ADMIN PORTAL INTEGRATION - Appointment View and Delete */}
                          <button 
                            onClick={() => handleViewAppointment(appt)}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-bold hover:bg-purple-500/30 transition flex items-center gap-1 hover:scale-105 active:scale-95"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button 
                            onClick={() => handleDeleteAppointment(appt._id)}
                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-xs font-bold hover:bg-red-500/30 transition flex items-center gap-1 hover:scale-105 active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                          {/* END ADMIN PORTAL INTEGRATION */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-purple-500/5">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ClipboardList size={24} className="text-[#7c3aed]" />
                  Medical Records
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-700/50">
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalRecords.map((record, i) => (
                      <tr key={i} className="border-b border-slate-700 hover:bg-purple-500/5 transition-colors duration-200 group">
                        <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors">{record.patientEmail}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{record.doctorName || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">
                            {record.recordType || 'Report'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {new Date(record.recordDate || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          {/* START ADMIN PORTAL INTEGRATION - Medical Record View and Delete */}
                          <button 
                            onClick={() => handleViewRecord(record)}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-bold hover:bg-purple-500/30 transition flex items-center gap-1 hover:scale-105 active:scale-95"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(record._id)}
                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-xs font-bold hover:bg-red-500/30 transition flex items-center gap-1 hover:scale-105 active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                          {/* END ADMIN PORTAL INTEGRATION */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/5">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#7c3aed]" />
                  Platform Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm p-3 bg-slate-700/30 rounded-xl hover:bg-purple-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">Total Patients:</span>
                    <span className="text-[#a78bfa] font-black text-lg">{systemStats?.totalPatients || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-3 bg-slate-700/30 rounded-xl hover:bg-purple-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">Total Doctors:</span>
                    <span className="text-[#a78bfa] font-black text-lg">{systemStats?.totalDoctors || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-3 bg-slate-700/30 rounded-xl hover:bg-purple-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">Total Appointments:</span>
                    <span className="text-[#a78bfa] font-black text-lg">{systemStats?.totalAppointments || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-3 bg-slate-700/30 rounded-xl hover:bg-purple-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">Completed Appointments:</span>
                    <span className="text-[#a78bfa] font-black text-lg">{systemStats?.completedAppointments || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-green-500/30 hover:bg-green-500/5">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-green-400" />
                  System Information
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-green-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">Database Status:</span>
                    <span className="text-green-400 font-black">Connected</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-green-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">API Status:</span>
                    <span className="text-green-400 font-black">Running</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-green-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">System Uptime:</span>
                    <span className="text-green-400 font-black">45 days</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-green-500/10 transition-colors">
                    <span className="text-slate-300 font-medium">Last Backup:</span>
                    <span className="text-green-400 font-black">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/5">
              <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                <Settings size={24} className="text-[#7c3aed]" />
                System Settings
              </h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-sm font-black text-white mb-3 uppercase tracking-wider">Admin Information</h3>
                  <div className="bg-slate-700/50 p-6 rounded-xl space-y-4 text-sm border border-slate-600/50 hover:border-[#7c3aed]/30 hover:bg-purple-500/5 transition-colors">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Admin Name</label>
                      <input
                        type="text"
                        value={adminSettings.username}
                        onChange={(e) => setAdminSettings({...adminSettings, username: e.target.value})}
                        className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        value={adminSettings.email}
                        onChange={(e) => setAdminSettings({...adminSettings, email: e.target.value})}
                        className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Department</label>
                      <input
                        type="text"
                        value={adminSettings.department}
                        onChange={(e) => setAdminSettings({...adminSettings, department: e.target.value})}
                        className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-600 focus:border-[#7c3aed] hover:border-[#7c3aed]/50 outline-none transition-colors font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white mb-3 uppercase tracking-wider">Platform Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-[#7c3aed]/30 hover:bg-purple-500/5 transition-colors">
                      <span className="text-slate-300 font-medium">Email Notifications</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#7c3aed] cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-[#7c3aed]/30 hover:bg-purple-500/5 transition-colors">
                      <span className="text-slate-300 font-medium">SMS Alerts</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#7c3aed] cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-[#7c3aed]/30 hover:bg-purple-500/5 transition-colors">
                      <span className="text-slate-300 font-medium">Auto Backup</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#7c3aed] cursor-pointer" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings}
                  className="w-full bg-[#7c3aed] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[#6d28d9] transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* END ADMIN PORTAL INTEGRATION - Comprehensive Admin Dashboard */

export default AdminDashboard;
