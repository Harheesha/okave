// Okave Demo Seed Script
// Run: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Okave demo data...');

  // 1. Create demo users
  const agentPw = await bcrypt.hash('agent123', 10);
  const buyerPw = await bcrypt.hash('buyer123', 10);
  const adminPw = await bcrypt.hash('admin123', 10);

  const agent = await prisma.user.upsert({
    where: { email: 'agent@okave.ng' },
    update: {},
    create: { name: 'Emeka Okafor', email: 'agent@okave.ng', phone: '08012345678', password_hash: agentPw, role: 'AGENT' },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@okave.ng' },
    update: {},
    create: { name: 'Okave Admin', email: 'admin@okave.ng', phone: '08099999999', password_hash: adminPw, role: 'ADMIN' },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer@okave.ng' },
    update: {},
    create: { name: 'Amina Suleiman', email: 'buyer@okave.ng', phone: '08087654321', password_hash: buyerPw, role: 'BUYER' },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: 'restaurant@okave.ng' },
    update: {},
    create: { name: 'Naija Kitchen', email: 'restaurant@okave.ng', phone: '08011112222', password_hash: buyerPw, role: 'BUYER' },
  });

  console.log('Users created:', [agent.name, admin.name, buyer1.name, buyer2.name]);

  // 2. Create buyer profiles
  await prisma.buyerProfile.upsert({
    where: { user_id: buyer1.id },
    update: {},
    create: { user_id: buyer1.id, buyer_type: 'HOUSEHOLD', address: '15 Maitama Close, Abuja' },
  });
  await prisma.buyerProfile.upsert({
    where: { user_id: buyer2.id },
    update: {},
    create: { user_id: buyer2.id, buyer_type: 'RESTAURANT', address: 'Wuse Zone 4, Abuja' },
  });

  // 3. Create a Co-op
  const coop = await prisma.coop.upsert({
    where: { id: 'coop-niger-state-001' },
    update: {},
    create: { id: 'coop-niger-state-001', name: 'Niger State Farmers Co-op', location: 'Minna, Niger State', contact_person_name: 'Alhaji Bello', contact_phone: '08033344455' },
  });

  // 4. Create demo farmers
  const farmer1 = await prisma.farmerProfile.upsert({
    where: { id: 'farmer-001' },
    update: {},
    create: {
      id: 'farmer-001', full_name: 'Chukwudi Nwosu', phone: '07012345678',
      state: 'Benue', lga: 'Makurdi', community: 'Wadata',
      preferred_contact_channel: 'SMS', main_crops: ['TOMATO', 'PEPPER'],
      registered_by_agent_id: agent.id, coop_id: coop.id,
    },
  });

  const farmer2 = await prisma.farmerProfile.upsert({
    where: { id: 'farmer-002' },
    update: {},
    create: {
      id: 'farmer-002', full_name: 'Halima Garba', phone: '07087654321',
      state: 'Kano', lga: 'Bunkure', community: 'Bunkure',
      preferred_contact_channel: 'SMS', main_crops: ['ONION', 'MAIZE'],
      registered_by_agent_id: agent.id,
    },
  });

  const farmer3 = await prisma.farmerProfile.upsert({
    where: { id: 'farmer-003' },
    update: {},
    create: {
      id: 'farmer-003', full_name: 'Taiwo Adeyemi', phone: '07033344566',
      state: 'Oyo', lga: 'Ibadan North', community: 'Bodija',
      preferred_contact_channel: 'SMS', main_crops: ['YAM', 'CASSAVA'],
      registered_by_agent_id: agent.id,
    },
  });

  console.log('Farmers created:', [farmer1.full_name, farmer2.full_name, farmer3.full_name]);

  // 5. Seed Nigerian market price snapshots
  const priceData = [
    // Tomato
    { crop_type: 'TOMATO', unit: 'basket', market_location: 'Abuja - Gwagwalada', min: 12000, max: 18000, avg: 15000 },
    { crop_type: 'TOMATO', unit: 'basket', market_location: 'Lagos - Mile 12', min: 14000, max: 22000, avg: 18000 },
    { crop_type: 'TOMATO', unit: 'basket', market_location: 'Kano - Dawanau', min: 10000, max: 16000, avg: 13000 },
    { crop_type: 'TOMATO', unit: 'crate', market_location: 'Abuja - Gwagwalada', min: 8000, max: 12000, avg: 10000 },
    // Pepper
    { crop_type: 'PEPPER', unit: 'basket', market_location: 'Lagos - Mile 12', min: 8000, max: 14000, avg: 11000 },
    { crop_type: 'PEPPER', unit: 'basket', market_location: 'Abuja - Gwagwalada', min: 9000, max: 15000, avg: 12000 },
    // Onion
    { crop_type: 'ONION', unit: 'bag', market_location: 'Kano - Dawanau', min: 15000, max: 25000, avg: 20000 },
    { crop_type: 'ONION', unit: 'bag', market_location: 'Lagos - Mile 12', min: 18000, max: 28000, avg: 23000 },
    { crop_type: 'ONION', unit: 'bag', market_location: 'Abuja - Wuse Market', min: 17000, max: 27000, avg: 22000 },
    // Maize
    { crop_type: 'MAIZE', unit: 'bag', market_location: 'Abuja - Gwagwalada', min: 12000, max: 18000, avg: 15000 },
    { crop_type: 'MAIZE', unit: 'bag', market_location: 'Lagos - Mushin', min: 13000, max: 20000, avg: 16500 },
    { crop_type: 'MAIZE', unit: 'kg', market_location: 'Abuja - Gwagwalada', min: 250, max: 380, avg: 315 },
    // Yam
    { crop_type: 'YAM', unit: 'tuber', market_location: 'Abuja - Wuse Market', min: 600, max: 1200, avg: 900 },
    { crop_type: 'YAM', unit: 'tuber', market_location: 'Lagos - Mile 12', min: 700, max: 1400, avg: 1050 },
    { crop_type: 'YAM', unit: 'bag', market_location: 'Abuja - Wuse Market', min: 25000, max: 40000, avg: 32000 },
    // Cassava
    { crop_type: 'CASSAVA', unit: 'bag', market_location: 'Lagos - Mushin', min: 6000, max: 10000, avg: 8000 },
    { crop_type: 'CASSAVA', unit: 'kg', market_location: 'Abuja - Gwagwalada', min: 100, max: 180, avg: 140 },
    // Plantain
    { crop_type: 'PLANTAIN', unit: 'bunch', market_location: 'Lagos - Mile 12', min: 1500, max: 3000, avg: 2250 },
    { crop_type: 'PLANTAIN', unit: 'bunch', market_location: 'Abuja - Wuse Market', min: 1800, max: 3500, avg: 2650 },
    // Groundnut
    { crop_type: 'GROUNDNUT', unit: 'bag', market_location: 'Kano - Dawanau', min: 30000, max: 50000, avg: 40000 },
    { crop_type: 'GROUNDNUT', unit: 'kg', market_location: 'Abuja - Gwagwalada', min: 600, max: 900, avg: 750 },
    // Cucumber
    { crop_type: 'CUCUMBER', unit: 'crate', market_location: 'Lagos - Mile 12', min: 4000, max: 8000, avg: 6000 },
    { crop_type: 'CUCUMBER', unit: 'crate', market_location: 'Abuja - Wuse Market', min: 5000, max: 9000, avg: 7000 },
  ];

  for (const p of priceData) {
    await prisma.marketPriceSnapshot.create({
      data: {
        crop_type: p.crop_type, unit: p.unit, market_location: p.market_location,
        min_price_per_unit: p.min, max_price_per_unit: p.max, average_price_per_unit: p.avg,
        source: 'seed_data', recorded_at: new Date(),
      },
    });
  }
  console.log(`Market price snapshots seeded: ${priceData.length} entries`);

  // 6. Create demo listings
  const listing1 = await prisma.produceListing.create({
    data: {
      farmer_id: farmer1.id, agent_id: agent.id,
      crop_type: 'TOMATO', variety: 'Roma', quantity: 30, unit: 'basket',
      location: 'Makurdi, Benue State',
      harvest_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      base_price_per_unit: 15000, suggested_min_price_per_unit: 12000, suggested_max_price_per_unit: 18000,
      final_price_per_unit: 15000,
      status: 'LIVE', quality_grade: 'A', quality_verified_by_agent: true,
      quality_notes: 'Fresh, ripe tomatoes. Harvested yesterday.',
    },
  });

  const listing2 = await prisma.produceListing.create({
    data: {
      farmer_id: farmer2.id, agent_id: agent.id,
      crop_type: 'ONION', variety: 'Red Globe', quantity: 50, unit: 'bag',
      location: 'Bunkure, Kano State',
      harvest_date: new Date(),
      base_price_per_unit: 20000, suggested_min_price_per_unit: 15000, suggested_max_price_per_unit: 25000,
      final_price_per_unit: 20000,
      status: 'LIVE', quality_grade: 'B', quality_verified_by_agent: true,
      quality_notes: 'Dry onions, well cured, good shelf life.',
    },
  });

  const listing3 = await prisma.produceListing.create({
    data: {
      farmer_id: farmer3.id, agent_id: agent.id,
      crop_type: 'YAM', variety: 'Puna Yam', quantity: 200, unit: 'tuber',
      location: 'Ibadan, Oyo State',
      harvest_date: new Date(),
      base_price_per_unit: 900, suggested_min_price_per_unit: 600, suggested_max_price_per_unit: 1200,
      final_price_per_unit: 900,
      status: 'LIVE', quality_grade: 'A', quality_verified_by_agent: true,
      quality_notes: 'Medium to large tubers. Fresh from farm.',
    },
  });

  console.log('Listings created:', [listing1.id.slice(0,8), listing2.id.slice(0,8), listing3.id.slice(0,8)]);

  console.log('\n=== DEMO CREDENTIALS ===');
  console.log('Agent: agent@okave.ng / agent123');
  console.log('Buyer (Household): buyer@okave.ng / buyer123');
  console.log('Buyer (Restaurant): restaurant@okave.ng / buyer123');
  console.log('Admin: admin@okave.ng / admin123');
  console.log('========================\n');
  console.log('Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
