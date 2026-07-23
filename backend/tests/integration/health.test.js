/**
 * Integration Tests: Health API
 * Tests: GET /api/v1/health, GET /api/v1/ready
 */

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/storynest_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_32chars_min_abc';
process.env.AI_PROVIDER = 'openrouter';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';

const request = require('supertest');
const mongoose = require('mongoose');

let app;

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    app = require('../server');
  } catch {
    console.warn('⚠️  MongoDB not available - skipping health integration tests');
  }
}, 15000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});

describe('GET /api/v1/health', () => {
  test('returns 200 with health status fields', async () => {
    if (!app) return;
    const res = await request(app).get('/api/v1/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.mongoDB).toBeDefined();
    expect(res.body.data.nodeVersion).toBeDefined();
    expect(res.body.data.serverUptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.body.data.memoryUsage).toBeDefined();
    expect(res.body.data.performanceMetrics).toBeDefined();
  });

  test('response includes x-request-id header', async () => {
    if (!app) return;
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  test('passes through custom x-request-id header', async () => {
    if (!app) return;
    const customId = '00000000-0000-0000-0000-000000000042';
    const res = await request(app)
      .get('/api/v1/health')
      .set('x-request-id', customId);
    expect(res.headers['x-request-id']).toBe(customId);
  });
});

describe('GET /api/v1/ready', () => {
  test('returns 200 when DB is connected', async () => {
    if (!app) return;
    const res = await request(app).get('/api/v1/ready').expect(200);
    expect(res.body.ready).toBe(true);
  });
});
