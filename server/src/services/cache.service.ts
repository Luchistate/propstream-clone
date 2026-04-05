import { redis } from '../config/redis.js';

// TTL constants in seconds
export const TTL = {
  PROPERTY_DETAIL: 86400,     // 24 hours
  AVM: 3600,                   // 1 hour
  ASSESSMENT: 604800,          // 7 days
  SEARCH_RESULTS: 1800,        // 30 min
  OWNER: 86400,                // 24 hours
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
