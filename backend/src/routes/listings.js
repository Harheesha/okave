const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /listings
router.post('/', authenticate, requireRole('AGENT', 'COOP_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const {
      farmer_id, coop_id, crop_type, variety, quantity, unit,
      location, harvest_date, base_price_per_unit, final_price_per_unit,
      quality_notes, quality_grade,
    } = req.body;

    if (!crop_type || !quantity || !unit || !base_price_per_unit)
      return res.status(400).json({ error: 'crop_type, quantity, unit, base_price_per_unit required' });

    // Fetch price suggestion inline
    const snapshots = await prisma.marketPriceSnapshot.findMany({
      where: { crop_type: crop_type.toUpperCase(), unit: unit.toLowerCase() },
      orderBy: { recorded_at: 'desc' }, take: 10,
    });
    let suggested_min = null, suggested_max = null;
    if (snapshots.length > 0) {
      suggested_min = Math.min(...snapshots.map(s => s.min_price_per_unit));
      suggested_max = Math.max(...snapshots.map(s => s.max_price_per_unit));
    }

    const listing = await prisma.produceListing.create({
      data: {
        farmer_id: farmer_id || null,
        coop_id: coop_id || null,
        agent_id: req.user.id,
        crop_type: crop_type.toUpperCase(),
        variety: variety || '',
        quantity: parseFloat(quantity),
        unit: unit.toLowerCase(),
        location: location || '',
        harvest_date: harvest_date ? new Date(harvest_date) : null,
        base_price_per_unit: parseFloat(base_price_per_unit),
        suggested_min_price_per_unit: suggested_min,
        suggested_max_price_per_unit: suggested_max,
        final_price_per_unit: parseFloat(final_price_per_unit || base_price_per_unit),
        quality_notes: quality_notes || '',
        quality_grade: quality_grade || null,
        quality_verified_by_agent: !!quality_grade,
        status: 'LIVE',
      },
    });

    // Simulate SMS notification to farmer
    if (farmer_id) {
      const farmer = await prisma.farmerProfile.findUnique({ where: { id: farmer_id } });
      if (farmer) {
        await prisma.notification.create({
          data: {
            farmer_id: farmer_id,
            channel: 'SMS',
            message: `Your ${crop_type} (${quantity} ${unit}) has been listed on Okave at NGN${listing.final_price_per_unit}/${unit}.`,
            status: 'QUEUED',
          },
        });
        console.log(`[SMS MOCK] To: ${farmer.phone} | Your ${crop_type} (${quantity} ${unit}) listed at NGN${listing.final_price_per_unit}/${unit}`);
      }
    }

    return res.status(201).json({ listing, price_suggestion: { suggested_min, suggested_max } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /listings
router.get('/', async (req, res) => {
  try {
    const { status, crop_type, location, min_price, max_price, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();
    else where.status = 'LIVE';
    if (crop_type) where.crop_type = crop_type.toUpperCase();
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (min_price || max_price) {
      where.final_price_per_unit = {};
      if (min_price) where.final_price_per_unit.gte = parseFloat(min_price);
      if (max_price) where.final_price_per_unit.lte = parseFloat(max_price);
    }

    const [listings, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        include: {
          farmer: { select: { id: true, full_name: true, state: true, lga: true } },
          coop: { select: { id: true, name: true } },
          photos: { take: 1 },
        },
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.produceListing.count({ where }),
    ]);

    return res.json({ listings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await prisma.produceListing.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: true,
        coop: true,
        photos: true,
        orders: { select: { id: true, status: true, quantity: true }, take: 5 },
      },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    return res.json(listing);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /listings/:id
router.patch('/:id', authenticate, requireRole('AGENT', 'COOP_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const listing = await prisma.produceListing.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json(listing);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /listings/:id/photos
router.post('/:id/photos', authenticate, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const photo = await prisma.listingPhoto.create({
      data: { listing_id: req.params.id, url, taken_by_user_id: req.user.id },
    });
    return res.status(201).json(photo);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /listings/price-suggestion (duplicate endpoint per spec)
router.post('/price-suggestion', async (req, res) => {
  const { crop_type, unit, desired_price_per_unit } = req.body;
  if (!crop_type || !unit) return res.status(400).json({ error: 'crop_type and unit required' });
  const snapshots = await prisma.marketPriceSnapshot.findMany({
    where: { crop_type: crop_type.toUpperCase(), unit: unit.toLowerCase() },
    orderBy: { recorded_at: 'desc' }, take: 10,
  });
  if (snapshots.length === 0) return res.json({ suggested_min: null, suggested_max: null, note: 'No data yet' });
  const suggested_min = Math.min(...snapshots.map(s => s.min_price_per_unit));
  const suggested_max = Math.max(...snapshots.map(s => s.max_price_per_unit));
  let note = `Market range: NGN${suggested_min.toLocaleString()} - NGN${suggested_max.toLocaleString()} / ${unit}`;
  if (desired_price_per_unit) {
    if (+desired_price_per_unit < suggested_min) note += ' | Below market.';
    else if (+desired_price_per_unit > suggested_max) note += ' | Above market.';
    else note += ' | Within market range.';
  }
  return res.json({ suggested_min, suggested_max, note, markets: snapshots.map(s => s.market_location) });
});

module.exports = router;
