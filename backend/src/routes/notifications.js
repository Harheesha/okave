const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /notifications - admin/agent view of notification queue
router.get('/', authenticate, requireRole('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /notifications - internal: queue a notification
router.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { user_id, farmer_id, channel, message } = req.body;
    const notif = await prisma.notification.create({
      data: { user_id, farmer_id, channel: channel || 'SMS', message, status: 'QUEUED' },
    });
    // Mock send
    console.log(`[NOTIFICATION MOCK] Channel: ${notif.channel} | ${notif.message}`);
    await prisma.notification.update({ where: { id: notif.id }, data: { status: 'SENT', sent_at: new Date() } });
    return res.status(201).json({ ...notif, status: 'SENT' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
