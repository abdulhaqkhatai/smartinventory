import * as purchaseOrderService from '../services/purchaseOrderService.js';

// Fallback data
const fallbackPurchaseOrders = [
  {
    id: 1,
    code: 'PO-2024-001',
    vendor_id: 1,
    vendor_name: 'TechWorld Solutions Pvt. Ltd.',
    indent_ref: 'IND-2024-001',
    date: '2024-12-17',
    delivery_date: '2024-12-25',
    status: 'pending',
    items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', quantity: 5, rate: 2450, gstRate: 18 }],
    subtotal: 12250,
    gst_amount: 2205,
    total_amount: 14455,
    terms: 'Standard terms apply',
    payment_terms: 'Net 30',
    created_at: '2024-12-17T09:30:00.000Z',
    updated_at: '2024-12-17T09:30:00.000Z',
  },
];

// Get all purchase orders
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, vendorId, limit, offset } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (vendorId) filters.vendorId = vendorId;

    let pos = [];
    let count = 0;
    
    try {
      pos = await purchaseOrderService.getAllPurchaseOrders(filters, limit, offset);
      count = await purchaseOrderService.getPurchaseOrderCount(filters);
    } catch (err) {
      console.warn('Service error, using fallback data:', err.message);
      // Use fallback data
      let fallback = [...fallbackPurchaseOrders];
      if (status) fallback = fallback.filter(p => p.status === status);
      if (vendorId) fallback = fallback.filter(p => String(p.vendor_id) === String(vendorId));
      
      const start = parseInt(offset) || 0;
      const pageSize = parseInt(limit) || 20;
      pos = fallback.slice(start, start + pageSize);
      count = fallback.length;
    }

    res.json({
      success: true,
      data: pos,
      pagination: {
        total: count,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get purchase order by ID
export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const po = await purchaseOrderService.getPurchaseOrderById(id);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({ success: true, data: po });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new purchase order
export const createPurchaseOrder = async (req, res) => {
  try {
    const { vendorId, vendorName, indentRef, items, deliveryDate, terms, paymentTerms } = req.body;

    // Validation
    if (!vendorId || !vendorName || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: vendorId, vendorName, items',
      });
    }

    const po = await purchaseOrderService.createPurchaseOrder({
      vendorId,
      vendorName,
      indentRef,
      items,
      deliveryDate,
      terms,
      paymentTerms,
    });

    res.status(201).json({
      success: true,
      data: po,
      message: 'Purchase order created successfully',
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update purchase order
export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const po = await purchaseOrderService.updatePurchaseOrder(id, updateData);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({ success: true, data: po, message: 'Purchase order updated successfully' });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete purchase order
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await purchaseOrderService.deletePurchaseOrder(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update purchase order status
export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const po = await purchaseOrderService.updatePurchaseOrderStatus(id, status);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({
      success: true,
      data: po,
      message: 'Purchase order status updated successfully',
    });
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get purchase orders by indent reference
export const getPurchaseOrdersByIndent = async (req, res) => {
  try {
    const { indentRef } = req.params;
    const pos = await purchaseOrderService.getAllPurchaseOrders({ indentRef });

    res.json({ success: true, data: pos });
  } catch (error) {
    console.error('Error fetching purchase orders by indent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get purchase orders by vendor
export const getPurchaseOrdersByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const pos = await purchaseOrderService.getAllPurchaseOrders({ vendorId });

    res.json({ success: true, data: pos });
  } catch (error) {
    console.error('Error fetching purchase orders by vendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get purchase orders by status
export const getPurchaseOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const pos = await purchaseOrderService.getAllPurchaseOrders({ status });

    res.json({ success: true, data: pos });
  } catch (error) {
    console.error('Error fetching purchase orders by status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
