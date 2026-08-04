import { createSlice } from '@reduxjs/toolkit';
import { mockStockMovements } from '../../services/mockData';

const initialState = {
  stockMovements: [...mockStockMovements],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setStockMovements: (state, action) => {
      state.stockMovements = action.payload;
    },
    addStockMovement: (state, action) => {
      state.stockMovements.push(action.payload);
    },
  },
});

export const { setStockMovements, addStockMovement } = inventorySlice.actions;
export default inventorySlice.reducer;
