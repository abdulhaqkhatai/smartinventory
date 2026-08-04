import { createSlice } from '@reduxjs/toolkit';
import { mockPurchaseOrders } from '../../services/mockData';

const initialState = {
  purchaseOrders: [...mockPurchaseOrders],
  loading: false,
  error: null,
  selectedPO: null,
};

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    setPurchaseOrders(state, action) {
      state.purchaseOrders = action.payload;
    },
    addPurchaseOrder(state, action) {
      state.purchaseOrders.push(action.payload);
    },
    updatePurchaseOrder(state, action) {
      const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
      if (index !== -1) {
        state.purchaseOrders[index] = action.payload;
      }
    },
    deletePurchaseOrder(state, action) {
      state.purchaseOrders = state.purchaseOrders.filter((po) => po.id !== action.payload);
    },
    setSelectedPO(state, action) {
      state.selectedPO = action.payload;
    },
  },
});

export const {
  setPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  setSelectedPO,
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;
