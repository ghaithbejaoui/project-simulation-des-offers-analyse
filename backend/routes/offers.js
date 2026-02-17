const express = require('express');  // Get the LEGO blocks.
const db = require('../config/database');  // Get the database key (from config folder, so '../' means "go up one folder").

const router = express.Router();  // Make a mini-app just for this door (offers).

// GET all offers – Like "Show me all toys!"
router.get('/', async (req, res) => {  // When someone knocks at /api/offers with GET.
  try {  // Try to do this (like trying to open a box).
    const [rows] = await db.query('SELECT * FROM offers');  // Ask database: "Give me everything from offers table." Await means "wait for answer."
    res.json(rows);  // Send back the list as JSON (easy to read).
  } catch (error) {  // If something breaks...
    res.status(500).json({ error: error.message });  // Say "Oops, error!" with details.
  }
});

// GET single offer by ID – Like "Show me toy number 5!"
router.get('/:id', async (req, res) => {  // :id means "any number here," like /api/offers/1.
  try {
    const [rows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [req.params.id]);  // Ask database for that specific one. ? is safe placeholder.
    if (rows.length === 0) return res.status(404).json({ message: 'Offer not found' });  // If nothing found, say "Not here!"
    res.json(rows[0]);  // Send back the one item.
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new offer – Like "Add a new phone plan!"
router.post('/', async (req, res) => {
  // Unpack EVERYTHING from the gift box (req.body). No dots needed if we list them all!
  const {
    name,  // Required
    segment,  // Required (PREPAID, POSTPAID, BUSINESS)
    monthly_price,  // Required
    quota_minutes = 0,  // Default to 0 if not sent
    quota_sms = 0,
    quota_data_gb = 0,
    validity_days = 30,
    fair_use_gb = 0,
    over_minute_price = 0.1000,
    over_sms_price = 0.0500,
    over_data_price = 0.5000,
    roaming_included_days = 0,
    status = 'PUBLISHED'  // Default
  } = req.body;

  try {
    // The FULL SQL spell – list EVERY column (except offer_id, database makes it auto).
    const [result] = await db.query(
      `INSERT INTO offers (
        name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
        validity_days, fair_use_gb, over_minute_price, over_sms_price,
        over_data_price, roaming_included_days, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,  // ? for each value (safe from bad guys).
      // The FULL list of values – match the order above!
      [
        name,
        segment,
        monthly_price,
        quota_minutes,
        quota_sms,
        quota_data_gb,
        validity_days,
        fair_use_gb,
        over_minute_price,
        over_sms_price,
        over_data_price,
        roaming_included_days,
        status
      ]
    );
    res.status(201).json({ offer_id: result.insertId, message: 'Offer created' });  // Yay! Send new ID.
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET offer with its options
router.get('/:id/with-options', async (req, res) => {
  try {
    const [offerRows] = await db.query(
      'SELECT * FROM offers WHERE offer_id = ?',
      [req.params.id]
    );

    if (offerRows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const [optionsRows] = await db.query(
      `SELECT o.*
       FROM options o
       JOIN offer_options oo ON o.option_id = oo.option_id
       WHERE oo.offer_id = ?`,
      [req.params.id]
    );

    const offer = offerRows[0];
    offer.options = optionsRows;

    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TODO: Add PUT /:id for update, DELETE /:id for delete (similar structure)  // We'll add these later, like editing or removing toys.
router.put('/:id', async (req, res) => {
  const {
    name,
    segment,
    monthly_price,
    quota_minutes,
    quota_sms,
    quota_data_gb,
    validity_days,
    fair_use_gb,
    over_minute_price,
    over_sms_price,
    over_data_price ,
    roaming_included_days,
    status
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE offers SET
        name = ?, segment = ?, monthly_price = ?, quota_minutes = ?, quota_sms = ?,
        quota_data_gb = ?, validity_days = ?, fair_use_gb = ?, over_minute_price = ?,
        over_sms_price = ?, over_data_price = ?, roaming_included_days = ?, status = ?
        WHERE offer_id = ?`,
      [
        name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
        validity_days, fair_use_gb, over_minute_price, over_sms_price, over_data_price,
        roaming_included_days, status, req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({ message: 'Offer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM offers WHERE offer_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;  // Share this mini-app with server.js.