import { createSlice } from '@reduxjs/toolkit';
import { mockItems } from '../../services/mockData';

const initialState = {
  items: [...mockItems],
  loading: false,
  error: null,
  selectedItem: null,
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setItems,
  addItem,
  updateItem,
  deleteItem,
  setSelectedItem,
  setLoading,
  setError
} = itemsSlice.actions;

export default itemsSlice.reducer;
