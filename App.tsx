
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider, useAdminAuth } from './admin/AdminContext';
import Navbar from './components/Navbar';
import NavigationControls from './components/NavigationControls';
import AdminNavigationControls from './components/AdminNavigationControls';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import MedicalRecords from './pages/MedicalRecords';
import DoctorsList from './pages/DoctorsList';
import Contact from './pages/Contact';
import InfoPage from './pages/InfoPage';
import AdminLogin from './admin/AdminLogin';
import AdminPortalDashboard from './admin/AdminDashboard';
import { HeartPulse } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center text-teal-600 bg-slate-50">
      <HeartPulse className="animate-pulse mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest animate-pulse text-xs">Synchronizing Session...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

const AdminPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center text-[#7c3aed] bg-slate-900">
      <HeartPulse className="animate-pulse mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest animate-pulse text-xs">Synchronizing Admin Session...</p>
    </div>
  );
  if (!admin) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

const AdminPublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) return null;
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {!location.pathname.startsWith('/admin') && (
        <>
          <Navbar />
          <NavigationControls />
        </>
      )}
      {location.pathname.startsWith('/admin') && (
        <AdminNavigationControls />
      )}
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/contact" element={<Contact />} />
          
          {/* Info Pages */}
          <Route path="/about" element={<InfoPage />} />
          <Route path="/team" element={<InfoPage />} />
          <Route path="/careers" element={<InfoPage />} />
          <Route path="/press" element={<InfoPage />} />
          <Route path="/privacy" element={<InfoPage />} />
          <Route path="/terms" element={<InfoPage />} />
          <Route path="/cookie" element={<InfoPage />} />
          <Route path="/support" element={<InfoPage />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              {user?.role === 'patient' && <PatientDashboard />}
              {user?.role === 'doctor' && <DoctorDashboard />}
              {user?.role === 'admin' && <AdminDashboard />}
            </PrivateRoute>
          } />

          <Route path="/book" element={
            <PrivateRoute roles={['patient']}>
              <BookAppointment />
            </PrivateRoute>
          } />

          <Route path="/records" element={
            <PrivateRoute roles={['patient', 'doctor']}>
              <MedicalRecords />
            </PrivateRoute>
          } />

          <Route path="/doctors" element={
            <PrivateRoute roles={['patient']}>
              <DoctorsList />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminPrivateRoute><AdminPortalDashboard /></AdminPrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  // Privacy Logic: Logged in users can never see the landing page, login, or register
  if (user) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AdminProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </AdminProvider>
  );
};

export default App;
