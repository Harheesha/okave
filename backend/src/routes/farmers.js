const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /farmers — agent registers a farmer
router.post('/', authenticate, requireRole('AGENT', 'COOP_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { full_name, phone, state, lga, community, coop_id, preferred_contact_channel, main_crops } = req.body;
    if (!full_name || !phone) return res.status(400).json({ error: 'full_name and phone are required' });

    const farmer = await prisma.farmerProfile.create({
      data: {
        full_name,
        phone,
        state: state || '',
        lga: lga || '',
        community: community || '',
        coop_id: coop_id || null,
        preferred_contact_channel: preferred_contact_channel || 'SMS',
        main_crops: main_crops || [],
        registered_by_agent_id: req.user.id,
      },
    });
    return res.status(201).json(farmer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /farmers — list all farmers (agent sees their own, admin sees all)
router.get('/', authenticate, requireRole('AGENT', 'COOP_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { registered_by_agent_id: req.user.id };
    const farmers = await prisma.farmerProfile.findMany({
      where,
      include: { coop: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });
    return res.json(farmers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /farmers/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        coop: true,
        listings: { where: { status: { not: 'CANCELLED' } }, orderBy: { created_at: 'desc' }, take: 10 },
      },
    });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    return res.json(farmer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /farmers/:id
router.patch('/:id', authenticate, requireRole('AGENT', 'ADMIN'), async (req, res) => {
  try {
    const farmer = await prisma.farmerProfile.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json(farmer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
