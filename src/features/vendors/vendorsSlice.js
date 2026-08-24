import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors');
      return Array.isArray(response) ? response : (response?.data || []);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendors');
    }
  }
);

export const createVendor = createAsyncThunk(
  'vendors/createVendor',
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/vendors', vendorData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create vendor');
    }
  }
);

export const updateVendorAsync = createAsyncThunk(
  'vendors/updateVendor',
  async ({ id, vendorData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vendors/${id}`, vendorData);
      return response || { id, ...vendorData };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update vendor');
    }
  }
);

export const deleteVendorAsync = createAsyncThunk(
  'vendors/deleteVendor',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/vendors/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete vendor');
    }
  }
);

const initialState = {
  vendors: [],
  loading: false,
  error: null,
  selectedVendor: null,
};

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setSelectedVendor: (state, action) => {
      state.selectedVendor = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.unshift(action.payload);
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVendorAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index] = { ...state.vendors[index], ...action.payload };
        }
      })
      .addCase(updateVendorAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteVendorAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendorAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.filter(v => v.id !== action.payload);
      })
      .addCase(deleteVendorAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedVendor, clearError } = vendorsSlice.actions;

export default vendorsSlice.reducer;
