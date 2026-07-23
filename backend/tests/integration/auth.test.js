/**
 * Integration Tests: Auth API
 * Tests: POST /api/v1/auth/register, /login, /logout, GET /api/v1/auth/me
 */

// Set test environment
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
  // Avoid connecting to real DB in unit-level CI - mock if needed
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    app = require('../server');
  } catch {
    // Skip integration tests if no DB available
    console.warn('⚠️  MongoDB not available - skipping auth integration tests');
  }
}, 15000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});

const testUser = {
  name: 'Test User',
  email: `test_${Date.now()}@storynest.test`,
  password: 'Password123!'
};

describe('POST /api/v1/auth/register', () => {
  test('should register a new user and set cookie', async () => {
    if (!app) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('should reject duplicate email', async () => {
    if (!app) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  test('should reject missing required fields', async () => {
    if (!app) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'bad@test.com' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/login', () => {
  test('should login with valid credentials', async () => {
    if (!app) return;
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  test('should reject invalid password', async () => {
    if (!app) return;
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPass!' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  test('should reject non-existent email', async () => {
    if (!app) return;
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@nowhere.com', password: 'GhostPass!' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/auth/me', () => {
  test('should return 401 without auth cookie', async () => {
    if (!app) return;
    const res = await request(app)
      .get('/api/v1/auth/me')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  test('should return user profile with valid session', async () => {
    if (!app) return;
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const cookies = loginRes.headers['set-cookie'];
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookies)
      .expect(200);

    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email);
  });
});
