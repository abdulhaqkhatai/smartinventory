import * as grnService from '../services/grnService.js';

// Fallback data
const fallbackGRNs = [
  {
    id: 1,
    code: 'GRN-2024-001',
    po_ref: 'PO-2024-001',
    vendor_name: 'TechWorld Solutions Pvt. Ltd.',
    date: '2024-12-24',
    received_by: 'Priya Sharma',
    status: 'completed',
    items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', orderedQty: 5, receivedQty: 5, damagedQty: 0, acceptedQty: 5 }],
    remarks: 'All items received in good condition',
    created_at: '2024-12-24T09:15:00.000Z',
    updated_at: '2024-12-24T09:15:00.000Z',
  },
];

// Get all GRNs
export const getAllGRNs = async (req, res) => {
  try {
    const { status, poRef, limit, offset } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (poRef) filters.poRef = poRef;

    let grns = [];
    let count = 0;
    
    try {
      grns = await grnService.getAllGRNs(filters, limit, offset);
      count = await grnService.getGRNCount(filters);
    } catch (err) {
      console.warn('Service error, using fallback data:', err.message);
      // Use fallback data
      let fallback = [...fallbackGRNs];
      if (status) fallback = fallback.filter(g => g.status === status);
      if (poRef) fallback = fallback.filter(g => g.po_ref === poRef);
      
      const start = parseInt(offset) || 0;
      const pageSize = parseInt(limit) || 20;
      grns = fallback.slice(start, start + pageSize);
      count = fallback.length;
    }

    res.json({
      success: true,
      data: grns,
      pagination: {
        total: count,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching GRNs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get GRN by ID
export const getGRNById = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await grnService.getGRNById(id);

    if (!grn) {
      return res.status(404).json({ success: false, message: 'GRN not found' });
    }

    res.json({ success: true, data: grn });
  } catch (error) {
    console.error('Error fetching GRN:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new GRN
export const createGRN = async (req, res) => {
  try {
    const { poRef, vendorName, receivedBy, items, remarks } = req.body;

    // Validation
    if (!poRef || !vendorName || !receivedBy || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: poRef, vendorName, receivedBy, items',
      });
    }

    const grn = await grnService.createGRN({
      poRef,
      vendorName,
      receivedBy,
      items,
      remarks,
    });

    res.status(201).json({
      success: true,
      data: grn,
      message: 'GRN created successfully',
    });
  } catch (error) {
    console.error('Error creating GRN:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update GRN
export const updateGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const grn = await grnService.updateGRN(id, updateData);

    if (!grn) {
      return res.status(404).json({ success: false, message: 'GRN not found' });
    }

    res.json({ success: true, data: grn, message: 'GRN updated successfully' });
  } catch (error) {
    console.error('Error updating GRN:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete GRN
export const deleteGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await grnService.deleteGRN(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'GRN not found' });
    }

    res.json({ success: true, message: 'GRN deleted successfully' });
  } catch (error) {
    console.error('Error deleting GRN:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get GRNs by PO reference
export const getGRNsByPO = async (req, res) => {
  try {
    const { poRef } = req.params;
    const grns = await grnService.getAllGRNs({ poRef });

    res.json({ success: true, data: grns });
  } catch (error) {
    console.error('Error fetching GRNs by PO:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get GRNs by status
export const getGRNsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const grns = await grnService.getAllGRNs({ status });

    res.json({ success: true, data: grns });
  } catch (error) {
    console.error('Error fetching GRNs by status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get GRNs by vendor
export const getGRNsByVendor = async (req, res) => {
  try {
    const { vendorName } = req.params;
    const grns = await grnService.getAllGRNs({ vendorName });

    res.json({ success: true, data: grns });
  } catch (error) {
    console.error('Error fetching GRNs by vendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
