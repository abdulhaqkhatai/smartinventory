import { itemService } from '../services/itemService.js';

export const itemController = {
  async getAllItems(req, res) {
    try {
      const { search, category } = req.query;
      const filters = { search, category };
      const items = await itemService.getAllItems(filters);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await itemService.getItemById(id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async createItem(req, res) {
    try {
      const itemData = req.body;
      if (!itemData.name || !itemData.category) {
        return res.status(400).json({ message: 'Name and category required' });
      }
      const newItem = await itemService.createItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const itemData = req.body;
      const success = await itemService.updateItem(id, itemData);
      if (!success) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json({ message: 'Item updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const success = await itemService.deleteItem(id);
      if (!success) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
