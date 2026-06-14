import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CreateListing() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [marketPrice, setMarketPrice] = useState(null);
  const [form, setForm] = useState({
    farmerId: '',
    cropType: '',
    quantityKg: '',
    pricePerKg: '',
    harvestDate: '',
    description: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/farmers').then(res => {
      setFarmers(res.data.farmers || res.data);
    }).catch(console.error);
  }, []);

  const fetchMarketPrice = async (cropType) => {
    if (!cropType) return;
    try {
      const res = await api.get(`/prices?cropType=${encodeURIComponent(cropType)}`);
      const prices = res.data.prices || res.data;
      if (prices && prices.length > 0) {
        const latest = prices[0];
        setMarketPrice(latest);
        setForm(prev => ({ ...prev, pricePerKg: latest.avgPricePerKg.toString() }));
      } else {
        setMarketPrice(null);
      }
    } catch {
      setMarketPrice(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'cropType') {
      fetchMarketPrice(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/listings', {
        ...form,
        quantityKg: parseFloat(form.quantityKg),
        pricePerKg: parseFloat(form.pricePerKg),
      });
      setSuccess('Listing created successfully!');
      setTimeout(() => navigate('/agent/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const CROPS = ['Maize', 'Rice', 'Sorghum', 'Millet', 'Groundnut', 'Cowpea', 'Cassava', 'Yam', 'Tomato', 'Pepper'];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/agent/dashboard')}
          className="text-green-400 hover:text-green-300 text-sm mb-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-white">Create Listing</h1>
        <p className="text-gray-400 mt-1">List a farmer's produce on the marketplace</p>
      </div>

      {/* Price Intelligence Banner */}
      {marketPrice && (
        <div className="mb-4 p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <p className="text-blue-200 text-sm font-medium">Price Intelligence</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-white">
              Market avg for <strong>{marketPrice.cropType}</strong>: ₦{marketPrice.avgPricePerKg}/kg
            </p>
            <div className="text-xs text-blue-300">
              Range: ₦{marketPrice.minPrice} – ₦{marketPrice.maxPrice}
            </div>
          </div>
          <p className="text-blue-300 text-xs mt-1">Price auto-filled from latest market snapshot</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded text-green-300 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Farmer <span className="text-red-400">*</span>
            </label>
            <select
              name="farmerId"
              value={form.farmerId}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="">Select a farmer</option>
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} — {f.location}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Crop Type <span className="text-red-400">*</span>
              </label>
              <select
                name="cropType"
                value={form.cropType}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              >
                <option value="">Select crop</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Quantity (kg) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="quantityKg"
                value={form.quantityKg}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g. 500"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Price per kg (₦) <span className="text-red-400">*</span>
                {marketPrice && <span className="text-blue-400 ml-1 text-xs">(from market data)</span>}
              </label>
              <input
                type="number"
                name="pricePerKg"
                value={form.pricePerKg}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                placeholder="e.g. 350"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Harvest Date</label>
              <input
                type="date"
                name="harvestDate"
                value={form.harvestDate}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Pickup Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Dawanau Market, Kano"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Additional details about the produce quality, packaging, etc."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          {form.quantityKg && form.pricePerKg && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-gray-300 text-sm">Estimated total value:</p>
              <p className="text-green-400 text-xl font-bold">
                ₦{(parseFloat(form.quantityKg) * parseFloat(form.pricePerKg)).toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/agent/dashboard')}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
