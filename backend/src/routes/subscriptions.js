const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /subscriptions
router.post('/', authenticate, requireRole('BUYER'), async (req, res) => {
  try {
    const { label, frequency, next_delivery_date, items } = req.body;
    if (!label || !frequency || !items?.length)
      return res.status(400).json({ error: 'label, frequency, and items required' });
    const bp = await prisma.buyerProfile.findFirst({ where: { user_id: req.user.id } });
    if (!bp) return res.status(400).json({ error: 'Buyer profile not found' });
    const subscription = await prisma.subscriptionPlan.create({
      data: {
        buyer_id: bp.id, label, frequency,
        next_delivery_date: next_delivery_date ? new Date(next_delivery_date) : null,
        is_active: true,
        items: { create: items.map(i => ({ crop_type: i.crop_type.toUpperCase(), quantity: parseFloat(i.quantity), unit: i.unit })) },
      },
      include: { items: true },
    });
    return res.status(201).json(subscription);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /subscriptions
router.get('/', authenticate, requireRole('BUYER'), async (req, res) => {
  try {
    const bp = await prisma.buyerProfile.findFirst({ where: { user_id: req.user.id } });
    const subs = await prisma.subscriptionPlan.findMany({ where: { buyer_id: bp?.id }, include: { items: true }, orderBy: { created_at: 'desc' } });
    return res.json(subs);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// PATCH /subscriptions/:id
router.patch('/:id', authenticate, requireRole('BUYER'), async (req, res) => {
  try {
    const sub = await prisma.subscriptionPlan.update({ where: { id: req.params.id }, data: req.body });
    return res.json(sub);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
