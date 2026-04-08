const express = require('express');
const db = require('../config/database');

const router = express.Router();

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

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customer_profiles');
    const profiles = rows.map(p => {
      let segment = 'POSTPAID';
      if (p.data_avg_gb > 40 && p.minutes_avg === 0 && p.sms_avg === 0) {
        segment = 'DATA_ONLY';
      } else if (p.budget_max <= 30) {
        segment = 'PREPAID';
      } else if (p.budget_max >= 100 && (p.minutes_avg > 500 || p.data_avg_gb > 30)) {
        segment = 'BUSINESS';
      }
      return { ...p, segment };
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

router.get('/:id', async (req, res) => {
  try {
    // Support both profile_id and id for backward compatibility
    const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ? OR id = ?', [req.params.id, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile_id:
 *                   type: integer
 *                 message:
 *                   type: string
 */

router.post('/', async (req, res) => {
  const {
    label,
    minutes_avg = 0, sms_avg = 0, data_avg_gb = 0,
    night_usage_pct = 0, roaming_days = 0, budget_max = 0,
    priority = 'BALANCED'
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO customer_profiles (label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority]
    );
    const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [result.insertId]);
    const p = rows[0];
    let segment = 'POSTPAID';
    if (p.data_avg_gb > 40 && p.minutes_avg === 0 && p.sms_avg === 0) {
      segment = 'DATA_ONLY';
    } else if (Number(p.budget_max) <= 30) {
      segment = 'PREPAID';
    } else if (Number(p.budget_max) >= 100 && (p.minutes_avg > 500 || p.data_avg_gb > 30)) {
      segment = 'BUSINESS';
    }
    res.status(201).json({ ...p, segment, message: 'Profile created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

router.put('/:id', async (req, res) => {
  const { label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority } = req.body;
  try {
    // Support both profile_id and id for backward compatibility
    const [result] = await db.query(
      `UPDATE customer_profiles SET label=?, minutes_avg=?, sms_avg=?, data_avg_gb=?, night_usage_pct=?, roaming_days=?, budget_max=?, priority=? WHERE profile_id=? OR id=?`,
      [label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority, req.params.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Profile not found' });
    const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ? OR id = ?', [req.params.id, req.params.id]);
    const p = rows[0];
    let segment = 'POSTPAID';
    if (p.data_avg_gb > 40 && p.minutes_avg === 0 && p.sms_avg === 0) {
      segment = 'DATA_ONLY';
    } else if (Number(p.budget_max) <= 30) {
      segment = 'PREPAID';
    } else if (Number(p.budget_max) >= 100 && (p.minutes_avg > 500 || p.data_avg_gb > 30)) {
      segment = 'BUSINESS';
    }
    res.json({ ...p, segment, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

router.delete('/:id', async (req, res) => {
  try {
    // Support both profile_id and id for backward compatibility
    const [result] = await db.query('DELETE FROM customer_profiles WHERE profile_id = ? OR id = ?', [req.params.id, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Profile not found' });
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
