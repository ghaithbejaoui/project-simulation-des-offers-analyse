const express = require('express');
const db = require('../config/database');
const { logAction } = require('./audit');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       properties:
 *         option_id:
 *           type: integer
 *           description: The auto-generated ID of the option
 *         name:
 *           type: string
 *           description: Name of the option
 *         type:
 *           type: string
 *           description: Type of option
 *         price:
 *           type: number
 *           description: Price of the option
 *         data_gb:
 *           type: integer
 *           description: Data included in GB
 *         minutes:
 *           type: integer
 *           description: Minutes included
 *         sms:
 *           type: integer
 *           description: SMS included
 *         validity_days:
 *           type: integer
 *           description: Validity in days
 */

/**
 * @swagger
 * /api/options:
 *   get:
 *     summary: Returns all options
 *     tags: [Options]
 *     description: "EN: Get all telecom options - FR: Obtenir toutes les options telecom"
 *     responses:
 *       200:
 *         description: A list of all options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Option'
 */

// GET / - List all options (all authenticated users)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM options');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/options/{id}:
 *   get:
 *     summary: Get an option by ID
 *     tags: [Options]
 *     description: "EN: Get a specific option by its ID - FR: Obtenir une option spécifique par son ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     responses:
 *       200:
 *         description: An option object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Option'
 *       404:
 *         description: Option not found
 */

// GET /:id - Get single option (all authenticated users)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM options WHERE option_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Option not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/options:
 *   post:
 *     summary: Create a new option
 *     tags: [Options]
 *     description: "EN: Create a new telecom option - FR: Créer une nouvelle option telecom"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               data_gb:
 *                 type: integer
 *                 default: 0
 *               minutes:
 *                 type: integer
 *                 default: 0
 *               sms:
 *                 type: integer
 *                 default: 0
 *               validity_days:
 *                 type: integer
 *                 default: 30
*     responses:
 *       201:
 *         description: Option created
 */

// POST / - Create option (Admin/Analyst only)
router.post('/', requireRole('ADMIN', 'ANALYST'), async (req, res) => {
  const { name, type, price, data_gb = 0, minutes = 0, sms = 0, validity_days = 30 } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO options (name, type, price, data_gb, minutes, sms, validity_days) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, type, price, data_gb, minutes, sms, validity_days]
    );

    // Audit log
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id,
      action: 'CREATE',
      entity: 'option',
      entity_id: result.insertId,
      ip_address,
      details: { name, type, price }
    });

    res.status(201).json({ option_id: result.insertId, message: 'Option created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/options/{id}:
 *   put:
 *     summary: Update an option
 *     tags: [Options]
 *     description: "EN: Update an existing option - FR: Mettre à jour une option existante"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Option updated successfully
 *       404:
 *         description: Option not found
 */

// PUT /:id - Update option (Admin/Analyst only)
router.put('/:id', requireRole('ADMIN', 'ANALYST'), async (req, res) => {
  const { name, type, price, data_gb, minutes, sms, validity_days } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE options SET name=?, type=?, price=?, data_gb=?, minutes=?, sms=?, validity_days=? WHERE option_id=?`,
      [name, type, price, data_gb, minutes, sms, validity_days, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Option not found' });

    // Audit log
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id,
      action: 'UPDATE',
      entity: 'option',
      entity_id: parseInt(req.params.id),
      ip_address,
      details: { name, type, price }
    });

    res.json({ message: 'Option updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/options/{id}:
 *   delete:
 *     summary: Delete an option
 *     tags: [Options]
 *     description: "EN: Delete an existing option - FR: Supprimer une option existante"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     responses:
 *       200:
 *         description: Option deleted successfully
 *       404:
 *         description: Option not found
 */

// DELETE /:id - Delete option (Admin only)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM options WHERE option_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Option not found' });

    // Audit log
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id,
      action: 'DELETE',
      entity: 'option',
      entity_id: parseInt(req.params.id),
      ip_address
    });

    res.json({ message: 'Option deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
