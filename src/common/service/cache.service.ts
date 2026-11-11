import { createClient, RedisClientType } from 'redis';
import { REDIS_URI } from '../../config';

export class CacheService {
    private readonly client: RedisClientType;
    constructor() {
        this.client = createClient({ url: REDIS_URI })
        this.connect()
    }
    private async connect() {
        try {
            await this.client.connect()
            console.log(`Cache database connected successfully....`);
        } catch (error) {
            console.log(`Fail to connect on Cache database.... Error::${error}`);
        }
    }

    async set({ key, value, ttl = undefined }: { key: string, value: string, ttl?: number }) {
        if (typeof value == "object") value = JSON.stringify(value);
        return await this.client.set(key, value, { ...(ttl ? { EX: ttl } : {}) })
    }
    async get({ key }: { key: string }) {
        let value = await this.client.get(key)
        try {
            return JSON.parse(value as string)
        } catch {
            return value
        }
    }
    async exist({ key }: { key: string }) {
        return await this.client.exists(key)
    }
    async update({ key, value, ttl = undefined }: { key: string, value: string, ttl?: number }) {
        if (!await this.exist({ key })) return false;
        return await this.set({ key, value, ...(ttl === undefined ? {} : { ttl }) })
    }
    async del({ key }: { key: string | string[] }) {
        return await this.client.del(key)
    }
    async keys({ prefix }: { prefix: string }) {
        return await this.client.keys(`${prefix}*`)
    }
    async ttl({ key }: { key: string }) {
        return await this.client.ttl(key)
    }
    async incrBy({ key, value = 1 }: { key: string, value?: number }) {
        return await this.client.incrBy(key, value)
    }
    async expire({ key, ttl }: { key: string, ttl: number }) {
        return await this.client.expire(key, ttl)
    }
}

export const cacheService = new CacheService()