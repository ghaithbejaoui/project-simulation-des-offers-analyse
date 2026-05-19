const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

const offerSchema = Joi.object({
  name: Joi.string().max(100).required(),
  segment: Joi.string().valid('PREPAID', 'POSTPAID', 'BUSINESS', 'DATA_ONLY').required(),
  monthly_price: Joi.number().min(0).required(),
  quota_minutes: Joi.number().integer().min(0),
  quota_sms: Joi.number().integer().min(0),
  quota_data_gb: Joi.number().min(0),
  validity_days: Joi.number().integer().min(1),
  fair_use_gb: Joi.number().integer().min(0),
  over_minute_price: Joi.number().min(0),
  over_sms_price: Joi.number().min(0),
  over_data_price: Joi.number().min(0),
  roaming_included_days: Joi.number().integer().min(0),
  status: Joi.string().valid('PUBLISHED', 'DRAFT', 'RETIRED')
});

const offerController = require('../controllers/offerController');

router.use((req, res, next) => {
  req.offerSchema = offerSchema;
  next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         offer_id:
 *           type: integer
 *           description: The auto-generated ID of the offer
 *         name:
 *           type: string
 *           description: Name of the offer
 *         segment:
 *           type: string
 *           enum: [PREPAID, POSTPAID, BUSINESS, DATA_ONLY]
 *           description: Customer segment
 *         monthly_price:
 *           type: number
 *           description: Monthly subscription price
 *         quota_minutes:
 *           type: integer
 *           description: Included minutes
 *         quota_sms:
 *           type: integer
 *           description: Included SMS
 *         quota_data_gb:
 *           type: integer
 *           description: Included data in GB
 *         validity_days:
 *           type: integer
 *           description: Plan validity in days
 *         fair_use_gb:
 *           type: integer
 *           description: Fair use data limit
 *         over_minute_price:
 *           type: number
 *           description: Price per extra minute
 *         over_sms_price:
 *           type: number
 *           description: Price per extra SMS
 *         over_data_price:
 *           type: number
 *           description: Price per extra GB
 *         roaming_included_days:
 *           type: integer
 *           description: Included roaming days
 *         status:
 *           type: string
 *           enum: [PUBLISHED, DRAFT, RETIRED]
 *           description: Offer status
 */

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Returns all offers
 *     tags: [Offers]
 *     description: "EN: Get all telecom offers - FR: Obtenir toutes les offres telecom"
 *     responses:
 *       200:
 *         description: A list of all offers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 */

router.get('/', requireAuth, offerController.getAll);

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Get an offer by ID
 *     tags: [Offers]
 *     description: "EN: Get a specific offer by its ID - FR: Obtenir une offre spécifique par son ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The offer ID
 *     responses:
 *       200:
 *         description: An offer object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       404:
 *         description: Offer not found
 */

router.get('/:id', requireAuth, offerController.getById);

/**
 * @swagger
 * /api/offers/{id}/with-options:
 *   get:
 *     summary: Get an offer with its options
 *     tags: [Offers]
 *     description: "EN: Get an offer along with all its associated options - FR: Obtenir une offre avec toutes ses options associées"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The offer ID
 *     responses:
 *       200:
 *         description: An offer with its options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Offer not found
 */

router.get('/:id/with-options', requireAuth, offerController.getWithOptions);

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Create a new offer
 *     tags: [Offers]
 *     description: "EN: Create a new telecom offer - FR: Créer une nouvelle offre telecom"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - segment
 *               - monthly_price
 *             properties:
 *               name:
 *                 type: string
 *               segment:
 *                 type: string
 *                 enum: [PREPAID, POSTPAID, BUSINESS, DATA_ONLY]
 *               monthly_price:
 *                 type: number
 *               quota_minutes:
 *                 type: integer
 *                 default: 0
 *               quota_sms:
 *                 type: integer
 *                 default: 0
 *               quota_data_gb:
 *                 type: integer
 *                 default: 0
 *               validity_days:
 *                 type: integer
 *                 default: 30
 *               fair_use_gb:
 *                 type: integer
 *                 default: 0
 *               over_minute_price:
 *                 type: number
 *                 default: 0.10
 *               over_sms_price:
 *                 type: number
 *                 default: 0.05
 *               over_data_price:
 *                 type: number
 *                 default: 0.50
 *               roaming_included_days:
 *                 type: integer
 *                 default: 0
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, DRAFT, RETIRED]
 *                 default: PUBLISHED
 *     responses:
 *       201:
 *         description: Offer created
 */

router.post('/', requireRole('ADMIN', 'ANALYST'), offerController.create);

/**
 * @swagger
 * /api/offers/{id}:
 *   put:
 *     summary: Update an offer
 *     tags: [Offers]
 *     description: "EN: Update an existing offer - FR: Mettre à jour une offre existante"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The offer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       404:
 *         description: Offer not found
 */

router.put('/:id', requireRole('ADMIN', 'ANALYST'), offerController.update);

/**
 * @swagger
 * /api/offers/{id}:
 *   delete:
 *     summary: Delete an offer
 *     tags: [Offers]
 *     description: "EN: Delete an existing offer - FR: Supprimer une offre existante"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The offer ID
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 *       404:
 *         description: Offer not found
 */

router.delete('/:id', requireRole('ADMIN'), offerController.delete);

module.exports = router;