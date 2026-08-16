import express from "express";

import {
  getDashboardReportController,
  getAssetStatusReportController,
  getIssueReportController,
  getReturnReportController,
  getDamagedAssetReportController,
} from "../controllers/reportController.js";

const router = express.Router();


// Dashboard
router.get("/dashboard", getDashboardReportController);


// Asset status
router.get("/assets/status", getAssetStatusReportController);


// Issues
router.get("/issues", getIssueReportController);


// Returns
router.get("/returns", getReturnReportController);


// Damaged assets
router.get("/assets/damaged", getDamagedAssetReportController);


export default router;