import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await api.getProfiles();
      setProfiles(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profiles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customer Profiles</h1>
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-gray-600">{profile.description || 'No description'}</p>
            <div className="text-sm text-gray-500 mt-2">
              <p>Segment: {profile.segment || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
