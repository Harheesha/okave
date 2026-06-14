import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ deliveryAddress: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('okave_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const cartTotal = cart.reduce((sum, c) => sum + c.pricePerKg * c.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      // Create one order per cart item (each linked to a listing/farmer)
      const orderItems = cart.map(item => ({
        listingId: item.listingId,
        quantityKg: item.quantity,
        totalPrice: item.pricePerKg * item.quantity,
        deliveryAddress: form.deliveryAddress,
        notes: form.notes,
      }));
      // For demo: create a single order with first item
      const res = await api.post('/orders', orderItems[0]);
      setOrderConfirmed(res.data.order || res.data);
      localStorage.removeItem('okave_cart');
    } catch (err) {
      setError(err.response?.data?.error || 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-gray-800 border border-green-700 rounded-lg p-8 text-center">
          <div className="text-green-400 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-4">
            Your order has been submitted successfully. You will receive an SMS confirmation shortly.
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <p className="text-gray-400 text-sm">Order ID</p>
            <p className="text-white font-mono text-sm">{orderConfirmed.id}</p>
            <p className="text-gray-400 text-sm mt-2">Status</p>
            <p className="text-yellow-400 text-sm font-medium">{orderConfirmed.status}</p>
            <p className="text-gray-400 text-sm mt-2">Total</p>
            <p className="text-green-400 font-bold">₦{orderConfirmed.totalPrice?.toLocaleString()}</p>
          </div>
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mb-6 text-sm text-blue-300">
            Mock SMS sent to your registered number: "Your Okave order #{orderConfirmed.id?.slice(-6)} has been received. Total: ₦{orderConfirmed.totalPrice}. Thank you!"
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/buyer/marketplace')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/buyer/orders')}
              className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-2 rounded-lg text-sm"
            >
              My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/buyer/marketplace')}
          className="text-green-400 hover:text-green-300 text-sm mb-2"
        >
          ← Back to Marketplace
        </button>
        <h1 className="text-2xl font-bold text-white">Checkout</h1>
        <p className="text-gray-400 mt-1">Review your order and confirm</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Your cart is empty.</p>
          <button
            onClick={() => navigate('/buyer/marketplace')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Order Summary</h3>
            {cart.map(item => (
              <div key={item.listingId} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                <div>
                  <p className="text-white text-sm">{item.cropType}</p>
                  <p className="text-gray-400 text-xs">{item.quantity}kg × ₦{item.pricePerKg}/kg</p>
                </div>
                <p className="text-green-400 text-sm font-semibold">₦{(item.quantity * item.pricePerKg).toLocaleString()}</p>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-400">Delivery</span>
                <span className="text-green-400 text-sm">TBD by agent</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-600">
                <span className="text-white font-bold">Total</span>
                <span className="text-green-400 font-bold text-lg">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Delivery Details</h3>
              {error && (
                <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">
                    Delivery Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={form.deliveryAddress}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Enter your full delivery address"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="08012345678"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>

                <div className="bg-blue-900 border border-blue-700 rounded p-3 text-xs text-blue-300">
                  Payment will be collected on delivery (mock payment mode). An SMS confirmation will be sent after order placement.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium text-sm transition-colors"
                >
                  {loading ? 'Placing Order...' : `Place Order — ₦${cartTotal.toLocaleString()}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
