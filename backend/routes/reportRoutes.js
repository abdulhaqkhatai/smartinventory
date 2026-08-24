import express from "express";

import {
  dashboardReport,
  assetStatusReport,
  issueReport,
  returnReport,
  damagedAssetReport,
} from "../controllers/reportController.js";

const router = express.Router();

// ==========================================
// DASHBOARD REPORT
// ==========================================
router.get("/dashboard", dashboardReport);

// ==========================================
// ASSET STATUS REPORT
// ==========================================
router.get("/asset-status", assetStatusReport);
router.get("/assets/status", assetStatusReport);

// ==========================================
// ISSUE REPORT
// ==========================================
router.get("/issues", issueReport);

// ==========================================
// RETURN REPORT
// ==========================================
router.get("/returns", returnReport);

// ==========================================
// DAMAGED ASSET REPORT
// ==========================================
router.get("/damaged-assets", damagedAssetReport);
router.get("/assets/damaged", damagedAssetReport);

export default router;