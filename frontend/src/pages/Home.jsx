import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
        <p className="text-blue-100 mt-2 text-lg">Here's what's happening with your telecom offers today.</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-8">Loading stats...</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Offers */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Offers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalOffers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  💼
                </div>
              </div>
            </div>

            {/* Customer Profiles */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Customer Profiles</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalProfiles}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
            </div>

            {/* Average Price */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Price</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">${stats.averagePrice?.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  💰
                </div>
              </div>
            </div>

            {/* Total Segments */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Segments</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.offersBySegment?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  📊
                </div>
              </div>
            </div>
          </div>

          {/* Offers by Segment */}
          {stats.offersBySegment && stats.offersBySegment.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Offers by Segment</h2>
              <div className="flex flex-wrap gap-3">
                {stats.offersBySegment.map((seg, index) => (
                  <span key={index} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                    {seg.segment}: {seg.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">No stats available</div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/offers" className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📋</span>
              <span className="text-gray-400 group-hover:text-blue-500 transition-colors">→</span>
            </div>
            <h3 className="font-semibold text-gray-900">Manage Offers</h3>
            <p className="text-sm text-gray-500 mt-1">Create and edit telecom offers</p>
          </Link>

          <Link to="/profiles" className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-green-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">👥</span>
              <span className="text-gray-400 group-hover:text-green-500 transition-colors">→</span>
            </div>
            <h3 className="font-semibold text-gray-900">Customer Profiles</h3>
            <p className="text-sm text-gray-500 mt-1">Manage customer segments</p>
          </Link>

          <Link to="/simulation" className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🧮</span>
              <span className="text-gray-400 group-hover:text-purple-500 transition-colors">→</span>
            </div>
            <h3 className="font-semibold text-gray-900">Run Simulation</h3>
            <p className="text-sm text-gray-500 mt-1">Simulate costs for a profile</p>
          </Link>

          <Link to="/compare" className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">⚖️</span>
              <span className="text-gray-400 group-hover:text-orange-500 transition-colors">→</span>
            </div>
            <h3 className="font-semibold text-gray-900">Compare Offers</h3>
            <p className="text-sm text-gray-500 mt-1">Compare multiple offers side by side</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
