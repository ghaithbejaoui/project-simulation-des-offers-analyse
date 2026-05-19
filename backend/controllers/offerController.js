const OfferModel = require('../models/offerModel');
const { logAction } = require('../routes/audit');

const offerController = {
  async getAll(req, res) {
    try {
      const offers = await OfferModel.findAll();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const offer = await OfferModel.findById(req.params.id);
      if (!offer) return res.status(404).json({ message: 'Offer not found' });
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getWithOptions(req, res) {
    try {
      const offer = await OfferModel.findByIdWithOptions(req.params.id);
      if (!offer) return res.status(404).json({ message: 'Offer not found' });
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { error, value } = req.offerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const offerId = await OfferModel.create(value);

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'CREATE',
        entity: 'offer',
        entity_id: offerId,
        ip_address,
        details: { name: value.name, segment: value.segment, monthly_price: value.monthly_price }
      });

      res.status(201).json({ offer_id: offerId, message: 'Offer created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    const updateSchema = req.offerSchema.fork(Object.keys(req.offerSchema.describe().keys), f => f.optional());
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const success = await OfferModel.update(req.params.id, value);
      if (!success) return res.status(404).json({ message: 'Offer not found' });

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'UPDATE',
        entity: 'offer',
        entity_id: parseInt(req.params.id),
        ip_address,
        details: { name: value.name, segment: value.segment, monthly_price: value.monthly_price, status: value.status }
      });

      res.json({ message: 'Offer updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const success = await OfferModel.delete(req.params.id);
      if (!success) return res.status(404).json({ message: 'Offer not found' });

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'DELETE',
        entity: 'offer',
        entity_id: parseInt(req.params.id),
        ip_address
      });

      res.json({ message: 'Offer deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = offerController;