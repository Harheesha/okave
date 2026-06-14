import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function AgentDashboard() {
  const [farmers, setFarmers] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [farmersRes, listingsRes, ordersRes] = await Promise.all([
          api.get('/farmers'),
          api.get('/listings'),
          api.get('/orders'),
        ]);
        setFarmers(farmersRes.data.farmers || farmersRes.data);
        setListings(listingsRes.data.listings || listingsRes.data);
        setOrders(ordersRes.data.orders || ordersRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const activeListing = listings.filter(l => l.status === 'ACTIVE').length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
        <p className="text-green-400 mt-1">Manage farmers, listings, and orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Farmers</p>
          <p className="text-3xl font-bold text-white mt-1">{farmers.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Active Listings</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{activeListing}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-white mt-1">{orders.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Pending Orders</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingOrders}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Link
          to="/agent/register-farmer"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Register Farmer
        </Link>
        <Link
          to="/agent/create-listing"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Create Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        {['overview', 'farmers', 'listings', 'orders'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-green-500 text-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-3">Recent Farmers</h3>
            {farmers.slice(0, 5).map(farmer => (
              <div key={farmer.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div>
                  <p className="text-white text-sm">{farmer.name}</p>
                  <p className="text-gray-400 text-xs">{farmer.phone}</p>
                </div>
                <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">{farmer.location}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-3">Recent Orders</h3>
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div>
                  <p className="text-white text-sm">Order #{order.id.slice(-6)}</p>
                  <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  order.status === 'DELIVERED' ? 'bg-green-900 text-green-300' :
                  order.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-blue-900 text-blue-300'
                }`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'farmers' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left text-gray-300 px-4 py-3">Name</th>
                <th className="text-left text-gray-300 px-4 py-3">Phone</th>
                <th className="text-left text-gray-300 px-4 py-3">Location</th>
                <th className="text-left text-gray-300 px-4 py-3">NIN</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(farmer => (
                <tr key={farmer.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3 text-white">{farmer.name}</td>
                  <td className="px-4 py-3 text-gray-300">{farmer.phone}</td>
                  <td className="px-4 py-3 text-gray-300">{farmer.location}</td>
                  <td className="px-4 py-3 text-gray-400">{farmer.nin || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left text-gray-300 px-4 py-3">Crop</th>
                <th className="text-left text-gray-300 px-4 py-3">Quantity (kg)</th>
                <th className="text-left text-gray-300 px-4 py-3">Price/kg (₦)</th>
                <th className="text-left text-gray-300 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3 text-white">{listing.cropType}</td>
                  <td className="px-4 py-3 text-gray-300">{listing.quantityKg}</td>
                  <td className="px-4 py-3 text-gray-300">₦{listing.pricePerKg}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      listing.status === 'ACTIVE' ? 'bg-green-900 text-green-300' :
                      listing.status === 'SOLD' ? 'bg-gray-700 text-gray-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>{listing.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left text-gray-300 px-4 py-3">Order ID</th>
                <th className="text-left text-gray-300 px-4 py-3">Total (₦)</th>
                <th className="text-left text-gray-300 px-4 py-3">Status</th>
                <th className="text-left text-gray-300 px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t border-gray-700">
                  <td className="px-4 py-3 text-white font-mono text-xs">{order.id.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-300">₦{order.totalPrice}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'DELIVERED' ? 'bg-green-900 text-green-300' :
                      order.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
