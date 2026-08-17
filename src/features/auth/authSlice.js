import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

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
      state.user = action.payload.user;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('authToken', action.payload.token);
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

// API login action
export const performLogin = (username, password) => async (dispatch) => {
  dispatch(loginStart());

  try {
    const response = await api.post('/auth/login', {
      username,
      password,
    });

    dispatch(loginSuccess(response));
  } catch (error) {
    dispatch(loginFailure(error.message || 'Login failed'));
  }
};

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateProfile } = authSlice.actions;
export default authSlice.reducer;
