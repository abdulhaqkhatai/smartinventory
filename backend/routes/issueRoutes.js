import express from "express";

import {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
} from "../controllers/issueController.js";

const router = express.Router();


// CREATE ISSUE
router.post("/", createIssueController);


// GET ALL ISSUES
router.get("/", getAllIssuesController);


// GET ISSUE BY ID
router.get("/:id", getIssueByIdController);


export default router;