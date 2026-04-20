const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const get = (path) => {
  const token = localStorage.getItem("token");
  return fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(r => {
    if (!r.ok) throw new Error(`BI API error: ${r.status}`);
    return r.json();
  });
};

export const biService = {
  getKpis: () => get('/api/bi/kpis'),
  getArpu: () => get('/api/bi/arpu'),
  getOverage: () => get('/api/bi/overage'),
  getRecommendationRate: () => get('/api/bi/recommendation-rate'),
  getDailyVolume: (days = 30) => get(`/api/bi/daily-volume?days=${days}`),
  getSegmentSummary: () => get('/api/bi/segment-summary'),
  getTopOffers: (n = 5) => get(`/api/bi/top-offers?limit=${n}`),
};