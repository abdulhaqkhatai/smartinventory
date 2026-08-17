import { vendorService } from '../services/vendorService.js';

export const vendorController = {
  async getAllVendors(req, res) {
    try {
      const { search, status } = req.query;
      const filters = { search, status };
      const vendors = await vendorService.getAllVendors(filters);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getVendorById(req, res) {
    try {
      const { id } = req.params;
      const vendor = await vendorService.getVendorById(id);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async createVendor(req, res) {
    try {
      const vendorData = req.body;
      if (!vendorData.name) {
        return res.status(400).json({ message: 'Vendor name required' });
      }
      const newVendor = await vendorService.createVendor(vendorData);
      res.status(201).json(newVendor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateVendor(req, res) {
    try {
      const { id } = req.params;
      const vendorData = req.body;
      const success = await vendorService.updateVendor(id, vendorData);
      if (!success) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      res.json({ message: 'Vendor updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteVendor(req, res) {
    try {
      const { id } = req.params;
      const success = await vendorService.deleteVendor(id);
      if (!success) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
