import { createSlice } from '@reduxjs/toolkit';
import { mockIndents } from '../../services/mockData';

const initialState = {
  indents: [...mockIndents],
  loading: false,
  error: null,
  selectedIndent: null,
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
    },
    updateIndent(state, action) {
      const index = state.indents.findIndex((indent) => indent.id === action.payload.id);
      if (index !== -1) {
        state.indents[index] = action.payload;
      }
    },
    deleteIndent(state, action) {
      state.indents = state.indents.filter((indent) => indent.id !== action.payload);
    },
    setSelectedIndent(state, action) {
      state.selectedIndent = action.payload;
    },
    updateIndentStatus(state, action) {
      const { id, status, approvedBy, rejectionReason } = action.payload;
      const indent = state.indents.find((indent) => indent.id === id);
      if (indent) {
        indent.status = status;
        if (approvedBy) indent.approvedBy = approvedBy;
        if (rejectionReason) indent.rejectionReason = rejectionReason;
      }
    },
  },
});

export const {
  setIndents,
  addIndent,
  updateIndent,
  deleteIndent,
  setSelectedIndent,
  updateIndentStatus,
} = indentsSlice.actions;

export default indentsSlice.reducer;
