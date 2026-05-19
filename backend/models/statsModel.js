const db = require('../config/database');

class StatsModel {
  static async getStatistics() {
    const [totalOffers] = await db.query('SELECT COUNT(*) as count FROM offers');
    const [totalProfiles] = await db.query('SELECT COUNT(*) as count FROM customer_profiles');
    const [offersBySegment] = await db.query(`
      SELECT segment, COUNT(*) as count 
      FROM offers 
      GROUP BY segment
    `);
    const [avgPrice] = await db.query('SELECT AVG(monthly_price) as avg FROM offers');

    return {
      totalOffers: totalOffers[0].count,
      totalProfiles: totalProfiles[0].count,
      offersBySegment: offersBySegment,
      averagePrice: parseFloat(avgPrice[0].avg) || 0
    };
  }
}

module.exports = StatsModel;