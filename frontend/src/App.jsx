import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterFarmer from './pages/RegisterFarmer';

// Agent
import AgentDashboard from './pages/AgentDashboard';
import CreateListing from './pages/CreateListing';

// Buyer
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';

// Admin
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterFarmer />} />

      {/* Buyer/Public browsing */}
      <Route path="/" element={<Layout navLinks={[{ to: '/browse', label: 'Marketplace' }, { to: '/cart', label: 'Cart' }]} />}>
        <Route index element={<Navigate to="/browse" replace />} />
        <Route path="browse" element={<Marketplace />} />
        <Route path="checkout" element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <Checkout />
          </ProtectedRoute>
        } />
      </Route>

      {/* Agent routes */}
      <Route path="/agent" element={
        <ProtectedRoute allowedRoles={['FARMER', 'AGENT']}>
          <Layout navLinks={[{ to: '/agent/dashboard', label: 'Dashboard' }, { to: '/agent/create-listing', label: 'New Listing' }]} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="create-listing" element={<CreateListing />} />
        <Route path="register-farmer" element={<RegisterFarmer />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout navLinks={[{ to: '/admin/dashboard', label: 'Dashboard' }]} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/browse" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
