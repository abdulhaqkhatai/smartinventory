import {
  createIssue,
  getAllIssues,
  getIssueById,
} from "../services/issueService.js";


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

    if (!asset_id || !user_id || !issue_date) {
      return res.status(400).json({
        success: false,
        message: "asset_id, user_id and issue_date are required",
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

    return res.status(201).json({
      success: true,
      message: "Asset issued successfully",
      data: issue,
    });

  } catch (error) {
    console.error("Create issue error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const getAllIssuesController = async (req, res) => {
  try {
    const issues = await getAllIssues();

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });

  } catch (error) {
    console.error("Get issues error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getIssueByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await getIssueById(id);

    return res.status(200).json({
      success: true,
      data: issue,
    });

  } catch (error) {
    console.error("Get issue error:", error.message);

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


export {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
};