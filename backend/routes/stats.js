const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET /api/stats - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    // You need 4 queries:
    // 1. Total offers count
    // 2. Total customer profiles count  
    // 3. Offers grouped by segment
    // 4. Average monthly price
    
    const [totalOffers] = await db.query('SELECT COUNT(*) as count FROM offers');
    const [totalProfiles] = await db.query('SELECT COUNT(*) as count FROM customer_profiles');
    const [offersBySegment] = await db.query(`
      SELECT segment, COUNT(*) as count 
      FROM offers 
      GROUP BY segment
    `);
    const [avgPrice] = await db.query('SELECT AVG(monthly_price) as avg FROM offers');

    res.json({
      totalOffers: totalOffers[0].count,
      totalProfiles: totalProfiles[0].count,
      offersBySegment: offersBySegment,
      averagePrice: parseFloat(avgPrice[0].avg) || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
