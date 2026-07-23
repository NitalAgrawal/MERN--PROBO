/**
 * Integration Tests: Story API
 * Tests: CRUD on /api/v1/stories
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
let authCookies;

const testUser = {
  name: 'Story Tester',
  email: `story_${Date.now()}@storynest.test`,
  password: 'Password123!'
};

const testStory = {
  title: 'Grandma Rose\'s Story',
  subject: 'Rose',
  relationship: 'Grandmother'
};

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    app = require('../server');
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);
    authCookies = res.headers['set-cookie'];
  } catch {
    console.warn('⚠️  MongoDB not available - skipping story integration tests');
  }
}, 15000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});

describe('Story CRUD', () => {
  let storyId;

  test('POST /api/v1/stories — creates a story', async () => {
    if (!app) return;
    const res = await request(app)
      .post('/api/v1/stories')
      .set('Cookie', authCookies)
      .send(testStory)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.story.title).toBe(testStory.title);
    storyId = res.body.data.story._id;
  });

  test('GET /api/v1/stories — lists user stories', async () => {
    if (!app || !storyId) return;
    const res = await request(app)
      .get('/api/v1/stories')
      .set('Cookie', authCookies)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.stories)).toBe(true);
    expect(res.body.data.stories.length).toBeGreaterThan(0);
  });

  test('GET /api/v1/stories/:id — gets a single story', async () => {
    if (!app || !storyId) return;
    const res = await request(app)
      .get(`/api/v1/stories/${storyId}`)
      .set('Cookie', authCookies)
      .expect(200);

    expect(res.body.data.story._id).toBe(storyId);
  });

  test('PATCH /api/v1/stories/:id — updates a story', async () => {
    if (!app || !storyId) return;
    const res = await request(app)
      .patch(`/api/v1/stories/${storyId}`)
      .set('Cookie', authCookies)
      .send({ title: 'Updated Title' })
      .expect(200);

    expect(res.body.data.story.title).toBe('Updated Title');
  });

  test('GET /api/v1/stories/:id — returns 404 for invalid ID', async () => {
    if (!app) return;
    await request(app)
      .get('/api/v1/stories/000000000000000000000000')
      .set('Cookie', authCookies)
      .expect(404);
  });

  test('GET /api/v1/stories — returns 401 without auth', async () => {
    if (!app) return;
    await request(app)
      .get('/api/v1/stories')
      .expect(401);
  });

  test('DELETE /api/v1/stories/:id — deletes the story', async () => {
    if (!app || !storyId) return;
    const res = await request(app)
      .delete(`/api/v1/stories/${storyId}`)
      .set('Cookie', authCookies)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
