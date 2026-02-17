const express = require('express');
const db = require('../config/database');  // Get the database key (from config folder, so '../' means "go up one folder").

const router = express.Router();  // Make a mini-app just for this door (customer_profiles).
// GET all customer profiles – Like "Show me all customers!"
router.get('/',async (req,res) => {
    try{
        const[rows]= await db.query('SELECT * FROM customer_profiles');
        res.json(rows);
    }catch(error){
        res.status(500).json({error:error.message});
    }
});
// get one profile by id 
router.get('/:id',async(req,res)=>{
    try{
        const[rows]=await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?',[req.params.id]);
        if (rows.length === 0){
            return res.status(404).json({ message: 'profile not found'});
        }
        res.json(rows[0]);
    }catch(error){
        res.status(500).json({error:error.message});
    }
});

// POST new profile (you can make many fields optional with defaults)
router.post('/', async (req, res) => {
  const {
    label,
    minutes_avg = 0,
    sms_avg = 0,
    data_avg_gb = 0,
    night_usage_pct = 0,
    roaming_days = 0,
    budget_max = 0,
    priority = 'BALANCED'
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO customer_profiles 
       (label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority]
    );
    res.status(201).json({ profile_id: result.insertId, message: 'Profile created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// You can add PUT and DELETE later if needed
// PUT - Update a customer profile by ID
router.put('/:id', async (req, res) => {
  const {
    label,
    minutes_avg,
    sms_avg,
    data_avg_gb,
    night_usage_pct,
    roaming_days,
    budget_max,
    priority
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE customer_profiles SET 
        label = ?, minutes_avg = ?, sms_avg = ?, data_avg_gb = ?, 
        night_usage_pct = ?, roaming_days = ?, budget_max = ?, priority = ?
      WHERE profile_id = ?`,
      [label, minutes_avg, sms_avg, data_avg_gb, 
       night_usage_pct, roaming_days, budget_max, 
       priority, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete a customer profile by ID
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM customer_profiles WHERE profile_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;