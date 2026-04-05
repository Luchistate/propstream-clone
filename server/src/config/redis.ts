import { env } from './env.js';

let redis: any = null;

async function getRedis() {
  if (redis) return redis;
  if (!env.REDIS_URL) return null;

  try {
    const IORedis = (await import('ioredis')).default;
    const RedisClass = (IORedis as any).default || IORedis;
    redis = new (RedisClass as any)(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('error', (err: Error) => {
      console.error('Redis connection error:', err.message);
      redis = null; // Reset so we don't keep using broken connection
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
    });

    return redis;
  } catch {
    console.log('Redis not available, caching disabled');
    return null;
  }
}

export { getRedis, redis };
