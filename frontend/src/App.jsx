import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Agent
import AgentDashboard from './pages/AgentDashboard';
import RegisterFarmer from './pages/RegisterFarmer';
import CreateListing from './pages/CreateListing';

// Buyer
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';

// Admin
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;
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
      <Route path="/register" element={<RegisterPage />} />

      {/* Root redirect */}
      <Route path="/" element={
        user?.role === 'AGENT' ? <Navigate to="/agent/dashboard" replace /> :
        user?.role === 'BUYER' ? <Navigate to="/buyer/marketplace" replace /> :
        user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
        <Navigate to="/login" replace />
      } />

      {/* Agent routes */}
      <Route path="/agent" element={
        <ProtectedRoute allowedRoles={['AGENT']}>
          <Layout navLinks={[
            { to: '/agent/dashboard', label: 'Dashboard' },
            { to: '/agent/register-farmer', label: 'Register Farmer' },
            { to: '/agent/create-listing', label: 'Create Listing' },
          ]} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="register-farmer" element={<RegisterFarmer />} />
        <Route path="create-listing" element={<CreateListing />} />
      </Route>

      {/* Buyer routes */}
      <Route path="/buyer" element={
        <ProtectedRoute allowedRoles={['BUYER']}>
          <Layout navLinks={[
            { to: '/buyer/marketplace', label: 'Marketplace' },
            { to: '/buyer/checkout', label: 'Checkout' },
          ]} />
        </ProtectedRoute>
      }>
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="checkout" element={<Checkout />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout navLinks={[
            { to: '/admin/dashboard', label: 'Dashboard' },
          ]} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
