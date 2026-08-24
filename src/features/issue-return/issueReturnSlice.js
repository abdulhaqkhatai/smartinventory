import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  issues: [],
  returns: [],
  loading: false,
  error: null,
};

const issueReturnSlice = createSlice({
  name: "issueReturn",
  initialState,

  reducers: {
    setIssues: (state, action) => {
      state.issues = action.payload;
    },

    setReturns: (state, action) => {
      state.returns = action.payload;
    },

    addIssue: (state, action) => {
      state.issues.push(action.payload);
    },

    addReturn: (state, action) => {
      state.returns.push(action.payload);
    },
  },
});

export const {
  setIssues,
  setReturns,
  addIssue,
  addReturn,
} = issueReturnSlice.actions;

export default issueReturnSlice.reducer;