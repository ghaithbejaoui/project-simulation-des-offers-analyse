const express = require('express');
const router = express.Router();
const db = require('../config/database');

const q = (sql, params = []) =>
  db.query(sql, params).then(([rows]) => rows);

router.get('/kpis', async (req, res) => {
  try {
    const [totals] = await db.query(`
      SELECT
        COUNT(*) AS total_simulations,
        IFNULL(ROUND(AVG(total_cost), 2), 0) AS global_arpu,
        IFNULL(ROUND(AVG(satisfaction_score), 1), 0) AS avg_score,
        IFNULL(ROUND(SUM(has_overage) * 100.0 / NULLIF(COUNT(*), 0), 2), 0) AS overage_pct,
        IFNULL(ROUND(SUM(is_recommended) * 100.0 / NULLIF(COUNT(*), 0), 2), 0) AS recommendation_rate
      FROM fact_simulations
    `);
    res.json(totals[0] || { total_simulations: 0, global_arpu: 0, avg_score: 0, overage_pct: 0, recommendation_rate: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/arpu', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM vw_arpu ORDER BY arpu DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/overage', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM vw_overage ORDER BY overage_pct DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recommendation-rate', async (req, res) => {
  try {
    const rows = await q(
      'SELECT * FROM vw_recommendation_rate ORDER BY recommendation_rate_pct DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/daily-volume', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const rows = await q(`
      SELECT * FROM vw_daily_volume
      WHERE sim_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY sim_date ASC
    `, [days]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/segment-summary', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM vw_segment_summary');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/top-offers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const rows = await q(`
      SELECT
        r.offer_id,
        r.offer_name,
        r.offer_segment,
        r.total_sims,
        r.recommendation_rate_pct,
        r.avg_score,
        o.avg_overage_cost
      FROM vw_recommendation_rate r
      JOIN vw_overage o USING (offer_id)
      ORDER BY r.recommendation_rate_pct DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/simulations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const offset = (page - 1) * limit;
    const rows = await q(
      'SELECT * FROM fact_simulations ORDER BY simulated_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;