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

export default api;
