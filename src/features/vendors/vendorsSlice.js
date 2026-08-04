import { createSlice } from '@reduxjs/toolkit';
import { mockVendors } from '../../services/mockData';

const initialState = {
  vendors: [...mockVendors],
  loading: false,
  error: null,
  selectedVendor: null,
};

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setVendors: (state, action) => {
      state.vendors = action.payload;
    },
    addVendor: (state, action) => {
      state.vendors.push(action.payload);
    },
    updateVendor: (state, action) => {
      const index = state.vendors.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
    },
    deleteVendor: (state, action) => {
      state.vendors = state.vendors.filter(v => v.id !== action.payload);
    },
    setSelectedVendor: (state, action) => {
      state.selectedVendor = action.payload;
    }
  }
});

export const {
  setVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  setSelectedVendor
} = vendorsSlice.actions;

export default vendorsSlice.reducer;
