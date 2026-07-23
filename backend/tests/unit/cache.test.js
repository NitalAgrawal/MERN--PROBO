/**
 * Unit Tests: CacheService
 */
const cacheService = require('../../services/cache/cacheService');

describe('CacheService (in-memory)', () => {
  beforeEach(async () => {
    await cacheService.flush();
  });

  test('set and get a value with TTL', async () => {
    await cacheService.set('story_meta_abc', { title: 'Test Story' }, 60);
    const result = await cacheService.get('story_meta_abc');
    expect(result).toEqual({ title: 'Test Story' });
  });

  test('returns null for non-existent key', async () => {
    const result = await cacheService.get('nonexistent_key_xyz');
    expect(result).toBeNull();
  });

  test('del removes a key', async () => {
    await cacheService.set('story_meta_del', { x: 1 }, 60);
    await cacheService.del('story_meta_del');
    const result = await cacheService.get('story_meta_del');
    expect(result).toBeNull();
  });

  test('flush clears all keys', async () => {
    await cacheService.set('story_meta_1', { a: 1 }, 60);
    await cacheService.set('story_meta_2', { b: 2 }, 60);
    await cacheService.flush();
    expect(await cacheService.get('story_meta_1')).toBeNull();
    expect(await cacheService.get('story_meta_2')).toBeNull();
  });

  test('blocks caching of user/auth keys', async () => {
    const result = await cacheService.set('user_auth_token', { secret: 'abc' }, 60);
    expect(result).toBe(false);
    const retrieved = await cacheService.get('user_auth_token');
    expect(retrieved).toBeNull();
  });

  test('respects TTL expiry', async () => {
    await cacheService.set('expiring_story', { data: 1 }, 0.001); // 1ms TTL
    await new Promise((r) => setTimeout(r, 20)); // wait 20ms
    const result = await cacheService.get('expiring_story');
    expect(result).toBeNull();
  });
});
