const dotenv = require('dotenv');
const Redis = require('redis');

dotenv.config();

const DOMAIN = 'convo.akoplus.co.nz';
const NAMESPACE = `${DOMAIN}:`;
const isProduction = process.env.NODE_ENV === 'production';

const createRedisClient = () => {
    if (!process.env.REDIS_URL && isProduction) {
        console.error('REDIS_URL is not set in production environment');
        process.exit(1);
    }

    const client = Redis.createClient({
        url: isProduction 
            ? process.env.REDIS_URL 
            : 'redis://localhost:6379',
        socket: {
            connectTimeout: 10000, // 10 seconds
            reconnectStrategy: (attempts) => Math.min(attempts * 100, 3000), // Max 3 seconds between retries
        }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    client.on('connect', () => console.log('Redis Client Connected'));
    client.on('reconnecting', () => console.log('Redis Client Reconnecting'));

    return client;
};

const redisClient = createRedisClient();

(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        if (isProduction) {
            process.exit(1);
        }
    }
})();

const getRedisCached = async (cacheKey) => {
    try {
        const namespacedKey = NAMESPACE + cacheKey;
        const cachedData = await redisClient.get(namespacedKey);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.error('Error in getRedisCached:', error);
        return null;
    }
};

const addRedisCached = async (cacheKey, data, lifetime = process.env.CACHE_LIFE_LONG) => {
    try {
        const namespacedKey = NAMESPACE + cacheKey;
        await redisClient.set(namespacedKey, JSON.stringify(data), {
            EX: parseInt(lifetime, 10) || 3600 // Default to 1 hour if parsing fails
        });
        return true;
    } catch (error) {
        console.error('Error in addRedisCached:', error);
        return false;
    }
};

const clearCache = async (pattern) => {
    try {
        const namespacedPattern = NAMESPACE + pattern;
        const keys = await redisClient.keys(namespacedPattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        return true;
    } catch (error) {
        console.error('Error in clearCache:', error);
        return false;
    }
};

const clearAllCache = async () => {
    try {
        const keys = await redisClient.keys(NAMESPACE + '*');
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        return true;
    } catch (error) {
        console.error('Error in clearAllCache:', error);
        return false;
    }
};

module.exports = { getRedisCached, addRedisCached, clearCache, clearAllCache };