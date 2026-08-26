import express from "express";

import {
  createReturnController,
  getAllReturnsController,
  getReturnByIdController,
  updateReturnStatusController,
} from "../controllers/returnController.js";

const router = express.Router();

// POST /api/returns
router.post("/", createReturnController);

// GET /api/returns
router.get("/", getAllReturnsController);

// GET /api/returns/:id
router.get("/:id", getReturnByIdController);

// PATCH /api/returns/:id/status
router.patch("/:id/status", updateReturnStatusController);

export default router;