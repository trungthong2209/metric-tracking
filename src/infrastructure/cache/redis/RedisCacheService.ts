import { Redis } from 'ioredis';
import { ICacheService } from "@/application/interfaces/ICacheService";

export class RedisCacheService implements ICacheService {
  constructor(private redis: Redis) {}

  private getUserKey(userId: string): string {
    return `user:${userId}:charts`;
  }

  async get<T>(userId: string, field: string): Promise<T | null> {
    const data = await this.redis.hget(this.getUserKey(userId), field);
    return data ? JSON.parse(data) : null;
  }

  async set(userId: string, field: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    const key = this.getUserKey(userId);
    const pipeline = this.redis.pipeline();
    pipeline.hset(key, field, JSON.stringify(data));
    pipeline.expire(key, ttlSeconds);
    await pipeline.exec();
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.redis.del(this.getUserKey(userId));
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(`lock:${key}`, "LOCKED", "EX", ttlSeconds, "NX");
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.redis.del(`lock:${key}`);
  }

  async wrap<T>(
    userId: string, 
    field: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(userId, field);
    if (cached) return cached;

    console.log(`Cache Miss for ${userId}:${field} - Fetching...`);
    const data = await fetcher();
    await this.set(userId, field, data, ttlSeconds);
    return data;
  }
}