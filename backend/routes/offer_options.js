const express = require('express');
const db = require('../config/database');
const { logAction } = require('./audit');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OfferOption:
 *       type: object
 *       properties:
 *         offer_id:
 *           type: integer
 *           description: The offer ID
 *         option_id:
 *           type: integer
 *           description: The option ID
 *         offer_name:
 *           type: string
 *           description: Name of the offer
 *         option_name:
 *           type: string
 *           description: Name of the option
 */

/**
 * @swagger
 * /api/offer-options:
 *   get:
 *     summary: Returns all offer-option relationships
 *     tags: [Offer Options]
 *     description: "EN: Get all offer-option relationships - FR: Obtenir toutes les relations offre-option"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all offer-option relationships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OfferOption'
 */

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT oo.*, o.name as offer_name, opt.name as option_name
      FROM offer_options oo
      JOIN offers o ON oo.offer_id = o.offer_id
      JOIN options opt ON oo.option_id = opt.option_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/offer-options/offer/{id}:
 *   get:
 *     summary: Get all options for a specific offer
 *     tags: [Offer Options]
 *     description: "EN: Get all options associated with a specific offer - FR: Obtenir toutes les options associées à une offre spécifique"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The offer ID
 *     responses:
 *       200:
 *         description: List of options for the offer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get('/offer/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT opt.* FROM options opt
      JOIN offer_options oo ON opt.option_id = oo.option_id
      WHERE oo.offer_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/offer-options/option/{id}:
 *   get:
 *     summary: Get all offers that have a specific option
 *     tags: [Offer Options]
 *     description: "EN: Get all offers that include a specific option - FR: Obtenir toutes les offres qui incluent une option spécifique"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     responses:
 *       200:
 *         description: List of offers with this option
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get('/option/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.* FROM offers o
      JOIN offer_options oo ON o.offer_id = oo.offer_id
      WHERE oo.option_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/offer-options:
 *   post:
 *     summary: Add an option to an offer
 *     tags: [Offer Options]
 *     description: "EN: Link an option to an offer - FR: Lier une option à une offre"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - option_id
 *             properties:
 *               offer_id:
 *                 type: integer
 *               option_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Option added to offer successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 offer_id:
 *                   type: integer
 *                 option_id:
 *                   type: integer
 */

router.post('/', async (req, res) => {
  const { offer_id, option_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO offer_options (offer_id, option_id) VALUES (?, ?)',
      [offer_id, option_id]
    );

    // Audit log
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id,
      action: 'LINK',
      entity: 'offer_option',
      entity_id: result.insertId,
      ip_address,
      details: { offer_id, option_id }
    });

    res.status(201).json({ message: 'Option added to offer successfully', offer_id, option_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/offer-options:
 *   delete:
 *     summary: Remove an option from an offer
 *     tags: [Offer Options]
 *     description: "EN: Unlink an option from an offer - FR: Délier une option d'une offre"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - option_id
 *             properties:
 *               offer_id:
 *                 type: integer
 *               option_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Option removed from offer successfully
 *       404:
 *         description: Offer-Option relationship not found
 */

router.delete('/', async (req, res) => {
  const { offer_id, option_id } = req.body;
  try {
    const [result] = await db.query(
      'DELETE FROM offer_options WHERE offer_id = ? AND option_id = ?',
      [offer_id, option_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Offer-Option relationship not found' });

    // Audit log
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id,
      action: 'UNLINK',
      entity: 'offer_option',
      ip_address,
      details: { offer_id, option_id }
    });

    res.json({ message: 'Option removed from offer successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
