import * as indentService from '../services/indentService.js';

// Fallback data
const fallbackIndents = [
  {
    id: 1,
    code: 'IND-2024-001',
    requested_by: 'Sneha Reddy',
    department: 'Engineering',
    date: '2024-12-15',
    status: 'approved',
    items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', quantity: 5, unit: 'PCS' }],
    remarks: 'Required for new setup',
    approved_by: 'Department Head',
    approval_date: '2024-12-16',
    rejection_reason: null,
    created_at: '2024-12-15T10:00:00.000Z',
    updated_at: '2024-12-16T10:00:00.000Z',
  },
];

// Get all indents
export const getAllIndents = async (req, res) => {
  try {
    const { status, department, limit, offset } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (department) filters.department = department;

    let indents = [];
    let count = 0;
    
    try {
      console.log('[getAllIndents] Calling service...');
      indents = await indentService.getAllIndents(filters, limit, offset);
      console.log('[getAllIndents] Service returned:', indents?.length);
      count = await indentService.getIndentCount(filters);
    } catch (err) {
      console.warn('[getAllIndents] Catch - Service error:', err.message);
      // Use fallback data
      let fallback = [...fallbackIndents];
      if (status) fallback = fallback.filter(i => i.status === status);
      if (department) fallback = fallback.filter(i => i.department === department);
      
      const start = parseInt(offset) || 0;
      const pageSize = parseInt(limit) || 20;
      indents = fallback.slice(start, start + pageSize);
      count = fallback.length;
    }

    res.json({
      success: true,
      data: indents,
      pagination: {
        total: count,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching indents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get indent by ID
export const getIndentById = async (req, res) => {
  try {
    const { id } = req.params;
    const indent = await indentService.getIndentById(id);

    if (!indent) {
      return res.status(404).json({ success: false, message: 'Indent not found' });
    }

    res.json({ success: true, data: indent });
  } catch (error) {
    console.error('Error fetching indent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new indent
export const createIndent = async (req, res) => {
  try {
    const { requestedBy, department, items, remarks } = req.body;

    // Validation
    if (!requestedBy || !department || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: requestedBy, department, items',
      });
    }

    const indent = await indentService.createIndent({
      requestedBy,
      department,
      items,
      remarks,
    });

    res.status(201).json({ success: true, data: indent, message: 'Indent created successfully' });
  } catch (error) {
    console.error('Error creating indent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update indent
export const updateIndent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const indent = await indentService.updateIndent(id, updateData);

    if (!indent) {
      return res.status(404).json({ success: false, message: 'Indent not found' });
    }

    res.json({ success: true, data: indent, message: 'Indent updated successfully' });
  } catch (error) {
    console.error('Error updating indent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete indent
export const deleteIndent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await indentService.deleteIndent(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Indent not found' });
    }

    res.json({ success: true, message: 'Indent deleted successfully' });
  } catch (error) {
    console.error('Error deleting indent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update indent status (approve/reject)
export const updateIndentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting indent',
      });
    }

    if ((status === 'approved' || status === 'rejected') && !approvedBy) {
      return res.status(400).json({ success: false, message: 'Approver name is required' });
    }

    const indent = await indentService.updateIndentStatus(id, {
      status,
      approvedBy,
      rejectionReason,
    });

    if (!indent) {
      return res.status(404).json({ success: false, message: 'Indent not found' });
    }

    res.json({ success: true, data: indent, message: `Indent ${status} successfully` });
  } catch (error) {
    console.error('Error updating indent status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get indents by status
export const getIndentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const indents = await indentService.getAllIndents({ status });

    res.json({ success: true, data: indents });
  } catch (error) {
    console.error('Error fetching indents by status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get indents by department
export const getIndentsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const indents = await indentService.getAllIndents({ department });

    res.json({ success: true, data: indents });
  } catch (error) {
    console.error('Error fetching indents by department:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
