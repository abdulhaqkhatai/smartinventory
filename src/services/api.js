import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access denied');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          break;
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: 'Network error. Please check your connection.' });
  }
);

// ============== AUTH API METHODS ==============
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  validateToken: () => api.get('/auth/validate'),
};

// ============== ITEM MASTER API METHODS ==============
export const itemAPI = {
  getAll: (params = {}) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
};

// ============== VENDOR MANAGEMENT API METHODS ==============
export const vendorAPI = {
  getAll: (params = {}) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// ============== REPORT / DASHBOARD API METHODS ==============
export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getAssetStatus: () => api.get('/reports/assets/status'),
  getIssues: () => api.get('/reports/issues'),
  getReturns: () => api.get('/reports/returns'),
  getDamagedAssets: () => api.get('/reports/assets/damaged'),
};

// ============== INDENT API METHODS ==============
export const indentAPI = {
  getAll: (params = {}) => api.get('/indents', { params }),
  getById: (id) => api.get(`/indents/${id}`),
  create: (data) => api.post('/indents', data),
  update: (id, data) => api.put(`/indents/${id}`, data),
  delete: (id) => api.delete(`/indents/${id}`),
  updateStatus: (id, data) => api.patch(`/indents/${id}/status`, data),
  getByStatus: (status) => api.get(`/indents/status/${status}`),
  getByDepartment: (department) => api.get(`/indents/department/${department}`),
};

// ============== PURCHASE ORDER API METHODS ==============
export const purchaseOrderAPI = {
  getAll: (params = {}) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  updateStatus: (id, data) => api.patch(`/purchase-orders/${id}/status`, data),
  getByIndent: (indentRef) => api.get(`/purchase-orders/indent/${indentRef}`),
  getByVendor: (vendorId) => api.get(`/purchase-orders/vendor/${vendorId}`),
  getByStatus: (status) => api.get(`/purchase-orders/status/${status}`),
};

// ============== GRN API METHODS ==============
export const grnAPI = {
  getAll: (params = {}) => api.get('/grn', { params }),
  getById: (id) => api.get(`/grn/${id}`),
  create: (data) => api.post('/grn', data),
  update: (id, data) => api.put(`/grn/${id}`, data),
  delete: (id) => api.delete(`/grn/${id}`),
  getByPO: (poRef) => api.get(`/grn/po/${poRef}`),
  getByStatus: (status) => api.get(`/grn/status/${status}`),
  getByVendor: (vendorName) => api.get(`/grn/vendor/${vendorName}`),
};

// ============== INVENTORY API METHODS ==============
export const inventoryAPI = {
  getAllMovements: (params = {}) => api.get('/inventory', { params }),
  getMovementById: (id) => api.get(`/inventory/${id}`),
  getStockLevels: () => api.get('/inventory/stock/levels'),
  getItemStock: (itemId) => api.get(`/inventory/item/${itemId}/stock`),
  recordStockIn: (data) => api.post('/inventory/stock-in', data),
  recordStockOut: (data) => api.post('/inventory/stock-out', data),
  recordTransfer: (data) => api.post('/inventory/transfer', data),
  recordAdjustment: (data) => api.post('/inventory/adjustment', data),
  getItemMovements: (itemId, params = {}) => api.get(`/inventory/item/${itemId}/movements`, { params }),
  getLowStockItems: () => api.get('/inventory/low-stock'),
  getStockHistory: (itemId) => api.get(`/inventory/history/${itemId}`),
};

export default api;
