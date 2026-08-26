import express from "express";

import {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
  updateIssueStatusController,
} from "../controllers/issueController.js";

const router = express.Router();

// POST /api/issues
router.post("/", createIssueController);

// GET /api/issues
router.get("/", getAllIssuesController);

// GET /api/issues/:id
router.get("/:id", getIssueByIdController);

// PATCH /api/issues/:id/status
router.patch("/:id/status", updateIssueStatusController);

export default router;