const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET all offer-option relationships (all options for all offers)
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

// GET all options for a specific offer
router.get('/offer/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT opt.* 
      FROM options opt
      JOIN offer_options oo ON opt.option_id = oo.option_id
      WHERE oo.offer_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all offers that have a specific option
router.get('/option/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.* 
      FROM offers o
      JOIN offer_options oo ON o.offer_id = oo.offer_id
      WHERE oo.option_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Add an option to an offer
router.post('/', async (req, res) => {
  const { offer_id, option_id } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO offer_options (offer_id, option_id) VALUES (?, ?)',
      [offer_id, option_id]
    );
    res.status(201).json({ message: 'Option added to offer successfully', offer_id, option_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove an option from an offer
router.delete('/', async (req, res) => {
  const { offer_id, option_id } = req.body;

  try {
    const [result] = await db.query(
      'DELETE FROM offer_options WHERE offer_id = ? AND option_id = ?',
      [offer_id, option_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Offer-Option relationship not found' });
    }
    res.json({ message: 'Option removed from offer successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
