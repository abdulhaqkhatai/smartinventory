import {
  createIssue,
  getAllIssues,
  getIssueById,
} from "../services/issueService.js";


// ==========================================
// CREATE ISSUE
// ==========================================

const createIssueController = async (req, res) => {
  try {
    const {
      asset_id,
      user_id,
      issue_date,
      expected_return_date,
      issue_condition,
      notes,
    } = req.body;

    if (!asset_id) {
      return res.status(400).json({
        success: false,
        message: "asset_id is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const issue = await createIssue({
      asset_id,
      user_id,
      issue_date,
      expected_return_date,
      issue_condition,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Item issued successfully",
      data: issue,
    });

  } catch (error) {
    console.error("Create Issue Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create issue",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL ISSUES
// ==========================================

const getAllIssuesController = async (req, res) => {
  try {
    const issues = await getAllIssues();

    res.status(200).json({
      success: true,
      data: issues,
    });

  } catch (error) {
    console.error("Get Issues Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};


// ==========================================
// GET ISSUE BY ID
// ==========================================

const getIssueByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await getIssueById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });

  } catch (error) {
    console.error("Get Issue Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch issue",
      error: error.message,
    });
  }
};


export {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
};