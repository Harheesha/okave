import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('okave_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('okave_token');
      localStorage.removeItem('okave_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== Auth =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ===== Farmers =====
export const farmersAPI = {
  create: (data) => api.post('/farmers', data),
  list: () => api.get('/farmers'),
  get: (id) => api.get(`/farmers/${id}`),
  update: (id, data) => api.patch(`/farmers/${id}`, data),
};

// ===== Co-ops =====
export const coopsAPI = {
  create: (data) => api.post('/coops', data),
  list: () => api.get('/coops'),
  get: (id) => api.get(`/coops/${id}`),
  addMember: (id, farmer_id) => api.post(`/coops/${id}/members`, { farmer_id }),
};

// ===== Listings =====
export const listingsAPI = {
  create: (data) => api.post('/listings', data),
  list: (params) => api.get('/listings', { params }),
  get: (id) => api.get(`/listings/${id}`),
  update: (id, data) => api.patch(`/listings/${id}`, data),
  addPhoto: (id, url) => api.post(`/listings/${id}/photos`, { url }),
  priceSuggestion: (data) => api.post('/listings/price-suggestion', data),
};

// ===== Prices =====
export const pricesAPI = {
  list: (params) => api.get('/prices', { params }),
  suggestion: (data) => api.post('/prices/suggestion', data),
};

// ===== Orders =====
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  list: () => api.get('/orders'),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// ===== Subscriptions =====
export const subscriptionsAPI = {
  create: (data) => api.post('/subscriptions', data),
  list: () => api.get('/subscriptions'),
  update: (id, data) => api.patch(`/subscriptions/${id}`, data),
};

// ===== Admin =====
export const adminAPI = {
  getPrices: () => api.get('/admin/prices'),
  createPrice: (data) => api.post('/admin/prices', data),
  updatePrice: (id, data) => api.patch(`/admin/prices/${id}`, data),
  deletePrice: (id) => api.delete(`/admin/prices/${id}`),
  getStats: () => api.get('/admin/stats'),
};

// ===== Notifications =====
export const notificationsAPI = {
  list: () => api.get('/notifications'),
};

export default api;
