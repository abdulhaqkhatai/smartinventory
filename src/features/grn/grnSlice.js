import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { grnAPI } from '../../services/api';
import { mockGRNs } from '../../services/mockData';

// Async Thunks
export const fetchGRNs = createAsyncThunk(
  'grn/fetchGRNs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await grnAPI.getAll();
      return response.data || [];
    } catch (error) {
      return mockGRNs;
    }
  }
);

export const fetchGRNById = createAsyncThunk(
  'grn/fetchGRNById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await grnAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewGRN = createAsyncThunk(
  'grn/createNewGRN',
  async (grnData, { rejectWithValue }) => {
    try {
      const response = await grnAPI.create(grnData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGRNData = createAsyncThunk(
  'grn/updateGRNData',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await grnAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGRNData = createAsyncThunk(
  'grn/deleteGRNData',
  async (id, { rejectWithValue }) => {
    try {
      await grnAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  grns: [...mockGRNs],
  loading: false,
  error: null,
  selectedGRN: null,
  success: false,
};

const grnSlice = createSlice({
  name: 'grn',
  initialState,
  reducers: {
    setGRNs: (state, action) => {
      state.grns = action.payload;
    },
    addGRN: (state, action) => {
      state.grns.push(action.payload);
      state.success = true;
    },
    updateGRN: (state, action) => {
      const index = state.grns.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.grns[index] = action.payload;
      }
      state.success = true;
    },
    setSelectedGRN: (state, action) => {
      state.selectedGRN = action.payload;
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
      // Fetch GRNs
      .addCase(fetchGRNs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGRNs.fulfilled, (state, action) => {
        state.loading = false;
        state.grns = action.payload;
      })
      .addCase(fetchGRNs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create GRN
      .addCase(createNewGRN.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewGRN.fulfilled, (state, action) => {
        state.loading = false;
        state.grns.push(action.payload);
        state.success = true;
      })
      .addCase(createNewGRN.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update GRN
      .addCase(updateGRNData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGRNData.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.grns.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.grns[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateGRNData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete GRN
      .addCase(deleteGRNData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGRNData.fulfilled, (state, action) => {
        state.loading = false;
        state.grns = state.grns.filter(g => g.id !== action.payload);
      })
      .addCase(deleteGRNData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setGRNs, addGRN, updateGRN, setSelectedGRN, clearSuccess, clearError } = grnSlice.actions;
export default grnSlice.reducer;
