import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/items');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createItem = createAsyncThunk(
  'items/createItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await api.post('/items', itemData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemAsync = createAsyncThunk(
  'items/updateItem',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      await api.put(`/items/${id}`, itemData);
      return { id, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItemAsync = createAsyncThunk(
  'items/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/items/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedItem: null,
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedItem, clearError } = itemsSlice.actions;

export default itemsSlice.reducer;
