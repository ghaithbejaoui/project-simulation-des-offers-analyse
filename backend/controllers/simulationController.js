const db = require('../config/database');
const { logAction } = require('../routes/audit');
const { logSimulation } = require('../middleware/biLogger');
const {
  computeProfileSegment,
  calculateCost,
  calculateSatisfactionScore,
  generateJustification,
  runSimulation,
  getOfferWithOptions,
  getOffersWithAllOptions
} = require('../services/simulationService');

const simulationController = {
  async runSingle(req, res) {
    const { profile_id, offer_id, minutes_avg, sms_avg, data_avg_gb, roaming_days, budget_max, priority } = req.body;

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
        profile = {
          minutes_avg: minutes_avg || 0,
          sms_avg: sms_avg || 0,
          data_avg_gb: data_avg_gb || 0,
          roaming_days: roaming_days || 0,
          budget_max: budget_max || Infinity,
          priority: (priority || 'BALANCED').toUpperCase()
        };
      }

      profile.segment = computeProfileSegment(profile);

      const offer = await getOfferWithOptions(offer_id);
      if (!offer) return res.status(404).json({ message: 'Offer not found' });

      const result = await runSimulation(profile, offer);

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
          total_cost: result.total_cost,
          satisfaction_score: result.satisfaction_score
        }
      });

      await logSimulation(result, 'single');
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async recommend(req, res) {
    const { profile_id, limit = 5, segment } = req.body;

    if (limit && (isNaN(Number(limit)) || limit < 1 || limit > 100)) {
      return res.status(400).json({ message: 'limit must be a number between 1 and 100' });
    }
    if (segment && !['PREPAID', 'POSTPAID', 'BUSINESS', 'DATA_ONLY'].includes(segment)) {
      return res.status(400).json({ message: 'segment must be PREPAID, POSTPAID, BUSINESS, or DATA_ONLY' });
    }

    let profile;
    try {
      if (profile_id) {
        const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ?', [profile_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
        profile = rows[0];
        if (req.body.priority) {
          profile.priority = req.body.priority.toUpperCase();
        }
      } else {
        profile = {
          minutes_avg: req.body.minutes_avg || 0,
          sms_avg: req.body.sms_avg || 0,
          data_avg_gb: req.body.data_avg_gb || 0,
          roaming_days: req.body.roaming_days || 0,
          budget_max: req.body.budget_max || Infinity,
          priority: (req.body.priority || 'BALANCED').toUpperCase()
        };
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }

    profile.segment = computeProfileSegment(profile);

    try {
      const offers = await getOffersWithAllOptions();
      const filteredOffers = segment ? offers.filter(o => o.segment === segment) : offers;

      const recommendations = filteredOffers.map(offer => {
        const cost = calculateCost(offer, profile, offer.options);
        const score = calculateSatisfactionScore(cost.totalCost, profile, offer, offer.options);

        return {
          offer_id: offer.offer_id,
          offer_name: offer.name,
          segment: offer.segment,
          monthly_price: Number(offer.monthly_price),
          base_cost: parseFloat(cost.baseCost.toFixed(2)),
          offer: { ...offer, options: offer.options },
          overage_minutes_cost: parseFloat(cost.overageMinutesCost.toFixed(2)),
          overage_sms_cost: parseFloat(cost.overageSmsCost.toFixed(2)),
          overage_data_cost: parseFloat(cost.overageDataCost.toFixed(2)),
          roaming_cost: parseFloat(cost.roamingCost.toFixed(2)),
          calculation: {
            base_cost: parseFloat(cost.baseCost.toFixed(2)),
            total_cost: parseFloat(cost.totalCost.toFixed(2)),
            satisfaction_score: score
          },
          total_cost: parseFloat(cost.totalCost.toFixed(2)),
          satisfaction_score: score,
          estimated_cost: parseFloat(cost.totalCost.toFixed(2))
        };
      });

      const priority = profile.priority;
      if (priority === 'PRICE') recommendations.sort((a, b) => a.estimated_cost - b.estimated_cost);
      else if (priority === 'QUALITY') recommendations.sort((a, b) => b.satisfaction_score - a.satisfaction_score);
      else recommendations.sort((a, b) => (b.satisfaction_score / b.estimated_cost) - (a.satisfaction_score / a.estimated_cost));

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
          segment: profile.segment,
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
      res.status(500).json({ message: error.message });
    }
  },

  async compare(req, res) {
    const { profile_id, offer_ids, minutes_avg, sms_avg, data_avg_gb, roaming_days, budget_max, priority } = req.body;

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
        profile = {
          minutes_avg: minutes_avg || 0,
          sms_avg: sms_avg || 0,
          data_avg_gb: data_avg_gb || 0,
          roaming_days: roaming_days || 0,
          budget_max: budget_max || Infinity,
          priority: (priority || 'BALANCED').toUpperCase()
        };
      }

      profile.segment = computeProfileSegment(profile);

      const placeholders = offer_ids.map(() => '?').join(',');
      const [offerRows] = await db.query(`SELECT * FROM offers WHERE offer_id IN (${placeholders})`, offer_ids);
      if (offerRows.length === 0) return res.status(404).json({ message: 'No offers found' });

      const [allOptionRows] = await db.query(
        `SELECT oo.offer_id, opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id IN (${placeholders})`,
        offer_ids
      );

      const optionsByOffer = {};
      allOptionRows.forEach(opt => {
        if (!optionsByOffer[opt.offer_id]) optionsByOffer[opt.offer_id] = [];
        optionsByOffer[opt.offer_id].push(opt);
      });

      const comparisons = offerRows.map(offer => {
        const offerOptions = optionsByOffer[offer.offer_id] || [];
        const cost = calculateCost(offer, profile, offerOptions);
        const score = calculateSatisfactionScore(cost.totalCost, profile, offer, offerOptions);

        return {
          offer_id: offer.offer_id,
          offer_name: offer.name,
          segment: offer.segment,
          monthly_price: Number(offer.monthly_price),
          base_cost: parseFloat(cost.baseCost.toFixed(2)),
          offer: {
            offer_id: offer.offer_id,
            name: offer.name,
            segment: offer.segment,
            quota_data_gb: Number(offer.quota_data_gb),
            quota_minutes: Number(offer.quota_minutes),
            quota_sms: Number(offer.quota_sms),
          },
          overage_minutes_cost: parseFloat(cost.overageMinutesCost.toFixed(2)),
          overage_sms_cost: parseFloat(cost.overageSmsCost.toFixed(2)),
          overage_data_cost: parseFloat(cost.overageDataCost.toFixed(2)),
          roaming_cost: parseFloat(cost.roamingCost.toFixed(2)),
          calculation: {
            base_cost: parseFloat(cost.baseCost.toFixed(2)),
            total_cost: parseFloat(cost.totalCost.toFixed(2)),
            satisfaction_score: score
          },
          total_cost: parseFloat(cost.totalCost.toFixed(2)),
          satisfaction_score: score
        };
      });

      const sortedByCost = [...comparisons].sort((a, b) => {
        const diff = a.calculation.total_cost - b.calculation.total_cost;
        return diff !== 0 ? diff : a.offer_id - b.offer_id;
      });

      const sortedByScore = [...comparisons].sort((a, b) => {
        const scoreDiff = b.calculation.satisfaction_score - a.calculation.satisfaction_score;
        if (scoreDiff !== 0) return scoreDiff;
        return a.calculation.total_cost - b.calculation.total_cost;
      });

      comparisons.forEach(comp => {
        comp.rank_by_cost = sortedByCost.findIndex(c => c.offer_id === comp.offer_id) + 1;
        comp.rank_by_score = sortedByScore.findIndex(c => c.offer_id === comp.offer_id) + 1;
      });

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
        comparisons: sortedByScore,
        summary: {
          cheapest: sortedByCost[0]?.offer_name,
          best_score: sortedByScore[0]?.offer_name
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async batch(req, res) {
    const { offer_id, profile_ids } = req.body;

    if (!offer_id) return res.status(400).json({ message: 'offer_id is required' });
    if (isNaN(Number(offer_id))) return res.status(400).json({ message: 'offer_id must be a number' });
    if (profile_ids && !Array.isArray(profile_ids)) {
      return res.status(400).json({ message: 'profile_ids must be an array' });
    }

    try {
      const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offer_id]);
      if (offerRows.length === 0) return res.status(404).json({ message: 'Offer not found' });
      const offer = offerRows[0];

      const [optionRows] = await db.query(
        `SELECT opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id = ?`,
        [offer_id]
      );
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

      profiles = profiles.map(p => ({ ...p, segment: computeProfileSegment(p) }));

      const results = profiles.map(profile => {
        const cost = calculateCost(offer, profile, offerOptions);
        const score = calculateSatisfactionScore(cost.totalCost, profile, offer, offerOptions);

        let recommendation;
        if (score >= 70 && cost.totalCost <= profile.budget_max) recommendation = 'good_match';
        else if (score >= 50) recommendation = 'okay_match';
        else recommendation = 'not_recommended';

        return {
          profile_id: profile.profile_id,
          label: profile.label,
          base_cost: parseFloat(cost.baseCost.toFixed(2)),
          overage_cost: parseFloat(cost.overageCost.toFixed(2)),
          roaming_cost: parseFloat(cost.roamingCost.toFixed(2)),
          estimated_cost: parseFloat(cost.totalCost.toFixed(2)),
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
      const totalOverageSum = results.reduce((sum, r) => sum + (r.overage_cost || 0), 0);

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
          good_matches: goodMatches,
          okay_matches: okayMatches,
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
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = simulationController;