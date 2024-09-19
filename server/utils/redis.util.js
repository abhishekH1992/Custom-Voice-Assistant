const dotenv = require('dotenv');
const Redis = require('redis');

dotenv.config();

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

(async () => {
    await redisClient.connect();
})();

const getRedisCached = async(cacheKey) => {
    try {
        const cachedTemplate = await redisClient.get(cacheKey);
        if (cachedTemplate) {
            return JSON.parse(cachedTemplate);
        }
        return false
    } catch (error) {
        console.error('Error in getTemplateWithCache:', error);
    }
}

const addRedisCached = async(cacheKey, data, lifetime=process.env.CACHE_LIFE_LONG) => {
    try {
        await redisClient.set(cacheKey, JSON.stringify(data), {
            EX: lifetime
        });
        return true;
    } catch (error) {
        console.error('Error in addRedisCached:', error);
    }
}

module.exports = { getRedisCached, addRedisCached };