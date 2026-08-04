import { createSlice } from '@reduxjs/toolkit';
import { mockUsers } from '../../services/mockData';

const storedUser = (() => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('authToken', 'mock-jwt-token-' + action.payload.id);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

// Mock login action
export const performLogin = (email, password) => (dispatch) => {
  dispatch(loginStart());
  
  // Simulate API call
  setTimeout(() => {
    const user = mockUsers.find((u) => u.email === email);
    if (user && password === 'admin123') {
      dispatch(loginSuccess(user));
    } else {
      dispatch(loginFailure('Invalid email or password'));
    }
  }, 800);
};

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateProfile } = authSlice.actions;
export default authSlice.reducer;
