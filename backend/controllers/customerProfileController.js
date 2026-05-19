const CustomerProfileModel = require('../models/customerProfileModel');
const { logAction } = require('../routes/audit');

const profileController = {
  async getAll(req, res) {
    try {
      const profiles = await CustomerProfileModel.findAll();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const profile = await CustomerProfileModel.findById(req.params.id);
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { error, value } = req.profileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const profileId = await CustomerProfileModel.create(value);
      const profile = await CustomerProfileModel.findById(profileId);

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'CREATE',
        entity: 'customer_profile',
        entity_id: profileId,
        ip_address,
        details: { label: value.label, segment: profile.segment }
      });

      res.status(201).json({ ...profile, message: 'Profile created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    const updateSchema = req.profileSchema.fork(Object.keys(req.profileSchema.describe().keys), f => f.optional());
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const success = await CustomerProfileModel.update(req.params.id, value);
      if (!success) return res.status(404).json({ message: 'Profile not found' });

      const profile = await CustomerProfileModel.findById(req.params.id);

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'UPDATE',
        entity: 'customer_profile',
        entity_id: parseInt(req.params.id),
        ip_address,
        details: { label: value.label, priority: value.priority }
      });

      res.json({ ...profile, message: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const success = await CustomerProfileModel.delete(req.params.id);
      if (!success) return res.status(404).json({ message: 'Profile not found' });

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'DELETE',
        entity: 'customer_profile',
        entity_id: parseInt(req.params.id),
        ip_address
      });

      res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = profileController;