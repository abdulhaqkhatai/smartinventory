import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assets: [],
  loading: false,
  error: null,
  selectedAsset: null,
};

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    setAssets: (state, action) => {
      state.assets = action.payload;
    },
    addAsset: (state, action) => {
      state.assets.unshift(action.payload);
    },
    updateAsset: (state, action) => {
      const index = state.assets.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.assets[index] = action.payload;
    },
    deleteAsset: (state, action) => {
      state.assets = state.assets.filter((a) => a.id !== action.payload);
    },
    setSelectedAsset: (state, action) => {
      state.selectedAsset = action.payload;
    },
    assignAsset: (state, action) => {
      const { id, assignedTo, department, location } = action.payload;
      const asset = state.assets.find((a) => a.id === id);
      if (asset) {
        asset.assignedTo = assignedTo;
        asset.department = department;
        asset.location = location;
        asset.status = "in-use";
      }
    },
    unassignAsset: (state, action) => {
      const asset = state.assets.find((a) => a.id === action.payload);
      if (asset) {
        asset.assignedTo = null;
        asset.department = null;
        asset.status = "available";
      }
    },
  },
});

export const {
  setAssets,
  addAsset,
  updateAsset,
  deleteAsset,
  setSelectedAsset,
  assignAsset,
  unassignAsset,
} = assetsSlice.actions;
export default assetsSlice.reducer;
