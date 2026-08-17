import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryAPI } from '../../services/api';
import { mockStockMovements } from '../../services/mockData';

// Async Thunks
export const fetchStockMovements = createAsyncThunk(
  'inventory/fetchStockMovements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getAllMovements();
      return response.data || [];
    } catch (error) {
      return mockStockMovements;
    }
  }
);

export const fetchStockLevels = createAsyncThunk(
  'inventory/fetchStockLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getStockLevels();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLowStockItems = createAsyncThunk(
  'inventory/fetchLowStockItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getLowStockItems();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordStockInAPI = createAsyncThunk(
  'inventory/recordStockInAPI',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.recordStockIn(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordStockOutAPI = createAsyncThunk(
  'inventory/recordStockOutAPI',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.recordStockOut(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordTransferAPI = createAsyncThunk(
  'inventory/recordTransferAPI',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.recordTransfer(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordAdjustmentAPI = createAsyncThunk(
  'inventory/recordAdjustmentAPI',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.recordAdjustment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  stockMovements: [...mockStockMovements],
  stockLevels: [],
  lowStockItems: [],
  loading: false,
  error: null,
  success: false,
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
      state.success = true;
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
      // Fetch Stock Movements
      .addCase(fetchStockMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements = action.payload;
      })
      .addCase(fetchStockMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stock Levels
      .addCase(fetchStockLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.stockLevels = action.payload;
      })
      .addCase(fetchStockLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Low Stock Items
      .addCase(fetchLowStockItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockItems = action.payload;
      })
      .addCase(fetchLowStockItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Record Stock In
      .addCase(recordStockInAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordStockInAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements.unshift(action.payload);
        state.success = true;
      })
      .addCase(recordStockInAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Record Stock Out
      .addCase(recordStockOutAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordStockOutAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements.unshift(action.payload);
        state.success = true;
      })
      .addCase(recordStockOutAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Record Transfer
      .addCase(recordTransferAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordTransferAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements.unshift(action.payload);
        state.success = true;
      })
      .addCase(recordTransferAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Record Adjustment
      .addCase(recordAdjustmentAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordAdjustmentAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements.unshift(action.payload);
        state.success = true;
      })
      .addCase(recordAdjustmentAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setStockMovements,
  addStockMovement,
  clearSuccess,
  clearError,
} = inventorySlice.actions;

export default inventorySlice.reducer;
