const express = require('express');
const db = require('../config/database');

const router = express.Router();
// GET all options
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM options');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET one option by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM options WHERE option_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Option not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// POST new option
router.post('/', async (req, res) => {
  const { 
    name,
    type,
    price,
    data_gb,
    minutes,
    sms,
    validity_days
    } = req.body;

    try {
        const [result] = await db.query(
        `INSERT INTO options (name, type, price, data_gb, minutes, sms, validity_days) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, type, price, data_gb, minutes, sms, validity_days]
        );
        res.status(201).json({ option_id: result.insertId, message: 'Option created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT - Update an option by ID
router.put('/:id', async (req, res) => {
  const { 
    name,
    type,
    price,
    data_gb,
    minutes,
    sms,
    validity_days
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE options SET 
        name = ?, type = ?, price = ?, data_gb = ?, 
        minutes = ?, sms = ?, validity_days = ?
      WHERE option_id = ?`,
      [name, type, price, data_gb, minutes, sms, validity_days, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Option not found' });
    }
    res.json({ message: 'Option updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete an option by ID
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM options WHERE option_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Option not found' });
    }
    res.json({ message: 'Option deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;