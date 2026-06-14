const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// Admin: GET all market prices
router.get('/prices', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const prices = await prisma.marketPriceSnapshot.findMany({ orderBy: { recorded_at: 'desc' } });
    return res.json(prices);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: POST new market price
router.post('/prices', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { crop_type, unit, market_location, min_price_per_unit, max_price_per_unit, average_price_per_unit, source } = req.body;
    if (!crop_type || !unit || !market_location || !min_price_per_unit || !max_price_per_unit)
      return res.status(400).json({ error: 'crop_type, unit, market_location, min/max price required' });
    const price = await prisma.marketPriceSnapshot.create({
      data: {
        crop_type: crop_type.toUpperCase(),
        unit: unit.toLowerCase(),
        market_location,
        min_price_per_unit: parseFloat(min_price_per_unit),
        max_price_per_unit: parseFloat(max_price_per_unit),
        average_price_per_unit: parseFloat(average_price_per_unit || (min_price_per_unit + max_price_per_unit) / 2),
        source: source || 'manual_entry',
        recorded_at: new Date(),
      },
    });
    return res.status(201).json(price);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: PATCH market price
router.patch('/prices/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const price = await prisma.marketPriceSnapshot.update({ where: { id: req.params.id }, data: req.body });
    return res.json(price);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: DELETE market price
router.delete('/prices/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.marketPriceSnapshot.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Deleted' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: dashboard stats
router.get('/stats', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const [farmers, listings, orders, buyers, notifications] = await Promise.all([
      prisma.farmerProfile.count(),
      prisma.produceListing.count({ where: { status: 'LIVE' } }),
      prisma.order.count(),
      prisma.buyerProfile.count(),
      prisma.notification.count({ where: { status: 'QUEUED' } }),
    ]);
    return res.json({ farmers, live_listings: listings, total_orders: orders, buyers, queued_notifications: notifications });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
