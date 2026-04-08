const express = require('express');
const db = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SimulationInput:
 *       type: object
 *       required:
 *         - profile_id
 *         - offer_id
 *       properties:
 *         profile_id:
 *           type: integer
 *           description: The customer profile ID
 *         offer_id:
 *           type: integer
 *           description: The offer ID
 * 
 *     SimulationResult:
 *       type: object
 *       properties:
 *         input:
 *           type: object
 *         profile:
 *           type: object
 *         offer:
 *           type: object
 *         calculation:
 *           type: object
 * 
 *     RecommendationInput:
 *       type: object
 *       properties:
 *         profile_id:
 *           type: integer
 *           description: The customer profile ID (optional)
 *         limit:
 *           type: integer
 *           default: 5
 *         segment:
 *           type: string
 *           enum: [PREPAID, POSTPAID, BUSINESS]
 * 
 *     CompareInput:
 *       type: object
 *       required:
 *         - profile_id
 *         - offer_ids
 *       properties:
 *         profile_id:
 *           type: integer
 *         offer_ids:
 *           type: array
 *           items:
 *             type: integer
 * 
 *     BatchInput:
 *       type: object
 *       required:
 *         - offer_id
 *       properties:
 *         offer_id:
 *           type: integer
 *         profile_ids:
 *           type: array
 *           items:
 *             type: integer
 */

/**
 * @swagger
 * /api/simulation:
 *   post:
 *     summary: Run a basic simulation (one profile + one offer)
 *     tags: [Simulation]
 *     description: "EN: Run a basic simulation comparing one customer profile with one offer - FR: Exécuter une simulation de base comparant un profil client avec une offre"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SimulationInput'
 *     responses:
 *       200:
 *         description: Simulation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulationResult'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Profile or offer not found
 */

router.post('/', async (req, res) => {
  const { profile_id, offer_id } = req.body;
  if (!profile_id || !offer_id) return res.status(400).json({ message: 'profile_id and offer_id are required' });

  try {
    const [profileRows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [profile_id]);
    if (profileRows.length === 0) return res.status(404).json({ message: 'Profile not found' });
    const profile = profileRows[0];

    const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offer_id]);
    if (offerRows.length === 0) return res.status(404).json({ message: 'Offer not found' });
    let offer = offerRows[0];

    const [optionRows] = await db.query(`SELECT opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id = ?`, [offer_id]);
    offer.options = optionRows;

    let baseCost = offer.monthly_price || 0;
    const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (offer.quota_minutes || 0));
    const overSms = Math.max(0, (profile.sms_avg || 0) - (offer.quota_sms || 0));
    const overData = Math.max(0, (profile.data_avg_gb || 0) - (offer.quota_data_gb || 0));
    let overageCost = overMinutes * (offer.over_minute_price || 0.1) + overSms * (offer.over_sms_price || 0.05) + overData * (offer.over_data_price || 0.5);
    let optionsCost = offer.options.reduce((sum, opt) => sum + (opt.price || 0), 0);
    const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (offer.roaming_included_days || 0));
    let roamingCost = overRoamingDays * 5;
    const discounts = Math.abs(Math.min(0, optionsCost));
    let totalCost = baseCost + overageCost + roamingCost - discounts;

    let score = 100;
    const budgetRatio = totalCost / (profile.budget_max || 1);
    if (budgetRatio <= 0.7) score += 10;
    else if (budgetRatio <= 1.0) score += 0;
    else score -= 30;
    if (offer.segment === 'BUSINESS') score += 10;
    else if (offer.segment === 'POSTPAID') score += 5;
    score += Math.min(offer.options.length * 2, 10);
    const fairUseExceeded = (profile.data_avg_gb || 0) > (offer.fair_use_gb || 0);
    if (fairUseExceeded) score -= 20;
    if (overMinutes + overSms + overData > 0) score -= 10;
    let satisfactionScore = Math.max(0, Math.min(100, score));

    res.json({
      input: { profile_id, offer_id }, profile, offer,
      calculation: {
        base_cost: parseFloat(baseCost.toFixed(2)),
        overage_cost: parseFloat(overageCost.toFixed(2)),
        options_cost: parseFloat(optionsCost.toFixed(2)),
        roaming_cost: parseFloat(roamingCost.toFixed(2)),
        discounts: parseFloat(discounts.toFixed(2)),
        total_cost: parseFloat(totalCost.toFixed(2)),
        satisfaction_score: satisfactionScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/simulation/recommend:
 *   post:
 *     summary: Get smart offer recommendations
 *     tags: [Simulation]
 *     description: "EN: Get intelligent offer recommendations based on customer profile or usage parameters - FR: Obtenir des recommandations d'offres intelligentes basées sur le profil client"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecommendationInput'
 *     responses:
 *       200:
 *         description: List of recommended offers
 *       404:
 *         description: Profile not found
 */

router.post('/recommend', async (req, res) => {
  const { profile_id, limit = 5, segment } = req.body;
  let profile;

  try {
    if (profile_id) {
      const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [profile_id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
      profile = rows[0];
    } else {
      profile = {
        minutes_avg: req.body.minutes_avg || 0, sms_avg: req.body.sms_avg || 0,
        data_avg_gb: req.body.data_avg_gb || 0, roaming_days: req.body.roaming_days || 0,
        budget_max: req.body.budget_max || Infinity, priority: req.body.priority || 'BALANCED'
      };
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  try {
    let query = 'SELECT * FROM offers WHERE status = ?';
    let params = ['PUBLISHED'];
    if (segment) { query += ' AND segment = ?'; params.push(segment); }
    const [offers] = await db.query(query, params);

    const [allOptionRows] = await db.query(`SELECT oo.offer_id, opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id`);
    const optionsByOffer = {};
    allOptionRows.forEach(opt => { if (!optionsByOffer[opt.offer_id]) optionsByOffer[opt.offer_id] = []; optionsByOffer[opt.offer_id].push(opt); });

    const recommendations = offers.map(offer => {
      const offerOptions = optionsByOffer[offer.offer_id] || [];
      const baseCost = offer.monthly_price || 0;
      const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (offer.quota_minutes || 0));
      const overSms = Math.max(0, (profile.sms_avg || 0) - (offer.quota_sms || 0));
      const overData = Math.max(0, (profile.data_avg_gb || 0) - (offer.quota_data_gb || 0));
      const overageCost = overMinutes * (offer.over_minute_price || 0.1) + overSms * (offer.over_sms_price || 0.05) + overData * (offer.over_data_price || 0.5);
      const optionsCost = offerOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
      const discounts = Math.abs(Math.min(0, optionsCost));
      const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (offer.roaming_included_days || 0));
      const roamingCost = overRoamingDays * 5;
      const totalCost = baseCost + overageCost + roamingCost - discounts;

      let score = 100;
      const budgetRatio = totalCost / (profile.budget_max || 1);
      if (budgetRatio <= 0.7) score += 10;
      else if (budgetRatio <= 1.0) score += 0;
      else score -= 30;
      if (offer.segment === 'BUSINESS') score += 10;
      else if (offer.segment === 'POSTPAID') score += 5;
      score += Math.min(offerOptions.length * 2, 10);
      if ((profile.data_avg_gb || 0) > (offer.fair_use_gb || 0)) score -= 20;
      if (overMinutes + overSms + overData > 0) score -= 10;
      score = Math.max(0, Math.min(100, score));

      return { offer: { ...offer, options: offerOptions }, score, estimated_cost: parseFloat(totalCost.toFixed(2)) };
    });

    if (profile.priority === 'PRICE') recommendations.sort((a, b) => a.estimated_cost - b.estimated_cost);
    else if (profile.priority === 'QUALITY') recommendations.sort((a, b) => b.score - a.score);
    else recommendations.sort((a, b) => (b.score / b.estimated_cost) - (a.score / a.estimated_cost));

    res.json({ profile, count: Math.min(limit, recommendations.length), recommendations: recommendations.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/simulation/compare:
 *   post:
 *     summary: Compare multiple offers
 *     tags: [Simulation]
 *     description: "EN: Compare multiple offers side by side for a specific customer profile - FR: Comparer plusieurs offres côte à côte pour un profil client spécifique"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompareInput'
 *     responses:
 *       200:
 *         description: Comparison results
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Profile or offers not found
 */

router.post('/compare', async (req, res) => {
  const { profile_id, offer_ids } = req.body;
  if (!profile_id || !offer_ids || !Array.isArray(offer_ids) || offer_ids.length === 0) {
    return res.status(400).json({ message: 'profile_id and offer_ids (array) are required' });
  }

  try {
    const [profileRows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [profile_id]);
    if (profileRows.length === 0) return res.status(404).json({ message: 'Profile not found' });
    const profile = profileRows[0];

    const placeholders = offer_ids.map(() => '?').join(',');
    const [offerRows] = await db.query(`SELECT * FROM offers WHERE offer_id IN (${placeholders})`, offer_ids);
    if (offerRows.length === 0) return res.status(404).json({ message: 'No offers found' });

    const [allOptionRows] = await db.query(`SELECT oo.offer_id, opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id IN (${placeholders})`, offer_ids);
    const optionsByOffer = {};
    allOptionRows.forEach(opt => { if (!optionsByOffer[opt.offer_id]) optionsByOffer[opt.offer_id] = []; optionsByOffer[opt.offer_id].push(opt); });

    const comparisons = offerRows.map(offer => {
      const offerOptions = optionsByOffer[offer.offer_id] || [];
      const baseCost = Number(offer.monthly_price) || 0;
      const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (Number(offer.quota_minutes) || 0));
      const overSms = Math.max(0, (profile.sms_avg || 0) - (Number(offer.quota_sms) || 0));
      const overData = Math.max(0, (Number(profile.data_avg_gb) || 0) - (Number(offer.quota_data_gb) || 0));
      const overageMinutesCost = overMinutes * (Number(offer.over_minute_price) || 0.1);
      const overageSmsCost = overSms * (Number(offer.over_sms_price) || 0.05);
      const overageDataCost = overData * (Number(offer.over_data_price) || 0.5);
      const overageCost = overageMinutesCost + overageSmsCost + overageDataCost;
      const optionsCost = offerOptions.reduce((sum, opt) => sum + (Number(opt.price) || 0), 0);
      const discounts = Math.abs(Math.min(0, optionsCost));
      const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (Number(offer.roaming_included_days) || 0));
      const roamingCost = overRoamingDays * 5;
      const totalCost = baseCost + overageCost + roamingCost - discounts;

      let score = 100;
      const budgetRatio = totalCost / (Number(profile.budget_max) || 1);
      if (budgetRatio <= 0.7) score += 10;
      else if (budgetRatio > 1.0) score -= 30;
      if (offer.segment === 'BUSINESS') score += 10;
      else if (offer.segment === 'POSTPAID') score += 5;
      score += Math.min(offerOptions.length * 2, 10);
      if ((Number(profile.data_avg_gb) || 0) > (Number(offer.fair_use_gb) || 0)) score -= 20;
      if (overMinutes + overSms + overData > 0) score -= 10;
      score = Math.max(0, Math.min(100, score));

      return { 
        offer_id: offer.offer_id, 
        offer_name: offer.name, 
        segment: offer.segment, 
        monthly_price: Number(offer.monthly_price),
        offer: {
          offer_id: offer.offer_id,
          name: offer.name,
          segment: offer.segment,
          quota_data_gb: Number(offer.quota_data_gb),
          quota_minutes: Number(offer.quota_minutes),
          quota_sms: Number(offer.quota_sms),
        },
        overage_minutes_cost: parseFloat(overageMinutesCost.toFixed(2)),
        overage_sms_cost: parseFloat(overageSmsCost.toFixed(2)),
        overage_data_cost: parseFloat(overageDataCost.toFixed(2)),
        roaming_cost: parseFloat(roamingCost.toFixed(2)),
        calculation: { 
          base_cost: parseFloat(baseCost.toFixed(2)),
          total_cost: parseFloat(totalCost.toFixed(2)), 
          satisfaction_score: score 
        } 
      };
    });

    const sortedByCost = [...comparisons].sort((a, b) => a.calculation.total_cost - b.calculation.total_cost);
    const sortedByScore = [...comparisons].sort((a, b) => b.calculation.satisfaction_score - a.calculation.satisfaction_score);
    comparisons.forEach(comp => { comp.rank_by_cost = sortedByCost.findIndex(c => c.offer_id === comp.offer_id) + 1; comp.rank_by_score = sortedByScore.findIndex(c => c.offer_id === comp.offer_id) + 1; });

    res.json({ profile, count: comparisons.length, comparisons, summary: { cheapest: sortedByCost[0]?.offer_name, best_score: sortedByScore[0]?.offer_name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/simulation/batch:
 *   post:
 *     summary: Analyze one offer across multiple profiles
 *     tags: [Simulation]
 *     description: "EN: Analyze how a single offer performs across multiple customer profiles - FR: Analyser comment une seule offre se comporte sur plusieurs profils clients"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchInput'
 *     responses:
 *       200:
 *         description: Batch analysis results
 *       400:
 *         description: Missing offer_id
 *       404:
 *         description: Offer or profiles not found
 */

router.post('/batch', async (req, res) => {
  const { offer_id, profile_ids } = req.body;
  if (!offer_id) return res.status(400).json({ message: 'offer_id is required' });

  try {
    const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offer_id]);
    if (offerRows.length === 0) return res.status(404).json({ message: 'Offer not found' });
    const offer = offerRows[0];

    const [optionRows] = await db.query(`SELECT opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id = ?`, [offer_id]);
    const offerOptions = optionRows;

    let profiles;
    if (profile_ids && Array.isArray(profile_ids) && profile_ids.length > 0) {
      const placeholders = profile_ids.map(() => '?').join(',');
      const [rows] = await db.query(`SELECT * FROM customer_profiles WHERE profile_id IN (${placeholders})`, profile_ids);
      profiles = rows;
    } else {
      const [rows] = await db.query('SELECT * FROM customer_profiles');
      profiles = rows;
    }
    if (profiles.length === 0) return res.status(404).json({ message: 'No profiles found' });

    const results = profiles.map(profile => {
      const baseCost = offer.monthly_price || 0;
      const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (offer.quota_minutes || 0));
      const overSms = Math.max(0, (profile.sms_avg || 0) - (offer.quota_sms || 0));
      const overData = Math.max(0, (profile.data_avg_gb || 0) - (offer.quota_data_gb || 0));
      const overageCost = overMinutes * (offer.over_minute_price || 0.1) + overSms * (offer.over_sms_price || 0.05) + overData * (offer.over_data_price || 0.5);
      const optionsCost = offerOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
      const discounts = Math.abs(Math.min(0, optionsCost));
      const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (offer.roaming_included_days || 0));
      const roamingCost = overRoamingDays * 5;
      const totalCost = baseCost + overageCost + roamingCost - discounts;

      let score = 100;
      const budgetRatio = totalCost / (profile.budget_max || 1);
      if (budgetRatio <= 0.7) score += 10;
      else if (budgetRatio > 1.0) score -= 30;
      if (offer.segment === 'BUSINESS') score += 10;
      else if (offer.segment === 'POSTPAID') score += 5;
      score += Math.min(offerOptions.length * 2, 10);
      if ((profile.data_avg_gb || 0) > (offer.fair_use_gb || 0)) score -= 20;
      if (overMinutes + overSms + overData > 0) score -= 10;
      score = Math.max(0, Math.min(100, score));

      let recommendation;
      if (score >= 70 && totalCost <= profile.budget_max) recommendation = 'good_match';
      else if (score >= 50) recommendation = 'okay_match';
      else recommendation = 'not_recommended';

      return { profile_id: profile.profile_id, label: profile.label, estimated_cost: parseFloat(totalCost.toFixed(2)), budget_max: profile.budget_max, satisfaction_score: score, recommendation };
    });

    const goodMatches = results.filter(r => r.recommendation === 'good_match').length;
    const okayMatches = results.filter(r => r.recommendation === 'okay_match').length;
    const totalCostSum = results.reduce((sum, r) => sum + r.estimated_cost, 0);

    res.json({ offer: { offer_id: offer.offer_id, name: offer.name }, results, summary: { total_profiles: results.length, good_matches: goodMatches, okay_matches: okayMatches, average_cost: parseFloat((totalCostSum / results.length).toFixed(2)) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
