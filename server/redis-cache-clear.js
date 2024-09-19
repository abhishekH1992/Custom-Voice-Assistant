const Redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

async function clearEntireCache() {
    try {
        await redisClient.flushAll();
        console.log('Entire Redis cache cleared successfully');
    } catch (error) {
        console.error('Error clearing entire Redis cache:', error);
    }
}

async function clearSpecificKey(key) {
    try {
        const result = await redisClient.del(key);
        if (result === 1) {
            console.log(`Key '${key}' cleared from Redis cache successfully`);
        } else {
            console.log(`Key '${key}' not found in Redis cache`);
        }
    } catch (error) {
        console.error(`Error clearing key '${key}' from Redis cache:`, error);
    }
}

async function main() {
    await redisClient.connect();

    const args = process.argv.slice(2);
    const command = args[0];
    const key = args[1];

    if (command === 'all') {
        await clearEntireCache();
    } else if (command === 'key' && key) {
        await clearSpecificKey(key);
    } else {
        console.log('Usage:');
        console.log('  To clear entire cache: node clear-cache.js all');
        console.log('  To clear specific key: node clear-cache.js key <key-name>');
    }

    await redisClient.quit();
}

main().catch(console.error);