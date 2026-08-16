import express from "express";

import {
  createAssetController,
  getAllAssetsController,
  getAssetByIdController,
  updateAssetController,
  deleteAssetController,
  getAssetHistoryController,
} from "../controllers/assetController.js";

const router = express.Router();

router.post("/", createAssetController);
router.get("/", getAllAssetsController);
router.get("/:id", getAssetByIdController);
router.put("/:id", updateAssetController);
router.delete("/:id", deleteAssetController);
router.get("/:id/history", getAssetHistoryController);

export default router;
