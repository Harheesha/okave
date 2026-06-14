const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /prices?crop_type=TOMATO&unit=basket
router.get('/', async (req, res) => {
  try {
    const { crop_type, unit } = req.query;
    const where = {};
    if (crop_type) where.crop_type = crop_type.toUpperCase();
    if (unit) where.unit = unit.toLowerCase();

    const snapshots = await prisma.marketPriceSnapshot.findMany({
      where,
      orderBy: { recorded_at: 'desc' },
      take: 20,
    });

    // Aggregate stats across all market locations
    const prices = snapshots.map(s => s.average_price_per_unit).filter(Boolean);
    const aggregated = prices.length > 0 ? {
      min: Math.min(...snapshots.map(s => s.min_price_per_unit)),
      max: Math.max(...snapshots.map(s => s.max_price_per_unit)),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    } : null;

    return res.json({ snapshots, aggregated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /listings/price-suggestion (also exposed here)
router.post('/suggestion', async (req, res) => {
  try {
    const { crop_type, unit, location, desired_price_per_unit } = req.body;
    if (!crop_type || !unit) return res.status(400).json({ error: 'crop_type and unit required' });

    const snapshots = await prisma.marketPriceSnapshot.findMany({
      where: { crop_type: crop_type.toUpperCase(), unit: unit.toLowerCase() },
      orderBy: { recorded_at: 'desc' },
      take: 10,
    });

    if (snapshots.length === 0) {
      return res.json({
        suggested_min: null,
        suggested_max: null,
        note: 'No market data available for this crop/unit combination yet.',
        markets: [],
      });
    }

    const suggested_min = Math.min(...snapshots.map(s => s.min_price_per_unit));
    const suggested_max = Math.max(...snapshots.map(s => s.max_price_per_unit));
    const avg = Math.round(snapshots.map(s => s.average_price_per_unit).reduce((a, b) => a + b, 0) / snapshots.length);

    let note = `Market range: ₦${suggested_min.toLocaleString()} – ₦${suggested_max.toLocaleString()} / ${unit}`;
    if (desired_price_per_unit) {
      if (desired_price_per_unit < suggested_min) note += '. Your price is below market — consider raising it.';
      else if (desired_price_per_unit > suggested_max) note += '. Your price is above market — buyers may prefer lower.';
      else note += '. Your price is within the market range. ';
    }

    return res.json({
      suggested_min,
      suggested_max,
      average: avg,
      note,
      markets: snapshots.map(s => ({ location: s.market_location, min: s.min_price_per_unit, max: s.max_price_per_unit })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
