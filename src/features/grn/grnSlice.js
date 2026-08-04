import { createSlice } from '@reduxjs/toolkit';
import { mockGRNs } from '../../services/mockData';

const initialState = {
  grns: [...mockGRNs],
  loading: false,
  error: null,
  selectedGRN: null,
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
    },
    updateGRN: (state, action) => {
      const index = state.grns.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.grns[index] = action.payload;
      }
    },
    setSelectedGRN: (state, action) => {
      state.selectedGRN = action.payload;
    },
  },
});

export const { setGRNs, addGRN, updateGRN, setSelectedGRN } = grnSlice.actions;
export default grnSlice.reducer;
