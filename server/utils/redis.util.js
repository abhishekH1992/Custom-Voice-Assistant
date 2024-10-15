const { Redis } = require('@upstash/redis');

const DOMAIN = 'akoplus.vercel.app';
const NAMESPACE = `${DOMAIN}:`;
const isProduction = process.env.NODE_ENV === 'production';

let redisClient = null;

const createRedisClient = () => {
    if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
        console.error('UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN is not set');
        return null;
    }
    if(isProduction) {
        return new Redis({
            url: process.env.UPSTASH_REDIS_URL,
            token: process.env.UPSTASH_REDIS_TOKEN,
        });
    } else {
        const client = Redis.createClient({
            url: 'redis://localhost:6379',
            socket: {
                connectTimeout: 10000, // 10 seconds
                reconnectStrategy: (attempts) => Math.min(attempts * 100, 3000), // Max 3 seconds between retries
            }
        });
    }
};

const getRedisClient = () => {
    if (!redisClient) {
        redisClient = createRedisClient();
    }
    return redisClient;
};

const getRedisCached = async (cacheKey) => {
    const client = getRedisClient();
    if (!client) return null;

    try {
        const namespacedKey = NAMESPACE + cacheKey;
        const cachedData = await client.get(namespacedKey);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.error('Error in getRedisCached:', error);
        return null;
    }
};

const addRedisCached = async (cacheKey, data, lifetime = process.env.CACHE_LIFE_LONG) => {
    const client = getRedisClient();
    if (!client) return false;

    try {
        const namespacedKey = NAMESPACE + cacheKey;
        await client.set(namespacedKey, JSON.stringify(data), {
            ex: parseInt(lifetime, 10) || 3600 // Default to 1 hour if parsing fails
        });
        return true;
    } catch (error) {
        console.error('Error in addRedisCached:', error);
        return false;
    }
};

const clearCache = async (pattern) => {
    const client = getRedisClient();
    if (!client) return false;

    try {
        const namespacedPattern = NAMESPACE + pattern;
        const keys = await client.keys(namespacedPattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
        return true;
    } catch (error) {
        console.error('Error in clearCache:', error);
        return false;
    }
};

const clearAllCache = async () => {
    const client = getRedisClient();
    if (!client) return false;

    try {
        const keys = await client.keys(NAMESPACE + '*');
        if (keys.length > 0) {
            await client.del(keys);
        }
        return true;
    } catch (error) {
        console.error('Error in clearAllCache:', error);
        return false;
    }
};

module.exports = { getRedisCached, addRedisCached, clearCache, clearAllCache, getRedisClient };