import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          break;
        case 403:
          console.error("Access denied");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          break;
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      message: "Network error. Please check your connection.",
    });
  },
);

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

// ============== ASSET API METHODS ==============
export const assetAPI = {
  getAll: (params = {}) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  getHistory: (id) => api.get(`/assets/${id}/history`),
};

// ============== ISSUE API METHODS ==============
export const issueAPI = {
  getAll: (params = {}) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post('/issues', data),
};

// ============== RETURN API METHODS ==============
export const returnAPI = {
  getAll: (params = {}) => api.get('/returns', { params }),
  getById: (id) => api.get(`/returns/${id}`),
  create: (data) => api.post('/returns', data),
};

// ============== REPORT API METHODS ==============
export const reportAPI = {
  getReportData: (reportType, params = {}) => api.get(`/reports/${reportType}`, { params }),
};

export default api;
