import {
  getDashboardReport,
  getAssetStatusReport,
  getIssueReport,
  getReturnReport,
  getDamagedAssetReport,
} from "../services/reportService.js";

// ==========================================
// DASHBOARD REPORT
// ==========================================

export const getDashboardReportController = async (req, res) => {
  try {
    const result = await getDashboardReport();
    res.status(200).json(result);
  } catch (error) {
    console.error("Dashboard Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard report",
      error: error.message,
    });
  }
};

export const dashboardReport = getDashboardReportController;

// ==========================================
// ASSET STATUS REPORT
// ==========================================

export const getAssetStatusReportController = async (req, res) => {
  try {
    const result = await getAssetStatusReport();
    res.status(200).json({
      success: true,
      message: "Asset status report fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Asset Status Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch asset status report",
      error: error.message,
    });
  }
};

export const assetStatusReport = getAssetStatusReportController;

// ==========================================
// ISSUE REPORT
// ==========================================

export const getIssueReportController = async (req, res) => {
  try {
    const result = await getIssueReport();
    res.status(200).json({
      success: true,
      message: "Issue report fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Issue Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch issue report",
      error: error.message,
    });
  }
};

export const issueReport = getIssueReportController;

// ==========================================
// RETURN REPORT
// ==========================================

export const getReturnReportController = async (req, res) => {
  try {
    const result = await getReturnReport();
    res.status(200).json({
      success: true,
      message: "Return report fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Return Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch return report",
      error: error.message,
    });
  }
};

export const returnReport = getReturnReportController;

// ==========================================
// DAMAGED ASSET REPORT
// ==========================================

export const getDamagedAssetReportController = async (req, res) => {
  try {
    const result = await getDamagedAssetReport();
    res.status(200).json({
      success: true,
      message: "Damaged asset report fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Damaged Asset Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch damaged asset report",
      error: error.message,
    });
  }
};

export const damagedAssetReport = getDamagedAssetReportController;

export default {
  getDashboardReportController,
  dashboardReport,
  getAssetStatusReportController,
  assetStatusReport,
  getIssueReportController,
  issueReport,
  getReturnReportController,
  returnReport,
  getDamagedAssetReportController,
  damagedAssetReport,
};
