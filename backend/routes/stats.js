const express = require('express');
const router = express.Router();

const statsController = require('../controllers/statsController');

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

router.get('/', statsController.getStatistics);

module.exports = router;