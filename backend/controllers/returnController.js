import {
  createReturn,
  getAllReturns,
  getReturnById,
  updateReturnStatus,
} from "../services/returnService.js";


const createReturnController = async (req, res) => {
  try {

    const {
      asset_id,
      user_id,
      return_date,
      return_condition,
      damage_description,
      notes,
    } = req.body;

    if (!asset_id || !user_id || !return_date) {
      return res.status(400).json({
        success: false,
        message: "asset_id, user_id and return_date are required",
      });
    }

    const userRole = (req.userRole || '').toLowerCase();
    const status = userRole === 'employee' ? 'Pending' : 'Approved';

    const result = await createReturn({
      asset_id,
      user_id,
      return_date,
      return_condition,
      damage_description,
      notes,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Asset returned successfully",
      data: result,
    });

  } catch (error) {

    console.error("Create return error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const getAllReturnsController = async (req, res) => {
  try {

    const returns = await getAllReturns();

    return res.status(200).json({
      success: true,
      count: returns.length,
      data: returns,
    });

  } catch (error) {

    console.error("Get returns error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getReturnByIdController = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await getReturnById(id);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error("Get return error:", error.message);

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


const updateReturnStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updatedReturn = await updateReturnStatus(id, status);
    res.json({ success: true, data: updatedReturn });
  } catch (error) {
    console.error("Update Return Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};


export {
  createReturnController,
  getAllReturnsController,
  getReturnByIdController,
  updateReturnStatusController,
};