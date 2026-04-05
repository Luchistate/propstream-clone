import IORedis from 'ioredis';
import { env } from './env.js';

// ioredis ESM default export is the class itself
const RedisClass = IORedis.default || IORedis;

export const redis = new (RedisClass as any)(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});
