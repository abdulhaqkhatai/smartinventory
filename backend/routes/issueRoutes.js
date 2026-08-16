import express from "express";

import {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
} from "../controllers/issueController.js";

const router = express.Router();


// POST /api/issues
router.post("/", createIssueController);


// GET /api/issues
router.get("/", getAllIssuesController);


// GET /api/issues/:id
router.get("/:id", getIssueByIdController);


export default router;