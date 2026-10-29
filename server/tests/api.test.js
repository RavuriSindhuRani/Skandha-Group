import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { ensureDefaultAdmin } from '../src/controllers/authController.js';

let authToken = '';

before(async () => {
  await connectDB();
  await ensureDefaultAdmin();
});

after(async () => {
  await mongoose.disconnect();
});

test('1. Health Check & Public Endpoints', async (t) => {
  await t.test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  await t.test('GET /api/settings returns public settings without leaking raw private whatsapp number', async () => {
    const res = await request(app).get('/api/settings');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.settings.companyName, 'Skandha Group');
    assert.equal(res.body.settings.projectName, "Kadthal Venture");
    assert.equal(res.body.settings.dtcpNumber, 'TLP NO. 87/2024/H');
    // Ensure raw phone number is NOT exposed in public settings
    assert.equal(res.body.settings.whatsappNumber, undefined);
  });

  await t.test('GET /api/plots returns layout plots', async () => {
    const res = await request(app).get('/api/plots?all=true');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.plots.length >= 90);
  });

  await t.test('GET /api/plots/stats returns inventory counts', async () => {
    const res = await request(app).get('/api/plots/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.stats.total >= 90);
    assert.ok(res.body.stats.available > 0);
  });

  await t.test('GET /api/plots/1 returns single plot details', async () => {
    const res = await request(app).get('/api/plots/1');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.plot.plotNumber, 1);
  });
});

test('2. Lead Submission & Anti-Spam Validation', async (t) => {
  await t.test('POST /api/leads succeeds with valid lead details and generates WhatsApp link', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({
        name: 'Venkata Rao',
        email: 'venkata.test@example.com',
        phone: '9848022338',
        plotNumber: 24,
        preferredContactMethod: 'whatsapp',
        message: 'Interested in North-facing plot',
        consent: true
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.whatsappUrl);
    assert.ok(res.body.whatsappUrl.startsWith('https://wa.me/'));
    assert.ok(res.body.whatsappUrl.includes('Plot%20%2324') || res.body.whatsappUrl.includes('Plot'));
  });

  await t.test('POST /api/leads blocks honeypot spam bot submissions', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({
        name: 'Spam Bot',
        email: 'bot@spam.com',
        consent: true,
        hp_website: 'http://spam-link.ru' // Honeypot field filled
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Bot submission detected.');
  });

  await t.test('POST /api/leads rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({
        name: 'John Doe',
        email: 'not-an-email',
        consent: true
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /valid email/i);
  });
});

test('3. Auth & Public vs Private API Access Controls', async (t) => {
  await t.test('Protected route GET /api/admin/settings rejects unauthenticated requests (401)', async () => {
    const res = await request(app).get('/api/admin/settings');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/auth/login rejects wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin',
        password: 'WrongPassword123!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/auth/login succeeds with valid seed credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin',
        password: 'admin@123'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    authToken = res.body.token;
  });

  await t.test('Protected route GET /api/admin/settings succeeds with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.settings.whatsappNumber); // Admin view includes configured number
  });
});

test('4. Plot Status & Inventory Management Operations', async (t) => {
  await t.test('PATCH /api/admin/plots/10/status updates plot status with audit', async () => {
    const res = await request(app)
      .patch('/api/admin/plots/10/status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'booked' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.plot.status, 'booked');
  });

  await t.test('PATCH /api/admin/plots/10/status allows setting status to blocked distinctly', async () => {
    const res = await request(app)
      .patch('/api/admin/plots/10/status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'blocked' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.plot.status, 'blocked');
  });

  await t.test('POST /api/admin/plots/10/book books plot for customer', async () => {
    const res = await request(app)
      .post('/api/admin/plots/10/book')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerName: 'K. S. Sharma',
        customerPhone: '+91 9440156789',
        customerEmail: 'kssharma@example.com',
        bookingAmount: 100000,
        bookingDate: '2026-10-26',
        paymentStatus: 'token_paid',
        notes: 'Token received via RTGS.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.plot.status, 'booked');
    assert.equal(res.body.plot.customerName, 'K. S. Sharma');
    assert.equal(res.body.plot.customerPhone, '+91 9440156789');
  });

  await t.test('PATCH /api/admin/plots/10/status rejects invalid status enum', async () => {
    const res = await request(app)
      .patch('/api/admin/plots/10/status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'invalid_status_xyz' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

test('5. Privacy-Conscious Analytics Event Ingestion', async (t) => {
  await t.test('POST /api/analytics/events allows valid allowlisted event', async () => {
    const res = await request(app)
      .post('/api/analytics/events')
      .send({
        eventType: 'view_mode_toggled',
        plotNumber: 15,
        metadata: { viewMode: '3D' }
      });

    assert.ok(res.status === 200 || res.status === 201);
    assert.equal(res.body.success, true);
  });

  await t.test('POST /api/analytics/events rejects unallowlisted event', async () => {
    const res = await request(app)
      .post('/api/analytics/events')
      .send({
        eventType: 'unauthorized_tracking_event',
        metadata: {}
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /api/admin/analytics returns analytics summary', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.summary);
  });

  await t.test('GET /api/admin/analytics/export exports visits CSV', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /text\/csv/);
  });
});
