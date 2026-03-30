const express = require('express');
const db = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalOffers:
 *           type: integer
 *           description: Total number of telecom offers
 *         totalProfiles:
 *           type: integer
 *           description: Total number of customer profiles
 *         offersBySegment:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               segment:
 *                 type: string
 *               count:
 *                 type: integer
 *           description: Offers grouped by segment (PREPAID, POSTPAID, BUSINESS)
 *         averagePrice:
 *           type: number
 *           description: Average monthly price of all offers
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Statistics]
 *     description: "EN: Get statistics for the dashboard - FR: Obtenir les statistiques du tableau de bord"
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       500:
 *         description: Server error
 */

// GET /api/stats - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
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
