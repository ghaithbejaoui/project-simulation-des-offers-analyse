import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
  // Offers
  getOffers: () => axios.get(`${API_URL}/offers`),
  getOffer: (id) => axios.get(`${API_URL}/offers/${id}`),
  
  // Customer Profiles
  getProfiles: () => axios.get(`${API_URL}/customer-profiles`),
  getProfile: (id) => axios.get(`${API_URL}/customer-profiles/${id}`),
  // Stats
  getStats: () => axios.get(`${API_URL}/stats`),

  // Simulation
  simulate: (profileId, offerId) => 
    axios.post(`${API_URL}/simulation`, { profile_id: profileId, offer_id: offerId }),
  recommend: (profileId, limit = 5) => 
    axios.post(`${API_URL}/simulation/recommend`, { profile_id: profileId, limit }),
  compare: (profileId, offerIds) => 
    axios.post(`${API_URL}/simulation/compare`, { profile_id: profileId, offer_ids: offerIds }),
  batch: (offerId, profileIds) => 
    axios.post(`${API_URL}/simulation/batch`, { offer_id: offerId, profile_ids: profileIds }),
};
