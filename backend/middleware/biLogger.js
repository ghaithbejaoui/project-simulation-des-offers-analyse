const db = require('../config/database');

async function logSimulation(result, simType = 'single') {
  try {
    const calc = result.calculation || {};
    const offer = result.offer || {};
    const profile = result.profile || {};

    const totalOverage =
      (result.overage_minutes_cost || 0) +
      (result.overage_sms_cost || 0) +
      (result.overage_data_cost || 0);

    const row = {
      offer_id: offer.offer_id || offer.id || null,
      offer_name: offer.name || offer.offer_name || 'Unknown',
      offer_segment: offer.segment || 'UNKNOWN',
      profile_id: profile.profile_id || profile.id || null,
      profile_name: profile.label || profile.name || profile.profile_name || 'Unknown',
      profile_segment: profile.segment || 'UNKNOWN',
      base_cost: result.base_cost || 0,
      overage_minutes_cost: result.overage_minutes_cost || 0,
      overage_sms_cost: result.overage_sms_cost || 0,
      overage_data_cost: result.overage_data_cost || 0,
      roaming_cost: result.roaming_cost || 0,
      options_cost: calc.options_cost || 0,
      discounts: calc.discounts || 0,
      total_cost: result.total_cost || calc.total_cost || 0,
      satisfaction_score: result.satisfaction_score || calc.satisfaction_score || 0,
      has_overage: totalOverage > 0 ? 1 : 0,
      is_recommended: (result.satisfaction_score || calc.satisfaction_score || 0) >= 70 ? 1 : 0,
      simulation_type: simType,
    };

    await db.query('INSERT INTO fact_simulations SET ?', row);
  } catch (err) {
    console.error('[biLogger] Failed to log simulation:', err.message);
  }
}

module.exports = { logSimulation };