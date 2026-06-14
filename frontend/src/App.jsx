import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Agent
import AgentDashboard from './pages/agent/AgentDashboard';
import RegisterFarmer from './pages/agent/RegisterFarmer';
import CreateListing from './pages/agent/CreateListing';
import AgentListings from './pages/agent/AgentListings';
import AgentOrders from './pages/agent/AgentOrders';

// Buyer
import BrowseProduce from './pages/buyer/BrowseProduce';
import ProductDetail from './pages/buyer/ProductDetail';
import CartCheckout from './pages/buyer/CartCheckout';
import BuyerOrders from './pages/buyer/BuyerOrders';
import Subscriptions from './pages/buyer/Subscriptions';
import BuyerDashboard from './pages/buyer/BuyerDashboard';

// Admin
import AdminPrices from './pages/admin/AdminPrices';
import AdminDashboard from './pages/admin/AdminDashboard';

// Layout
import Layout from './components/Layout';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'BUYER') return <Navigate to="/browse" replace />;
  if (user.role === 'AGENT') return <Navigate to="/agent" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/browse" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Agent Routes */}
          <Route path="/agent" element={
            <ProtectedRoute roles={['AGENT', 'COOP_ADMIN', 'ADMIN']}>
              <Layout role="agent" />
            </ProtectedRoute>
          }>
            <Route index element={<AgentDashboard />} />
            <Route path="farmers/new" element={<RegisterFarmer />} />
            <Route path="listings/new" element={<CreateListing />} />
            <Route path="listings" element={<AgentListings />} />
            <Route path="orders" element={<AgentOrders />} />
          </Route>

          {/* Buyer Routes */}
          <Route path="/browse" element={<BrowseProduce />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/buyer" element={
            <ProtectedRoute roles={['BUYER']}>
              <Layout role="buyer" />
            </ProtectedRoute>
          }>
            <Route index element={<BuyerDashboard />} />
            <Route path="checkout" element={<CartCheckout />} />
            <Route path="orders" element={<BuyerOrders />} />
            <Route path="subscriptions" element={<Subscriptions />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <Layout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="prices" element={<AdminPrices />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
