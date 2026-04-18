const express = require('express');
const db = require('../config/database');
const { logAction } = require('./audit');
const router = express.Router();

/**
 * @swagger
 * /api/export/scenario/{id}/csv:
 *   get:
 *     summary: Export scenario results as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CSV file
 *       404:
 *         description: Scenario not found
 */
router.get('/scenario/:id/csv', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = req.params;

  try {
    const [scenarioRows] = await db.query('SELECT * FROM scenarios WHERE scenario_id = ?', [id]);
    if (scenarioRows.length === 0) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    const scenario = scenarioRows[0];

    const [resultRows] = await db.query(
      'SELECT * FROM scenario_results WHERE scenario_id = ? ORDER BY rank_by_score ASC',
      [id]
    );

    // Get offer names
    const offerIds = resultRows.map(r => r.offer_id).filter(Boolean);
    let offerNames = {};
    if (offerIds.length > 0) {
      const placeholders = offerIds.map(() => '?').join(',');
      const [offerRows] = await db.query(
        `SELECT offer_id, name FROM offers WHERE offer_id IN (${placeholders})`,
        offerIds
      );
      offerNames = offerRows.reduce((acc, o) => { acc[o.offer_id] = o.name; return acc; }, {});
    }

    // Build CSV
    let csv = 'Rank,Offer,Base Cost,Overage Cost,Roaming Cost,Total Cost,Satisfaction Score,Recommendation\n';
    resultRows.forEach(r => {
      const offerName = offerNames[r.offer_id] || `Offer ${r.offer_id}`;
      csv += `${r.rank_by_score || ''},"${offerName}",${r.base_cost || 0},${r.overage_cost || 0},${r.roaming_cost || 0},${r.total_cost || 0},${r.satisfaction_score || 0},${r.recommendation || ''}\n`;
    });

    // Log audit
    await logAction({
      user_id: req.user.user_id,
      action: 'EXPORT_CSV',
      entity: 'scenario',
      entity_id: parseInt(id),
      ip_address: req.ip,
      details: { results_count: resultRows.length }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${scenario.name.replace(/[^a-z0-9]/gi, '_')}_results.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/export/scenario/{id}/xlsx:
 *   get:
 *     summary: Export scenario results as XLSX
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: XLSX file
 *       404:
 *         description: Scenario not found
 */
router.get('/scenario/:id/xlsx', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = req.params;

  try {
    const [scenarioRows] = await db.query('SELECT * FROM scenarios WHERE scenario_id = ?', [id]);
    if (scenarioRows.length === 0) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    const scenario = scenarioRows[0];

    const [resultRows] = await db.query(
      'SELECT * FROM scenario_results WHERE scenario_id = ? ORDER BY rank_by_score ASC',
      [id]
    );

    // Get offer names
    const offerIds = resultRows.map(r => r.offer_id).filter(Boolean);
    let offerNames = {};
    if (offerIds.length > 0) {
      const placeholders = offerIds.map(() => '?').join(',');
      const [offerRows] = await db.query(
        `SELECT offer_id, name FROM offers WHERE offer_id IN (${placeholders})`,
        offerIds
      );
      offerNames = offerRows.reduce((acc, o) => { acc[o.offer_id] = o.name; return acc; }, {});
    }

    // Build CSV as XLSX alternative (Excel-compatible CSV)
    let csv = 'Rank\tOffer\tBase Cost\tOverage Cost\tRoaming Cost\tTotal Cost\tSatisfaction Score\tRecommendation\n';
    resultRows.forEach(r => {
      const offerName = offerNames[r.offer_id] || `Offer ${r.offer_id}`;
      csv += `${r.rank_by_score || ''}\t"${offerName}"\t${r.base_cost || 0}\t${r.overage_cost || 0}\t${r.roaming_cost || 0}\t${r.total_cost || 0}\t${r.satisfaction_score || 0}\t${r.recommendation || ''}\n`;
    });

    // Log audit
    await logAction({
      user_id: req.user.user_id,
      action: 'EXPORT_XLSX',
      entity: 'scenario',
      entity_id: parseInt(id),
      ip_address: req.ip,
      details: { results_count: resultRows.length }
    });

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${scenario.name.replace(/[^a-z0-9]/gi, '_')}_results.xls"`);
    res.send('\ufeff' + csv); // BOM for Excel UTF-8
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/export/offers/csv:
 *   get:
 *     summary: Export all offers as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get('/offers/csv', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const [offerRows] = await db.query('SELECT * FROM offers ORDER BY offer_id ASC');
    const [optionRows] = await db.query('SELECT offer_id, option_id FROM offer_options');
    const optionsByOffer = {};
    optionRows.forEach(o => {
      if (!optionsByOffer[o.offer_id]) optionsByOffer[o.offer_id] = [];
      optionsByOffer[o.offer_id].push(o.option_id);
    });

    let csv = 'ID,Name,Segment,Monthly Price,Minutes Quota,SMS Quota,Data Quota (GB),Validity (Days),Fair Use (GB),Over Minute Price,Over SMS Price,Over Data Price,Roaming Days,Status\n';
    offerRows.forEach(o => {
      csv += `${o.offer_id},"${o.name}","${o.segment}",${o.monthly_price},${o.quota_minutes || 0},${o.quota_sms || 0},${o.quota_data_gb || 0},${o.validity_days || 30},${o.fair_use_gb || 0},${o.over_minute_price || 0},${o.over_sms_price || 0},${o.over_data_price || 0},${o.roaming_included_days || 0},"${o.status}"\n`;
    });

    await logAction({
      user_id: req.user.user_id,
      action: 'EXPORT_CSV',
      entity: 'offers',
      ip_address: req.ip,
      details: { count: offerRows.length }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="offers_export.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/export/profiles/csv:
 *   get:
 *     summary: Export all customer profiles as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get('/profiles/csv', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const [profileRows] = await db.query('SELECT * FROM customer_profiles ORDER BY profile_id ASC');

    let csv = 'ID,Label,Avg Minutes,Avg SMS,Data Avg (GB),Night Usage %,Roaming Days,Budget Max,Priority\n';
    profileRows.forEach(p => {
      csv += `${p.profile_id},"${p.label}",${p.minutes_avg || 0},${p.sms_avg || 0},${p.data_avg_gb || 0},${p.night_usage_pct || 0},${p.roaming_days || 0},${p.budget_max || 0},"${p.priority || 'BALANCED'}"\n`;
    });

    await logAction({
      user_id: req.user.user_id,
      action: 'EXPORT_CSV',
      entity: 'customer_profiles',
      ip_address: req.ip,
      details: { count: profileRows.length }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customer_profiles_export.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;