const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

const profileSchema = Joi.object({
  label: Joi.string().max(100).required(),
  minutes_avg: Joi.number().integer().min(0).default(0),
  sms_avg: Joi.number().integer().min(0).default(0),
  data_avg_gb: Joi.number().min(0).default(0),
  night_usage_pct: Joi.number().min(0).max(100).default(0),
  roaming_days: Joi.number().integer().min(0).default(0),
  budget_max: Joi.number().min(0).default(0),
  priority: Joi.string().valid('BALANCED', 'PRICE', 'QUALITY').default('BALANCED')
});

const profileController = require('../controllers/customerProfileController');

router.use((req, res, next) => {
  req.profileSchema = profileSchema;
  next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerProfile:
 *       type: object
 *       properties:
 *         profile_id:
 *           type: integer
 *           description: The auto-generated ID of the profile
 *         label:
 *           type: string
 *           description: Name of the customer profile
 *         minutes_avg:
 *           type: integer
 *           description: Average monthly minutes usage
 *         sms_avg:
 *           type: integer
 *           description: Average monthly SMS usage
 *         data_avg_gb:
 *           type: integer
 *           description: Average monthly data usage in GB
 *         night_usage_pct:
 *           type: number
 *           description: Percentage of usage during night hours
 *         roaming_days:
 *           type: integer
 *           description: Average roaming days per year
 *         budget_max:
 *           type: number
 *           description: Maximum monthly budget
 *         priority:
 *           type: string
 *           enum: [BALANCED, PRICE, QUALITY]
 *           description: Customer priority preference
 */

/**
 * @swagger
 * /api/customer-profiles:
 *   get:
 *     summary: Returns all customer profiles
 *     tags: [Customer Profiles]
 *     description: "EN: Get all customer profiles - FR: Obtenir tous les profils clients"
 *     responses:
 *       200:
 *         description: A list of all customer profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerProfile'
 */

router.get('/', requireAuth, profileController.getAll);

/**
 * @swagger
 * /api/customer-profiles/{id}:
 *   get:
 *     summary: Get a customer profile by ID
 *     tags: [Customer Profiles]
 *     description: "EN: Get a specific customer profile by its ID - FR: Obtenir un profil client spécifique par son ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The profile ID
 *     responses:
 *       200:
 *         description: A customer profile object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerProfile'
 *       404:
 *         description: Profile not found
 */

router.get('/:id', requireAuth, profileController.getById);

/**
 * @swagger
 * /api/customer-profiles:
 *   post:
 *     summary: Create a new customer profile
 *     tags: [Customer Profiles]
 *     description: "EN: Create a new customer profile - FR: Créer un nouveau profil client"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *             properties:
 *               label:
 *                 type: string
 *               minutes_avg:
 *                 type: integer
 *                 default: 0
 *               sms_avg:
 *                 type: integer
 *                 default: 0
 *               data_avg_gb:
 *                 type: integer
 *                 default: 0
 *               night_usage_pct:
 *                 type: number
 *                 default: 0
 *               roaming_days:
 *                 type: integer
 *                 default: 0
 *               budget_max:
 *                 type: number
 *                 default: 0
 *               priority:
 *                 type: string
 *                 enum: [BALANCED, PRICE, QUALITY]
 *                 default: BALANCED
 *     responses:
 *       201:
 *         description: Profile created
 */

router.post('/', requireRole('ADMIN', 'ANALYST'), profileController.create);

/**
 * @swagger
 * /api/customer-profiles/{id}:
 *   put:
 *     summary: Update a customer profile
 *     tags: [Customer Profiles]
 *     description: "EN: Update an existing customer profile - FR: Mettre à jour un profil client existant"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */

router.put('/:id', requireRole('ADMIN', 'ANALYST'), profileController.update);

/**
 * @swagger
 * /api/customer-profiles/{id}:
 *   delete:
 *     summary: Delete a customer profile
 *     tags: [Customer Profiles]
 *     description: "EN: Delete an existing customer profile - FR: Supprimer un profil client existant"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The profile ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 */

router.delete('/:id', requireRole('ADMIN'), profileController.delete);

module.exports = router;