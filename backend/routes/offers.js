const express = require('express');
const db = require('../config/database');
const { logAction } = require('./audit');
const { requireAuth, requireRole } = require('../middleware/auth');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const offerSchema = Joi.object({
  name: Joi.string().max(100).required(),
  segment: Joi.string().valid('PREPAID', 'POSTPAID', 'BUSINESS').required(),
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
  status: Joi.string().valid('PUBLISHED', 'DRAFT', 'ARCHIVED')
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
 *           enum: [PREPAID, POSTPAID, BUSINESS]
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
 *           enum: [PUBLISHED, DRAFT, ARCHIVED]
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

// GET / - List all offers (all authenticated users)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM offers');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// GET /:id - Get single offer (all authenticated users)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Offer not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
 *                 enum: [PREPAID, POSTPAID, BUSINESS]
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
 *                 enum: [PUBLISHED, DRAFT, ARCHIVED]
 *                 default: PUBLISHED
*     responses:
 *       201:
 *         description: Offer created
 */

// POST / - Create offer (Admin/Analyst only)
router.post('/', requireRole('ADMIN', 'ANALYST'), async (req, res) => {
  // Validate input
  const { error, value } = offerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const {
    name,
    segment,
    monthly_price,
    quota_minutes = 0,
    quota_sms = 0,
    quota_data_gb = 0,
    validity_days = 30,
    fair_use_gb = 0,
    over_minute_price = 0.1000,
    over_sms_price = 0.0500,
    over_data_price = 0.5000,
    roaming_included_days = 0,
    status = 'PUBLISHED'
  } = value;

  try {
    const [result] = await db.query(
      `INSERT INTO offers (
        name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
        validity_days, fair_use_gb, over_minute_price, over_sms_price,
        over_data_price, roaming_included_days, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
        validity_days, fair_use_gb, over_minute_price, over_sms_price,
        over_data_price, roaming_included_days, status
      ]
    );

    // Audit log
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id,
      action: 'CREATE',
      entity: 'offer',
      entity_id: result.insertId,
      ip_address,
      details: { name, segment, monthly_price }
    });

    res.status(201).json({ offer_id: result.insertId, message: 'Offer created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// GET /:id/with-options - Get offer with options (all authenticated users)
router.get('/:id/with-options', requireAuth, async (req, res) => {
  try {
    const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [req.params.id]);
    if (offerRows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const [optionsRows] = await db.query(
      `SELECT o.* FROM options o JOIN offer_options oo ON o.option_id = oo.option_id WHERE oo.offer_id = ?`,
      [req.params.id]
    );

    const offer = offerRows[0];
    offer.options = optionsRows;
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// PUT /:id - Update offer (Admin/Analyst only)
router.put('/:id', requireRole('ADMIN', 'ANALYST'), async (req, res) => {
  const {
    name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
    validity_days, fair_use_gb, over_minute_price, over_sms_price,
    over_data_price, roaming_included_days, status
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE offers SET name=?, segment=?, monthly_price=?, quota_minutes=?, quota_sms=?,
       quota_data_gb=?, validity_days=?, fair_use_gb=?, over_minute_price=?, over_sms_price=?,
       over_data_price=?, roaming_included_days=?, status=? WHERE offer_id=?`,
      [name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
       validity_days, fair_use_gb, over_minute_price, over_sms_price,
       over_data_price, roaming_included_days, status, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Offer not found' });

    // Audit log
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id,
      action: 'UPDATE',
      entity: 'offer',
      entity_id: parseInt(req.params.id),
      ip_address,
      details: { name, segment, monthly_price, status }
    });

    res.json({ message: 'Offer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// DELETE /:id - Delete offer (Admin only)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM offers WHERE offer_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Offer not found' });

    // Audit log
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
});

module.exports = router;
