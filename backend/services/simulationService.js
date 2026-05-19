const db = require('../config/database');

const computeProfileSegment = (profile) => {
  let segment = 'POSTPAID';
  if (profile.data_avg_gb > 40 && profile.minutes_avg === 0 && profile.sms_avg === 0) {
    segment = 'DATA_ONLY';
  } else if (profile.budget_max <= 30) {
    segment = 'PREPAID';
  } else if (profile.budget_max >= 100 && (profile.minutes_avg > 500 || profile.data_avg_gb > 30)) {
    segment = 'BUSINESS';
  }
  return segment;
};

const calculateCost = (offer, profile, options = []) => {
  const baseCost = Number(offer.monthly_price) || 0;
  const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (Number(offer.quota_minutes) || 0));
  const overSms = Math.max(0, (profile.sms_avg || 0) - (Number(offer.quota_sms) || 0));
  const overData = Math.max(0, (Number(profile.data_avg_gb) || 0) - (Number(offer.quota_data_gb) || 0));
  
  const overageMinutesCost = overMinutes * (Number(offer.over_minute_price) || 0.1);
  const overageSmsCost = overSms * (Number(offer.over_sms_price) || 0.05);
  const overageDataCost = overData * (Number(offer.over_data_price) || 0.5);
  const overageCost = overageMinutesCost + overageSmsCost + overageDataCost;
  
  const optionsCost = options.reduce((sum, opt) => sum + (Number(opt.price) || 0), 0);
  const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (Number(offer.roaming_included_days) || 0));
  const roamingCost = overRoamingDays * 5;
  
  const discounts = Math.abs(Math.min(0, optionsCost));
  const totalCost = baseCost + overageCost + roamingCost + optionsCost - discounts;

  return {
    baseCost,
    overageCost,
    overageMinutesCost,
    overageSmsCost,
    overageDataCost,
    optionsCost,
    roamingCost,
    totalCost,
    overMinutes,
    overSms,
    overData,
    overRoamingDays
  };
};

const calculateSatisfactionScore = (totalCost, profile, offer, options = []) => {
  let score = 100;
  const budgetRatio = totalCost / (profile.budget_max || 1);
  
  if (budgetRatio <= 0.7) score += 10;
  else if (budgetRatio <= 1.0) score += 0;
  else score -= 30;
  
  if (profile.segment === 'BUSINESS') score += 10;
  else if (profile.segment === 'POSTPAID') score += 5;
  
  score += Math.min(options.length * 2, 10);
  
  const fairUseExceeded = (profile.data_avg_gb || 0) > (offer.fair_use_gb || 0);
  if (fairUseExceeded) score -= 20;
  
  return Math.max(0, Math.min(100, score));
};

const generateJustification = (totalCost, profile, offer, options, budgetRatio, overMinutes, overSms, overData, roamingCost, fairUseExceeded) => {
  const justification = [];
  
  if (budgetRatio <= 0.7) {
    justification.push(`Within budget: ${((profile.budget_max - totalCost) / (profile.budget_max || 1) * 100).toFixed(1)}% savings`);
  } else if (budgetRatio > 1.0) {
    justification.push(`Exceeds budget by ${((totalCost - (profile.budget_max || 1)) / (profile.budget_max || 1) * 100).toFixed(1)}%`);
  }
  
  if (profile.segment === 'BUSINESS') {
    justification.push('Optimal for business segment with high usage');
  } else if (profile.segment === 'PREPAID') {
    justification.push('Budget-friendly for cost-conscious customers');
  } else if (profile.segment === 'DATA_ONLY') {
    justification.push('Designed for data-heavy usage patterns');
  }
  
  if (options && options.length > 0) {
    justification.push(`Includes ${options.length} add-on option(s)`);
  }
  
  if (overMinutes > 0) {
    justification.push(`${overMinutes.toFixed(0)} extra minutes at ${offer.over_minute_price}/min`);
  }
  if (overSms > 0) {
    justification.push(`${overSms.toFixed(0)} extra SMS at ${offer.over_sms_price}/SMS`);
  }
  if (overData > 0) {
    justification.push(`${overData.toFixed(1)}GB over quota at ${offer.over_data_price}/GB`);
  }
  if (roamingCost > 0) {
    justification.push(`${Math.max(0, (profile.roaming_days || 0) - (Number(offer.roaming_included_days) || 0))} roaming days at 5/day`);
  }
  if (fairUseExceeded) {
    justification.push('Warning: Fair use limit exceeded - possible throttling');
  }
  
  return justification;
};

const runSimulation = async (profile, offer) => {
  const offerWithOptions = await getOfferWithOptions(offer.offer_id);
  if (!offerWithOptions) return null;

  const cost = calculateCost(offerWithOptions, profile, offerWithOptions.options);
  const score = calculateSatisfactionScore(cost.totalCost, profile, offerWithOptions, offerWithOptions.options);
  const budgetRatio = cost.totalCost / (profile.budget_max || 1);
  const fairUseExceeded = (profile.data_avg_gb || 0) > (offerWithOptions.fair_use_gb || 0);
  const justification = generateJustification(
    cost.totalCost, profile, offerWithOptions, offerWithOptions.options,
    budgetRatio, cost.overMinutes, cost.overSms, cost.overData,
    cost.roamingCost, fairUseExceeded
  );

  return {
    profile,
    offer: { ...offerWithOptions, options: offerWithOptions.options },
    base_cost: parseFloat(cost.baseCost.toFixed(2)),
    monthly_price: Number(offerWithOptions.monthly_price),
    overage_minutes_cost: parseFloat(cost.overageMinutesCost.toFixed(2)),
    overage_sms_cost: parseFloat(cost.overageSmsCost.toFixed(2)),
    overage_data_cost: parseFloat(cost.overageDataCost.toFixed(2)),
    roaming_cost: parseFloat(cost.roamingCost.toFixed(2)),
    calculation: {
      base_cost: parseFloat(cost.baseCost.toFixed(2)),
      overage_cost: parseFloat(cost.overageCost.toFixed(2)),
      options_cost: parseFloat(cost.optionsCost.toFixed(2)),
      roaming_cost: parseFloat(cost.roamingCost.toFixed(2)),
      discounts: 0,
      total_cost: parseFloat(cost.totalCost.toFixed(2)),
      satisfaction_score: score
    },
    total_cost: parseFloat(cost.totalCost.toFixed(2)),
    satisfaction_score: score,
    justification: justification.join('. ')
  };
};

const getOfferWithOptions = async (offerId) => {
  const [offerRows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offerId]);
  if (offerRows.length === 0) return null;
  
  const offer = offerRows[0];
  const [optionsRows] = await db.query(
    `SELECT opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id WHERE oo.offer_id = ?`,
    [offerId]
  );
  offer.options = optionsRows;
  return offer;
};

const getOffersWithAllOptions = async () => {
  const [offers] = await db.query('SELECT * FROM offers WHERE status = ?', ['PUBLISHED']);
  const [allOptionRows] = await db.query(
    `SELECT oo.offer_id, opt.* FROM options opt JOIN offer_options oo ON opt.option_id = oo.option_id`
  );
  
  const optionsByOffer = {};
  allOptionRows.forEach(opt => {
    if (!optionsByOffer[opt.offer_id]) optionsByOffer[opt.offer_id] = [];
    optionsByOffer[opt.offer_id].push(opt);
  });
  
  return offers.map(offer => ({
    ...offer,
    options: optionsByOffer[offer.offer_id] || []
  }));
};

module.exports = {
  computeProfileSegment,
  calculateCost,
  calculateSatisfactionScore,
  generateJustification,
  runSimulation,
  getOfferWithOptions,
  getOffersWithAllOptions
};