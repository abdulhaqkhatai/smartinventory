import express from "express";

import {
  createReturnController,
  getAllReturnsController,
  getReturnByIdController,
} from "../controller/returnController.js";

const router = express.Router();

// POST /api/returns
router.post("/", createReturnController);

// GET /api/returns
router.get("/", getAllReturnsController);

// GET /api/returns/:id
router.get("/:id", getReturnByIdController);

export default router;