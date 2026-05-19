const StatsModel = require('../models/statsModel');

const statsController = {
  async getStatistics(req, res) {
    try {
      const stats = await StatsModel.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = statsController;