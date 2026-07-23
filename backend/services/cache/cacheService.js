const logger = require('../logger/logger');

let Redis;
try {
  Redis = require('ioredis');
} catch (err) {
  Redis = null;
}

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.isRedisConnected = false;

    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    if (redisUrl && Redis) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          connectTimeout: 3000,
        });

        this.redisClient.on('connect', () => {
          this.isRedisConnected = true;
          logger.info('✅ Redis cache connected');
        });

        this.redisClient.on('error', (err) => {
          this.isRedisConnected = false;
          logger.warn({ err: err.message }, 'Redis connection error, using in-memory fallback');
        });

        this.redisClient.connect().catch(() => {
          this.isRedisConnected = false;
        });
      } catch (err) {
        logger.warn({ err: err.message }, 'Failed to initialize Redis client, using in-memory cache');
      }
    }
  }

  /**
   * Safety guard to prevent caching authenticated user objects
   */
  _validateKey(key) {
    if (typeof key === 'string' && (key.toLowerCase().includes('user') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('token'))) {
      logger.warn(`Cache operation blocked for restricted security key: "${key}"`);
      return false;
    }
    return true;
  }

  async get(key) {
    if (!this._validateKey(key)) return null;

    if (this.isRedisConnected && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        logger.warn({ key, err: err.message }, 'Redis GET error, checking memory cache');
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this._validateKey(key)) return false;

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return true;
      } catch (err) {
        logger.warn({ key, err: err.message }, 'Redis SET error, falling back to memory cache');
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiresAt });
    return true;
  }

  async del(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        logger.warn({ key, err: err.message }, 'Redis DEL error');
      }
    }
    this.memoryCache.delete(key);
  }

  async flush() {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err) {
        logger.warn({ err: err.message }, 'Redis FLUSH error');
      }
    }
    this.memoryCache.clear();
  }
}

module.exports = new CacheService();
