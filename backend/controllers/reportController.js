import {
    getDashboardReport,
    getAssetStatusReport,
    getIssueReport,
    getReturnReport,
    getDamagedAssetReport
} from "../services/reportService.js";

// ==========================================
// DASHBOARD REPORT
// ==========================================

const dashboardReport = async (req, res) => {
    try {
        const result = await getDashboardReport();

        res.status(200).json({
            success: true,
            message: "Dashboard report fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Dashboard Report Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard report",
            error: error.message
        });
    }
};

// ==========================================
// ASSET STATUS REPORT
// ==========================================

const assetStatusReport = async (req, res) => {
    try {
        const result = await getAssetStatusReport();

        res.status(200).json({
            success: true,
            message: "Asset status report fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Asset Status Report Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch asset status report",
            error: error.message
        });
    }
};

// ==========================================
// ISSUE REPORT
// ==========================================

const issueReport = async (req, res) => {
    try {
        const result = await getIssueReport();

        res.status(200).json({
            success: true,
            message: "Issue report fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Issue Report Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch issue report",
            error: error.message
        });
    }
};

// ==========================================
// RETURN REPORT
// ==========================================

const returnReport = async (req, res) => {
    try {
        const result = await getReturnReport();

        res.status(200).json({
            success: true,
            message: "Return report fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Return Report Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch return report",
            error: error.message
        });
    }
};

// ==========================================
// DAMAGED ASSET REPORT
// ==========================================

const damagedAssetReport = async (req, res) => {
    try {
        const result = await getDamagedAssetReport();

        res.status(200).json({
            success: true,
            message: "Damaged asset report fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Damaged Asset Report Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch damaged asset report",
            error: error.message
        });
    }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

export {
    dashboardReport,
    assetStatusReport,
    issueReport,
    returnReport,
    damagedAssetReport
};