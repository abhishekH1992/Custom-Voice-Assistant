const Redis = require('ioredis');

const DOMAIN = 'akoplus.vercel.app';
const NAMESPACE = `${DOMAIN}:`;
const isProduction = process.env.NODE_ENV === 'production';

let redisClient = null;

const createRedisClient = async () => {
    if (isProduction) {
        const client = new Redis(process.env.HEROKU_REDIS_GRAY);
        client.on('error', (err) => console.error('Redis Client Error', err));
        client.on('connect', () => console.log('Redis Client Connected'));
        client.on('reconnecting', () => console.log('Redis Client Reconnecting'));

        return client;
    } else {
        const client = new Redis({
            host: 'localhost',
            port: 6379,
            connectTimeout: 10000, // 10 seconds
            retryStrategy: (times) => Math.min(times * 100, 3000), // Max 3 seconds between retries
        });

        client.on('error', (err) => console.error('Redis Client Error', err));
        client.on('connect', () => console.log('Redis Client Connected'));
        client.on('reconnecting', () => console.log('Redis Client Reconnecting'));

        return client;
    }
};

const getRedisClient = async () => {
    if (!redisClient) {
        redisClient = await createRedisClient();
    }
    return redisClient;
};

const getRedisCached = async (cacheKey) => {
    const client = await getRedisClient();
    if (!client) return null;

    try {
        const namespacedKey = NAMESPACE + cacheKey;
        const cachedData = await client.get(namespacedKey);
        console.log('cachedData', cachedData);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.error('Error in getRedisCached:', error);
        return null;
    }
};

const addRedisCached = async (cacheKey, data, lifetime = process.env.CACHE_LIFE_LONG) => {
    const client = await getRedisClient();
    if (!client) return false;

    try {
        const namespacedKey = NAMESPACE + cacheKey;
        if (isProduction) {
            await client.set(namespacedKey, JSON.stringify(data), {
                ex: parseInt(lifetime, 10) || 3600 // Default to 1 hour if parsing fails
            });
        } else {
            await client.set(namespacedKey, JSON.stringify(data), 'EX', parseInt(lifetime, 10) || 3600);
        }
        return true;
    } catch (error) {
        console.error('Error in addRedisCached:', error);
        return false;
    }
};

const clearCache = async (pattern) => {
    const client = await getRedisClient();
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
    const client = await getRedisClient();
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