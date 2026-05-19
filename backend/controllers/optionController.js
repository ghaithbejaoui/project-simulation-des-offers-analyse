const OptionModel = require('../models/optionModel');
const { logAction } = require('../routes/audit');

const optionController = {
  async getAll(req, res) {
    try {
      const options = await OptionModel.findAll();
      res.json(options);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const option = await OptionModel.findById(req.params.id);
      if (!option) return res.status(404).json({ message: 'Option not found' });
      res.json(option);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { name, type, price, data_gb = 0, minutes = 0, sms = 0, validity_days = 30 } = req.body;
    try {
      const optionId = await OptionModel.create({ name, type, price, data_gb, minutes, sms, validity_days });

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'CREATE',
        entity: 'option',
        entity_id: optionId,
        ip_address,
        details: { name, type, price }
      });

      res.status(201).json({ option_id: optionId, message: 'Option created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    const { name, type, price, data_gb, minutes, sms, validity_days } = req.body;
    try {
      const success = await OptionModel.update(req.params.id, { name, type, price, data_gb, minutes, sms, validity_days });
      if (!success) return res.status(404).json({ message: 'Option not found' });

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'UPDATE',
        entity: 'option',
        entity_id: parseInt(req.params.id),
        ip_address,
        details: { name, type, price }
      });

      res.json({ message: 'Option updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const success = await OptionModel.delete(req.params.id);
      if (!success) return res.status(404).json({ message: 'Option not found' });

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'DELETE',
        entity: 'option',
        entity_id: parseInt(req.params.id),
        ip_address
      });

      res.json({ message: 'Option deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = optionController;