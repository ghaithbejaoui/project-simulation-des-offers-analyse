const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const simulationController = require('../controllers/simulationController');

/**
 * @swagger
 * components:
 *   schemas:
 *     SimulationInput:
 *       type: object
 *       required:
 *         - profile_id
 *         - offer_id
 *       properties:
 *         profile_id:
 *           type: integer
 *           description: The customer profile ID
 *         offer_id:
 *           type: integer
 *           description: The offer ID
 * 
 *     SimulationResult:
 *       type: object
 *       properties:
 *         input:
 *           type: object
 *         profile:
 *           type: object
 *         offer:
 *           type: object
 *         calculation:
 *           type: object
 * 
 *     RecommendationInput:
 *       type: object
 *       properties:
 *         profile_id:
 *           type: integer
 *           description: The customer profile ID (optional)
 *         limit:
 *           type: integer
 *           default: 5
 *         segment:
 *           type: string
 *           enum: [PREPAID, POSTPAID, BUSINESS, DATA_ONLY]
 * 
 *     CompareInput:
 *       type: object
 *       required:
 *         - profile_id
 *         - offer_ids
 *       properties:
 *         profile_id:
 *           type: integer
 *         offer_ids:
 *           type: array
 *           items:
 *             type: integer
 * 
 *     BatchInput:
 *       type: object
 *       required:
 *         - offer_id
 *       properties:
 *         offer_id:
 *           type: integer
 *         profile_ids:
 *           type: array
 *           items:
 *             type: integer
 */

/**
 * @swagger
 * /api/simulation:
 *   post:
 *     summary: Run a basic simulation (one profile + one offer)
 *     tags: [Simulation]
 *     description: "EN: Run a basic simulation comparing one customer profile with one offer - FR: Exécuter une simulation de base comparant un profil client avec une offre"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SimulationInput'
 *     responses:
 *       200:
 *         description: Simulation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulationResult'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Profile or offer not found
 */

router.post('/', requireAuth, simulationController.runSingle);

/**
 * @swagger
 * /api/simulation/recommend:
 *   post:
 *     summary: Get smart offer recommendations
 *     tags: [Simulation]
 *     description: "EN: Get intelligent offer recommendations based on customer profile or usage parameters - FR: Obtenir des recommandations d'offres intelligentes basées sur le profil client"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecommendationInput'
 *     responses:
 *       200:
 *         description: List of recommended offers
 *       404:
 *         description: Profile not found
 */

router.post('/recommend', requireAuth, simulationController.recommend);

/**
 * @swagger
 * /api/simulation/compare:
 *   post:
 *     summary: Compare multiple offers
 *     tags: [Simulation]
 *     description: "EN: Compare multiple offers side by side for a specific customer profile - FR: Comparer plusieurs offres côte à côte pour un profil client spécifique"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompareInput'
 *     responses:
 *       200:
 *         description: Comparison results
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Profile or offers not found
 */

router.post('/compare', requireAuth, simulationController.compare);

/**
 * @swagger
 * /api/simulation/batch:
 *   post:
 *     summary: Analyze one offer across multiple profiles
 *     tags: [Simulation]
 *     description: "EN: Analyze how a single offer performs across multiple customer profiles - FR: Analyser comment une seule offre se comporte sur plusieurs profils clients"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchInput'
 *     responses:
 *       200:
 *         description: Batch analysis results
 *       400:
 *         description: Missing offer_id
 *       404:
 *         description: Offer or profiles not found
 */

router.post('/batch', requireAuth, simulationController.batch);

module.exports = router;