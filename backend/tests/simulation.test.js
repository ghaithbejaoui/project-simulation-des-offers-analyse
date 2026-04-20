const assert = require('assert');

// Simulation calculation functions (extracted from routes/simulation.js)
function calculateCost(offer, profile, options = []) {
  const baseCost = offer.monthly_price || 0;
  
  const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (offer.quota_minutes || 0));
  const overMinutesCost = overMinutes * (offer.over_minute_price || 0);
  
  const overSms = Math.max(0, (profile.sms_avg || 0) - (offer.quota_sms || 0));
  const overSmsCost = overSms * (offer.over_sms_price || 0);
  
  const overData = Math.max(0, (profile.data_avg_gb || 0) - (offer.quota_data_gb || 0));
  const overDataCost = overData * (offer.over_data_price || 0);
  
  const overageCost = overMinutesCost + overSmsCost + overDataCost;
  
  const overRoamingDays = Math.max(0, (profile.roaming_days || 0) - (offer.roaming_included_days || 0));
  const roamingCost = overRoamingDays * 5; // Fixed rate
  
  const optionsCost = options.reduce((sum, opt) => sum + (opt.price || 0), 0);
  const discounts = Math.abs(Math.min(0, optionsCost));
  
  const totalCost = baseCost + overageCost + roamingCost + optionsCost - discounts;
  
  return {
    base_cost: baseCost,
    overage_cost: overageCost,
    overage_minutes_cost: overMinutesCost,
    overage_sms_cost: overSmsCost,
    overage_data_cost: overDataCost,
    roaming_cost: roamingCost,
    options_cost: optionsCost,
    discounts: discounts,
    total_cost: totalCost
  };
}

function calculateSatisfaction(offer, profile, totalCost, options = []) {
  let score = 100;
  
  // Budget ratio bonus/penalty
  const budgetRatio = totalCost / (profile.budget_max || 1);
  if (budgetRatio <= 0.7) score += 10;
  else if (budgetRatio > 1.0) score -= 30;
  
  // Segment bonus
  if (profile.segment === 'BUSINESS') score += 10;
  else if (profile.segment === 'POSTPAID') score += 5;
  
  // Options bonus
  score += Math.min(options.length * 2, 10);
  
  // Fair use penalty
  if ((profile.data_avg_gb || 0) > (offer.fair_use_gb || 0)) score -= 20;
  
  // Overage penalty
  const overMinutes = Math.max(0, (profile.minutes_avg || 0) - (offer.quota_minutes || 0));
  const overSms = Math.max(0, (profile.sms_avg || 0) - (offer.quota_sms || 0));
  const overData = Math.max(0, (profile.data_avg_gb || 0) - (offer.quota_data_gb || 0));
  if (overMinutes > 0 || overSms > 0 || overData > 0) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

// Test cases
const testOffer = {
  monthly_price: 25,
  quota_minutes: 100,
  quota_sms: 50,
  quota_data_gb: 5,
  validity_days: 30,
  fair_use_gb: 10,
  over_minute_price: 0.5,
  over_sms_price: 0.1,
  over_data_price: 2,
  roaming_included_days: 0
};

const testProfile = {
  minutes_avg: 120,
  sms_avg: 60,
  data_avg_gb: 8,
  night_usage_pct: 20,
  roaming_days: 5,
  budget_max: 50,
  priority: 'PRICE',
  segment: 'POSTPAID'
};

console.log('Running simulation tests...\n');

// Test 1: Cost calculation within quota
const result1 = calculateCost(testOffer, { ...testProfile, minutes_avg: 50, sms_avg: 20, data_avg_gb: 2, roaming_days: 0 });
assert.strictEqual(result1.total_cost, 25, 'Total cost should be base price when within quota');
console.log('✓ Test 1: Within quota cost');

// Test 2: Overage calculation
const result2 = calculateCost(testOffer, { ...testProfile, minutes_avg: 150, sms_avg: 60, data_avg_gb: 8 });
assert.strictEqual(result2.overage_minutes_cost, 25, 'Overage minutes cost incorrect');
assert.strictEqual(result2.overage_sms_cost, 1, 'Overage SMS cost incorrect');
assert.strictEqual(result2.overage_data_cost, 6, 'Overage data cost incorrect');
console.log('✓ Test 2: Overage calculation');

// Test 3: Roaming cost (5 extra days over included 0 = 5 * 5 = 25)
const result3 = calculateCost(testOffer, { ...testProfile, roaming_days: 5 });
assert.strictEqual(result3.roaming_cost, 25, 'Roaming cost incorrect (5 extra days * 5 TND)');
console.log('✓ Test 3: Roaming cost');

// Test 4: Satisfaction score within budget
const cost = calculateCost(testOffer, { ...testProfile, budget_max: 100 }).total_cost;
const sat1 = calculateSatisfaction(testOffer, { ...testProfile, budget_max: 100 }, cost);
assert.strictEqual(sat1, 100, 'Score should be clamped to max 100');
console.log('✓ Test 4: Satisfaction within budget');

// Test 5: Satisfaction over budget (data overage causes -10 penalty too)
const sat2 = calculateSatisfaction(testOffer, { ...testProfile, budget_max: 20 }, 50);
assert.strictEqual(sat2, 65, 'Score should have both overbudget penalty and overage penalty');
console.log('✓ Test 5: Satisfaction over budget');

// Test 6: Fair use penalty (data > fair_use causes -20, also has overage for -10)
const sat3 = calculateSatisfaction(testOffer, { ...testProfile, data_avg_gb: 15 }, 50);
assert.strictEqual(sat3, 75, 'Score should have fair use penalty and overage penalty');
console.log('✓ Test 6: Fair use penalty');

console.log('\nAll tests passed! ✓');