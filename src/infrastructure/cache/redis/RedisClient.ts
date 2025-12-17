import Redis from 'ioredis';
import { env } from '@/config/env';

let redisInstance: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    redisInstance.on('error', (err) => console.error('Redis Client Error', err));
    redisInstance.on('connect', () => console.log('Redis Connected'));
  }
  return redisInstance;
};