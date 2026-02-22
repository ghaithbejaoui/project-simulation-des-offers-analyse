import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await api.getOffers();
      setOffers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading offers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Telecom Offers</h1>
      <div className="grid gap-4">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{offer.name}</h2>
            <p className="text-gray-600">{offer.description}</p>
            <p className="text-blue-600 font-bold">${offer.price}/month</p>
          </div>
        ))}
      </div>
    </div>
  );
}
