const express = require('express');
const db = require('../config/database');
const { logAction } = require('./audit');
const { requireAuth } = require('../middleware/auth');
const { logSimulation } = require('../middleware/biLogger');
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

router.post('/', requireAuth, async (req, res) => {
  const { profile_id, offer_id, minutes_avg, sms_avg, data_avg_gb, roaming_days, budget_max, priority } = req.body;
  
  // Basic validation
  if (!offer_id) return res.status(400).json({ message: 'offer_id is required' });
  if (profile_id && isNaN(Number(profile_id))) return res.status(400).json({ message: 'profile_id must be a number' });
  if (isNaN(Number(offer_id))) return res.status(400).json({ message: 'offer_id must be a number' });

  let profile;
  try {
    if (profile_id) {
      const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [profile_id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
      profile = rows[0];
    } else {
      // Build profile from direct fields
      profile = {
        minutes_avg: minutes_avg || 0,
        sms_avg: sms_avg || 0,
        data_avg_gb: data_avg_gb || 0,
        roaming_days: roaming_days || 0,
        budget_max: budget_max || Infinity,
        priority: priority || 'BALANCED'
      };
    }

    const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offer_id]);
    if (offerRows.length === 0) return res.status(404).json({ message: 'Offer not found' });
    let offer = offerRows[0];

    const [optionRows] = await db.query(`SELECT opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id = ?`, [offer_id]);
    offer.options = optionRows;

    let baseCost = Number(offer.monthly_price) || 0;
    const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (Number(offer.quota_minutes) || 0));
    const overSms = Math.max(0, (profile.sms_avg || 0) - (Number(offer.quota_sms) || 0));
    const overData = Math.max(0, (Number(profile.data_avg_gb) || 0) - (Number(offer.quota_data_gb) || 0));
    const overageMinutesCost = overMinutes * (Number(offer.over_minute_price) || 0.1);
    const overageSmsCost = overSms * (Number(offer.over_sms_price) || 0.05);
    const overageDataCost = overData * (Number(offer.over_data_price) || 0.5);
    const overageCost = overageMinutesCost + overageSmsCost + overageDataCost;
    const optionsCost = offer.options.reduce((sum, opt) => sum + (Number(opt.price) || 0), 0);
    const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (Number(offer.roaming_included_days) || 0));
    const roamingCost = overRoamingDays * 5;
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

// Audit log
      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'SIMULATE_SINGLE',
        entity: 'simulation',
        ip_address,
        details: {
          profile_id: profile.profile_id || null,
          offer_id: offer.offer_id,
          total_cost: totalCost.toFixed(2),
          satisfaction_score: satisfactionScore
        }
      });

      const result = {
        profile,
        offer: { ...offer, options: offer.options },
        base_cost: parseFloat(baseCost.toFixed(2)),
        monthly_price: Number(offer.monthly_price),
        overage_minutes_cost: parseFloat(overageMinutesCost.toFixed(2)),
        overage_sms_cost: parseFloat(overageSmsCost.toFixed(2)),
        overage_data_cost: parseFloat(overageDataCost.toFixed(2)),
        roaming_cost: parseFloat(roamingCost.toFixed(2)),
        calculation: {
          base_cost: parseFloat(baseCost.toFixed(2)),
          overage_cost: parseFloat(overageCost.toFixed(2)),
          options_cost: parseFloat(optionsCost.toFixed(2)),
          roaming_cost: parseFloat(roamingCost.toFixed(2)),
          discounts: parseFloat(discounts.toFixed(2)),
          total_cost: parseFloat(totalCost.toFixed(2)),
          satisfaction_score: satisfactionScore
        },
        total_cost: parseFloat(totalCost.toFixed(2)),
        satisfaction_score: satisfactionScore
      };

      await logSimulation(result, 'single');
      res.json(result);
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

router.post('/recommend', requireAuth, async (req, res) => {
  const { profile_id, limit = 5, segment } = req.body;
  
  // Basic validation
  if (limit && (isNaN(Number(limit)) || limit < 1 || limit > 100)) {
    return res.status(400).json({ message: 'limit must be a number between 1 and 100' });
  }
  if (segment && !['PREPAID', 'POSTPAID', 'BUSINESS'].includes(segment)) {
    return res.status(400).json({ message: 'segment must be PREPAID, POSTPAID, or BUSINESS' });
  }

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

       return {
         offer_id: offer.offer_id,
         offer_name: offer.name,
         segment: offer.segment,
         monthly_price: Number(offer.monthly_price),
         base_cost: parseFloat(baseCost.toFixed(2)), // for display
         offer: { ...offer, options: offerOptions },
         overage_minutes_cost: parseFloat(overageMinutesCost.toFixed(2)),
         overage_sms_cost: parseFloat(overageSmsCost.toFixed(2)),
         overage_data_cost: parseFloat(overageDataCost.toFixed(2)),
         roaming_cost: parseFloat(roamingCost.toFixed(2)),
         calculation: {
           base_cost: parseFloat(baseCost.toFixed(2)),
           total_cost: parseFloat(totalCost.toFixed(2)),
           satisfaction_score: score
         },
         // Also provide top-level aliases for convenience
         total_cost: parseFloat(totalCost.toFixed(2)),
         satisfaction_score: score,
         estimated_cost: parseFloat(totalCost.toFixed(2)) // backward compatibility
       };
     });

    if (profile.priority === 'PRICE') recommendations.sort((a, b) => a.estimated_cost - b.estimated_cost);
     else if (profile.priority === 'QUALITY') recommendations.sort((a, b) => b.score - a.score);
     else recommendations.sort((a, b) => (b.score / b.estimated_cost) - (a.score / a.estimated_cost));

// Audit log - log the recommendation request
      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'SIMULATE_RECOMMEND',
        entity: 'simulation',
        ip_address,
        details: {
          profile_id: profile.profile_id || null,
          limit: limit,
          segment: profile.segment || null,
          recommended_offers: recommendations.slice(0, limit).map(r => ({
            offer_id: r.offer_id,
            total_cost: r.total_cost,
            satisfaction_score: r.satisfaction_score
          }))
        }
      });

      const topResult = recommendations[0] ? { ...recommendations[0], profile } : null;
      if (topResult) await logSimulation(topResult, 'recommend');

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

router.post('/compare', requireAuth, async (req, res) => {
  const { profile_id, offer_ids, minutes_avg, sms_avg, data_avg_gb, roaming_days, budget_max, priority } = req.body;
  
  // Basic validation
  if (!offer_ids || !Array.isArray(offer_ids) || offer_ids.length === 0) {
    return res.status(400).json({ message: 'offer_ids (array with at least 2 offers) is required' });
  }
  if (offer_ids.length < 2) {
    return res.status(400).json({ message: 'At least 2 offers required for comparison' });
  }
  if (!offer_ids.every(id => !isNaN(Number(id)))) {
    return res.status(400).json({ message: 'All offer_ids must be numbers' });
  }

  let profile;
  try {
    if (profile_id) {
      const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [profile_id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
      profile = rows[0];
    } else {
      // Build profile from direct fields
      profile = {
        minutes_avg: minutes_avg || 0,
        sms_avg: sms_avg || 0,
        data_avg_gb: data_avg_gb || 0,
        roaming_days: roaming_days || 0,
        budget_max: budget_max || Infinity,
        priority: priority || 'BALANCED'
      };
    }

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
         base_cost: parseFloat(baseCost.toFixed(2)), // for display
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
         },
         total_cost: parseFloat(totalCost.toFixed(2)),
         satisfaction_score: score
       };
    });

    // Sort offers by total cost ascending (cheapest first) for cost ranking
    const sortedByCost = [...comparisons].sort((a, b) => {
      const diff = a.calculation.total_cost - b.calculation.total_cost;
      return diff !== 0 ? diff : a.offer_id - b.offer_id;
    });

    // Sort offers by satisfaction score descending (best first) for main ranking
    // Tie-breaker: if scores equal, prefer lower total cost
    const sortedByScore = [...comparisons].sort((a, b) => {
      const scoreDiff = b.calculation.satisfaction_score - a.calculation.satisfaction_score;
      if (scoreDiff !== 0) return scoreDiff;
      return a.calculation.total_cost - b.calculation.total_cost;
    });

     comparisons.forEach(comp => {
       comp.rank_by_cost = sortedByCost.findIndex(c => c.offer_id === comp.offer_id) + 1;
       comp.rank_by_score = sortedByScore.findIndex(c => c.offer_id === comp.offer_id) + 1;
     });

// Audit log
      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'SIMULATE_COMPARE',
        entity: 'simulation',
        ip_address,
        details: {
          profile_id: profile.profile_id || null,
          offer_ids: offer_ids,
          comparisons: sortedByScore.map(c => ({
            offer_id: c.offer_id,
            total_cost: c.total_cost,
            satisfaction_score: c.satisfaction_score,
            rank_by_score: c.rank_by_score,
            rank_by_cost: c.rank_by_cost
          }))
        }
      });

      for (const comp of sortedByScore) {
        await logSimulation({ ...comp, profile }, 'compare');
      }

      res.json({
       profile,
       count: comparisons.length,
       comparisons: sortedByScore, // Return sorted by score (descending) with tie-breaker
       summary: {
         cheapest: sortedByCost[0]?.offer_name,
         best_score: sortedByScore[0]?.offer_name
       }
     });
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

router.post('/batch', requireAuth, async (req, res) => {
  const { offer_id, profile_ids } = req.body;
  
  // Basic validation
  if (!offer_id) return res.status(400).json({ message: 'offer_id is required' });
  if (isNaN(Number(offer_id))) return res.status(400).json({ message: 'offer_id must be a number' });
  if (profile_ids && !Array.isArray(profile_ids)) {
    return res.status(400).json({ message: 'profile_ids must be an array' });
  }

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

       return {
         profile_id: profile.profile_id,
         label: profile.label,
         base_cost: parseFloat(baseCost.toFixed(2)),
         overage_cost: parseFloat(overageCost.toFixed(2)),
         roaming_cost: parseFloat(roamingCost.toFixed(2)),
         estimated_cost: parseFloat(totalCost.toFixed(2)),
         budget_max: profile.budget_max,
         satisfaction_score: score,
         recommendation
       };
    });

     const goodMatches = results.filter(r => r.recommendation === 'good_match').length;
     const okayMatches = results.filter(r => r.recommendation === 'okay_match').length;
     const totalCostSum = results.reduce((sum, r) => sum + r.estimated_cost, 0);
     const avgSatisfaction = results.reduce((sum, r) => sum + r.satisfaction_score, 0) / results.length;
     const profilesOverBudget = results.filter(r => r.estimated_cost > r.budget_max).length;
      const totalOverageSum = results.reduce((sum, r) => {
        return sum + (r.overage_cost || 0);
      }, 0);

      // Audit log
      const user_id = req.user?.user_id || null;
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id,
        action: 'SIMULATE_BATCH',
        entity: 'simulation',
        ip_address,
        details: {
          offer_id: offer.offer_id,
          total_profiles: results.length,
          good_matches,
          okay_matches,
          avg_total_cost: parseFloat((totalCostSum / results.length).toFixed(2)),
          avg_satisfaction: parseFloat(avgSatisfaction.toFixed(2))
        }
      });

      for (const r of results) {
        const result = {
          offer: { offer_id: offer.offer_id, name: offer.name, segment: offer.segment },
          profile: { profile_id: r.profile_id, label: r.label, budget_max: r.budget_max },
          base_cost: r.base_cost,
          overage_cost: r.overage_cost,
          roaming_cost: r.roaming_cost,
          overage_minutes_cost: 0,
          overage_sms_cost: 0,
          overage_data_cost: r.overage_cost,
          options_cost: 0,
          discounts: 0,
          calculation: {
            total_cost: r.estimated_cost,
            satisfaction_score: r.satisfaction_score
          },
          total_cost: r.estimated_cost,
          satisfaction_score: r.satisfaction_score
        };
        await logSimulation(result, 'batch');
      }

      res.json({
       offer: { offer_id: offer.offer_id, name: offer.name },
       results,
       summary: {
         total_profiles: results.length,
         good_matches: goodMatches,
         okay_matches: okayMatches,
         average_cost: parseFloat((totalCostSum / results.length).toFixed(2)),
         avg_total_cost: parseFloat((totalCostSum / results.length).toFixed(2)),
         avg_satisfaction: parseFloat(avgSatisfaction.toFixed(2)),
         profiles_over_budget: profilesOverBudget,
         avg_overage: parseFloat((totalOverageSum / results.length).toFixed(2))
       }
     });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
