const express = require('express');
const db = require('../config/database');

const router = express.Router();

// POST /api/simulation (basic: one profile + one offer)
// Body example: { "profile_id": 1, "offer_id": 1 }
router.post('/', async (req, res) => {
  const { profile_id, offer_id } = req.body;

  if (!profile_id || !offer_id) {
    return res.status(400).json({ message: 'profile_id and offer_id are required' });
  }

  try {
    // Step 1: Get the customer profile
    const [profileRows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [profile_id]);
    if (profileRows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const profile = profileRows[0];

    // Step 2: Get the offer + its linked options
    const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offer_id]);
    if (offerRows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    let offer = offerRows[0];

    // Get options for this offer
    const [optionRows] = await db.query(`
      SELECT opt.* FROM options opt
      JOIN offer_options oo ON opt.option_id = oo.option_id
      WHERE oo.offer_id = ?
    `, [offer_id]);
    offer.options = optionRows;

    // Step 3: Calculate costs (from cahier des charges section 5)
    // Formula: Total = Coût_inclus + Dépassements - remises

    // 1. Coût_inclus = prix
    let baseCost = offer.monthly_price || 0;

    // 2. Calculate overages (dépassements)
    const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (offer.quota_minutes || 0));
    const overSms = Math.max(0, (profile.sms_avg || 0) - (offer.quota_sms || 0));
    const overData = Math.max(0, (profile.data_avg_gb || 0) - (offer.quota_data_gb || 0));

    let overageCost =
      overMinutes * (offer.over_minute_price || 0.1000) +
      overSms * (offer.over_sms_price || 0.0500) +
      overData * (offer.over_data_price || 0.5000);

    // 3. Options cost (could be positive or negative for discounts)
    let optionsCost = offer.options.reduce((sum, opt) => sum + (opt.price || 0), 0);

    // 4. Roaming cost
    const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (offer.roaming_included_days || 0));
    let roamingCost = overRoamingDays * 5;

    // 5. Remises (discounts) - options with negative price (like loyalty discounts)
    const discounts = Math.abs(Math.min(0, optionsCost));

    // 6. Total = Coût_inclus + Dépassements - remises
    let totalCost = baseCost + overageCost + roamingCost - discounts;

    // Step 4: Calculate Satisfaction Score
    // Formula from cahier: f(prix, couverture, options, pénalités fair use)
    let score = 100;

    // a) Price factor: cost vs budget
    const budgetRatio = totalCost / (profile.budget_max || 1);
    if (budgetRatio <= 0.7) score += 10;
    else if (budgetRatio <= 1.0) score += 0;
    else score -= 30;

    // b) Couverture: segment quality (BUSINESS > POSTPAID > PREPAID)
    if (offer.segment === 'BUSINESS') score += 10;
    else if (offer.segment === 'POSTPAID') score += 5;

    // c) Options bonus
    const includedOptions = offer.options.length;
    score += Math.min(includedOptions * 2, 10);

    // d) Fair use penalty
    const fairUseExceeded = (profile.data_avg_gb || 0) > (offer.fair_use_gb || 0);
    if (fairUseExceeded) score -= 20;

    // e) Overage penalty
    if (overMinutes + overSms + overData > 0) score -= 10;

    let satisfactionScore = Math.max(0, Math.min(100, score));

    res.json({
      input: { profile_id, offer_id },
      profile,
      offer,
      calculation: {
        base_cost: parseFloat(baseCost.toFixed(2)),
        overage_cost: parseFloat(overageCost.toFixed(2)),
        options_cost: parseFloat(optionsCost.toFixed(2)),
        roaming_cost: parseFloat(roamingCost.toFixed(2)),
        discounts: parseFloat(discounts.toFixed(2)),
        total_cost: parseFloat(totalCost.toFixed(2)),
        satisfaction_score: satisfactionScore,
        score_breakdown: {
          base_score: 100,
          price_factor: budgetRatio <= 0.7 ? '+10' : (budgetRatio <= 1.0 ? '0' : '-30'),
          couverture_bonus: offer.segment === 'BUSINESS' ? '+10' : (offer.segment === 'POSTPAID' ? '+5' : '0'),
          options_bonus: `+${Math.min(includedOptions * 2, 10)}`,
          fair_use_penalty: fairUseExceeded ? '-20' : '0',
          overage_penalty: (overMinutes + overSms + overData > 0) ? '-10' : '0'
        },
        details: {
          over_minutes: overMinutes,
          over_sms: overSms,
          over_data_gb: overData,
          over_roaming_days: overRoamingDays,
          fair_use_exceeded: fairUseExceeded
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/simulation/recommend - Smart recommendations
// Input: { "profile_id": 1, "limit": 5 } OR { "minutes_avg": 500, "budget_max": 50, "priority": "BALANCED" }
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
        minutes_avg: req.body.minutes_avg || 0,
        sms_avg: req.body.sms_avg || 0,
        data_avg_gb: req.body.data_avg_gb || 0,
        roaming_days: req.body.roaming_days || 0,
        budget_max: req.body.budget_max || Infinity,
        priority: req.body.priority || 'BALANCED'
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

    // Get all options for offers
    const [allOptionRows] = await db.query(`SELECT oo.offer_id, opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id`);
    const optionsByOffer = {};
    allOptionRows.forEach(opt => {
      if (!optionsByOffer[opt.offer_id]) optionsByOffer[opt.offer_id] = [];
      optionsByOffer[opt.offer_id].push(opt);
    });

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
      const matchReasons = [];
      const budgetRatio = totalCost / (profile.budget_max || 1);
      if (budgetRatio <= 0.7) { score += 10; matchReasons.push('Excellent price'); }
      else if (budgetRatio <= 1.0) matchReasons.push('Within budget');
      else { score -= 30; matchReasons.push('Over budget'); }
      if (offer.segment === 'BUSINESS') { score += 10; matchReasons.push('Premium segment'); }
      else if (offer.segment === 'POSTPAID') { score += 5; matchReasons.push('Postpaid segment'); }
      const optionsBonus = Math.min(offerOptions.length * 2, 10);
      score += optionsBonus;
      if (offerOptions.length > 0) matchReasons.push(`${offerOptions.length} included options`);
      if ((profile.data_avg_gb || 0) > (offer.fair_use_gb || 0)) { score -= 20; matchReasons.push('Fair use exceeded'); }
      if (overMinutes + overSms + overData > 0) { score -= 10; matchReasons.push('Usage over quotas'); }
      score = Math.max(0, Math.min(100, score));

      return { offer: { ...offer, options: offerOptions }, score, estimated_cost: parseFloat(totalCost.toFixed(2)), match_reasons: matchReasons };
    });

    if (profile.priority === 'PRICE') recommendations.sort((a, b) => a.estimated_cost - b.estimated_cost);
    else if (profile.priority === 'QUALITY') recommendations.sort((a, b) => b.score - a.score);
    else recommendations.sort((a, b) => (b.score / b.estimated_cost) - (a.score / a.estimated_cost));

    const topRecommendations = recommendations.slice(0, limit);
    res.json({ profile, count: topRecommendations.length, recommendations: topRecommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/simulation/compare - Compare multiple offers for one profile
// Input: { "profile_id": 1, "offer_ids": [1, 2, 3] }
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

    // Get all options for offers
    const [allOptionRows] = await db.query(`SELECT oo.offer_id, opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id IN (${placeholders})`, offer_ids);
    const optionsByOffer = {};
    allOptionRows.forEach(opt => {
      if (!optionsByOffer[opt.offer_id]) optionsByOffer[opt.offer_id] = [];
      optionsByOffer[opt.offer_id].push(opt);
    });

    const comparisons = offerRows.map(offer => {
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
      else if (budgetRatio > 1.0) score -= 30;
      if (offer.segment === 'BUSINESS') score += 10;
      else if (offer.segment === 'POSTPAID') score += 5;
      score += Math.min(offerOptions.length * 2, 10);
      if ((profile.data_avg_gb || 0) > (offer.fair_use_gb || 0)) score -= 20;
      if (overMinutes + overSms + overData > 0) score -= 10;
      score = Math.max(0, Math.min(100, score));

      return {
        offer_id: offer.offer_id, offer_name: offer.name, segment: offer.segment, monthly_price: offer.monthly_price,
        calculation: { base_cost: parseFloat(baseCost.toFixed(2)), overage_cost: parseFloat(overageCost.toFixed(2)), roaming_cost: parseFloat(roamingCost.toFixed(2)), discounts: parseFloat(discounts.toFixed(2)), total_cost: parseFloat(totalCost.toFixed(2)), satisfaction_score: score, overages: { minutes: overMinutes, sms: overSms, data_gb: parseFloat(overData.toFixed(2)), roaming_days: overRoamingDays } }
      };
    });

    const sortedByCost = [...comparisons].sort((a, b) => a.calculation.total_cost - b.calculation.total_cost);
    const sortedByScore = [...comparisons].sort((a, b) => b.calculation.satisfaction_score - a.calculation.satisfaction_score);
    comparisons.forEach(comp => {
      comp.rank_by_cost = sortedByCost.findIndex(c => c.offer_id === comp.offer_id) + 1;
      comp.rank_by_score = sortedByScore.findIndex(c => c.offer_id === comp.offer_id) + 1;
    });
    comparisons.sort((a, b) => a.rank_by_cost - b.rank_by_cost);

    res.json({
      profile: { profile_id: profile.profile_id, label: profile.label, budget_max: profile.budget_max, priority: profile.priority },
      count: comparisons.length, comparisons,
      summary: { cheapest: sortedByCost[0]?.offer_name, best_score: sortedByScore[0]?.offer_name, average_cost: parseFloat((comparisons.reduce((sum, c) => sum + c.calculation.total_cost, 0) / comparisons.length).toFixed(2)) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/simulation/batch - Analyze one offer across multiple profiles
// Input: { "offer_id": 1 } OR { "offer_id": 1, "profile_ids": [1, 2, 3] }
router.post('/batch', async (req, res) => {
  const { offer_id, profile_ids } = req.body;
  if (!offer_id) return res.status(400).json({ message: 'offer_id is required' });

  try {
    const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offer_id]);
    if (offerRows.length === 0) return res.status(404).json({ message: 'Offer not found' });
    const offer = offerRows[0];

    // Get options for this offer
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

      let budgetFit;
      if (totalCost <= profile.budget_max * 0.8) budgetFit = 'under';
      else if (totalCost <= profile.budget_max) budgetFit = 'at_limit';
      else budgetFit = 'over';

      return { profile_id: profile.profile_id, label: profile.label, priority: profile.priority, estimated_cost: parseFloat(totalCost.toFixed(2)), budget_max: profile.budget_max, satisfaction_score: score, budget_fit: budgetFit, recommendation };
    });

    const goodMatches = results.filter(r => r.recommendation === 'good_match').length;
    const okayMatches = results.filter(r => r.recommendation === 'okay_match').length;
    const notRecommended = results.filter(r => r.recommendation === 'not_recommended').length;
    const totalCostSum = results.reduce((sum, r) => sum + r.estimated_cost, 0);
    const totalScoreSum = results.reduce((sum, r) => sum + r.satisfaction_score, 0);

    res.json({
      offer: { offer_id: offer.offer_id, name: offer.name, segment: offer.segment, monthly_price: offer.monthly_price },
      results,
      summary: { total_profiles: results.length, good_matches: goodMatches, okay_matches: okayMatches, not_recommended: notRecommended, match_rate: parseFloat(((goodMatches / results.length) * 100).toFixed(1)), average_cost: parseFloat((totalCostSum / results.length).toFixed(2)), average_score: Math.round(totalScoreSum / results.length) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
