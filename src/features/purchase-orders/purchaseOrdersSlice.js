import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { purchaseOrderAPI } from '../../services/api';
import { mockPurchaseOrders } from '../../services/mockData';

// Async Thunks
export const fetchPurchaseOrders = createAsyncThunk(
  'purchaseOrders/fetchPurchaseOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderAPI.getAll();
      return response.data || [];
    } catch (error) {
      return mockPurchaseOrders;
    }
  }
);

export const fetchPOById = createAsyncThunk(
  'purchaseOrders/fetchPOById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewPO = createAsyncThunk(
  'purchaseOrders/createNewPO',
  async (poData, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderAPI.create(poData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePOData = createAsyncThunk(
  'purchaseOrders/updatePOData',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePOData = createAsyncThunk(
  'purchaseOrders/deletePOData',
  async (id, { rejectWithValue }) => {
    try {
      await purchaseOrderAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePOStatus = createAsyncThunk(
  'purchaseOrders/updatePOStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderAPI.updateStatus(id, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  purchaseOrders: [...mockPurchaseOrders],
  loading: false,
  error: null,
  selectedPO: null,
  success: false,
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
      state.success = true;
    },
    updatePurchaseOrder(state, action) {
      const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
      if (index !== -1) {
        state.purchaseOrders[index] = action.payload;
      }
      state.success = true;
    },
    deletePurchaseOrder(state, action) {
      state.purchaseOrders = state.purchaseOrders.filter((po) => po.id !== action.payload);
    },
    setSelectedPO(state, action) {
      state.selectedPO = action.payload;
    },
    clearSuccess(state) {
      state.success = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch POs
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create PO
      .addCase(createNewPO.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewPO.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders.push(action.payload);
        state.success = true;
      })
      .addCase(createNewPO.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update PO
      .addCase(updatePOData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePOData.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePOData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete PO
      .addCase(deletePOData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePOData.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = state.purchaseOrders.filter((po) => po.id !== action.payload);
      })
      .addCase(deletePOData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updatePOStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePOStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePOStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  setSelectedPO,
  clearSuccess,
  clearError,
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;
