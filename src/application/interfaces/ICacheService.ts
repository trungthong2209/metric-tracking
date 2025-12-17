export interface ICacheService {
    get<T>(userId: string, field: string): Promise<T | null>;
    set(userId: string, field: string, data: any, ttlSeconds?: number): Promise<void>;
    invalidateUser(userId: string): Promise<void>;
    acquireLock(key: string, ttlSeconds: number): Promise<boolean>;
    releaseLock(key: string): Promise<void>;
    wrap<T>(
        userId: string, 
        field: string, 
        fetcher: () => Promise<T>, 
        ttlSeconds?: number
    ): Promise<T>;
}
