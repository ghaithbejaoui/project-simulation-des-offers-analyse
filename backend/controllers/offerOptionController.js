const OfferOptionModel = require('../models/offerOptionModel');
const { logAction } = require('../routes/audit');

const offerOptionController = {
  async getAll(req, res) {
    try {
      const offerOptions = await OfferOptionModel.findAll();
      res.json(offerOptions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByOfferId(req, res) {
    try {
      const options = await OfferOptionModel.findByOfferId(req.params.id);
      res.json(options);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByOptionId(req, res) {
    try {
      const offers = await OfferOptionModel.findByOptionId(req.params.id);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { offer_id, option_id } = req.body;
    try {
      const id = await OfferOptionModel.create(offer_id, option_id);

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'LINK',
        entity: 'offer_option',
        entity_id: id,
        ip_address,
        details: { offer_id, option_id }
      });

      res.status(201).json({ message: 'Option added to offer successfully', offer_id, option_id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    const { offer_id, option_id } = req.body;
    try {
      const success = await OfferOptionModel.delete(offer_id, option_id);
      if (!success) return res.status(404).json({ message: 'Offer-Option relationship not found' });

      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'UNLINK',
        entity: 'offer_option',
        ip_address,
        details: { offer_id, option_id }
      });

      res.json({ message: 'Option removed from offer successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = offerOptionController;