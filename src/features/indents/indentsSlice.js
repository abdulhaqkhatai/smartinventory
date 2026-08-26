import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { indentAPI } from '../../services/api';
import { mockIndents } from '../../services/mockData';

// Async Thunks
export const fetchIndents = createAsyncThunk(
  'indents/fetchIndents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await indentAPI.getAll();
      return response.data || [];
    } catch (error) {
      // Fallback to mock data if API fails
      return mockIndents;
    }
  }
);

export const fetchIndentById = createAsyncThunk(
  'indents/fetchIndentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await indentAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewIndent = createAsyncThunk(
  'indents/createNewIndent',
  async (indentData, { rejectWithValue }) => {
    try {
      const response = await indentAPI.create(indentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateIndentData = createAsyncThunk(
  'indents/updateIndentData',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await indentAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteIndentData = createAsyncThunk(
  'indents/deleteIndentData',
  async (id, { rejectWithValue }) => {
    try {
      await indentAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateIndentStatusAPI = createAsyncThunk(
  'indents/updateIndentStatusAPI',
  async ({ id, status, approvedBy, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await indentAPI.updateStatus(id, {
        status,
        approvedBy,
        rejectionReason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  indents: [...mockIndents],
  loading: false,
  error: null,
  selectedIndent: null,
  success: false,
};

const indentsSlice = createSlice({
  name: 'indents',
  initialState,
  reducers: {
    setIndents(state, action) {
      state.indents = action.payload;
    },
    addIndent(state, action) {
      state.indents.push(action.payload);
      state.success = true;
    },
    updateIndent(state, action) {
      const index = state.indents.findIndex((indent) => indent.id === action.payload.id);
      if (index !== -1) {
        state.indents[index] = action.payload;
      }
      state.success = true;
    },
    deleteIndent(state, action) {
      state.indents = state.indents.filter((indent) => indent.id !== action.payload);
    },
    setSelectedIndent(state, action) {
      state.selectedIndent = action.payload;
    },
    updateIndentStatus(state, action) {
      const { id, status, approvedBy, rejectionReason } = action.payload;
      const indent = state.indents.find((indent) => String(indent.id) === String(id));
      if (indent) {
        indent.status = status;
        if (approvedBy) indent.approvedBy = approvedBy;
        if (rejectionReason) indent.rejectionReason = rejectionReason;
      }
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
      // Fetch Indents
      .addCase(fetchIndents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndents.fulfilled, (state, action) => {
        state.loading = false;
        state.indents = action.payload;
      })
      .addCase(fetchIndents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Indent
      .addCase(createNewIndent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewIndent.fulfilled, (state, action) => {
        state.loading = false;
        state.indents.push(action.payload);
        state.success = true;
      })
      .addCase(createNewIndent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Indent
      .addCase(updateIndentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIndentData.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.indents.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.indents[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateIndentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Indent
      .addCase(deleteIndentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIndentData.fulfilled, (state, action) => {
        state.loading = false;
        state.indents = state.indents.filter((i) => i.id !== action.payload);
      })
      .addCase(deleteIndentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateIndentStatusAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIndentStatusAPI.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.indents.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.indents[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateIndentStatusAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setIndents,
  addIndent,
  updateIndent,
  deleteIndent,
  setSelectedIndent,
  updateIndentStatus,
  clearSuccess,
  clearError,
} = indentsSlice.actions;

export default indentsSlice.reducer;
