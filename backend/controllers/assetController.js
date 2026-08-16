import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetHistory,
} from "../services/assetService.js";


// ==========================================
// CREATE ASSET
// ==========================================

const createAssetController = async (req, res) => {

  try {

    const {
      asset_code,
      asset_name,
      category,
      serial_number,
      purchase_date,
      purchase_price,
      location,
      status,
      description,
    } = req.body;

    if (!asset_code || !asset_name) {

      return res.status(400).json({
        success: false,
        message: "asset_code and asset_name are required",
      });

    }

    const asset = await createAsset({
      asset_code,
      asset_name,
      category,
      serial_number,
      purchase_date,
      purchase_price,
      location,
      status,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: asset,
    });

  } catch (error) {

    console.error("Create asset error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ALL ASSETS
// ==========================================

const getAllAssetsController = async (req, res) => {

  try {

    const assets = await getAllAssets();

    return res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ASSET BY ID
// ==========================================

const getAssetByIdController = async (req, res) => {

  try {

    const { id } = req.params;

    const asset = await getAssetById(id);

    return res.status(200).json({
      success: true,
      data: asset,
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// UPDATE ASSET
// ==========================================

const updateAssetController = async (req, res) => {

  try {

    const { id } = req.params;

    const asset = await updateAsset(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data: asset,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// DELETE ASSET
// ==========================================

const deleteAssetController = async (req, res) => {

  try {

    const { id } = req.params;

    await deleteAsset(id);

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// ASSET HISTORY
// ==========================================

const getAssetHistoryController = async (req, res) => {

  try {

    const { id } = req.params;

    const history = await getAssetHistory(id);

    return res.status(200).json({
      success: true,
      data: history,
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


export {
  createAssetController,
  getAllAssetsController,
  getAssetByIdController,
  updateAssetController,
  deleteAssetController,
  getAssetHistoryController,
};