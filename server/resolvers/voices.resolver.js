const { Voice } = require('../models');
// const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const voicesResolver = {
    Query: {
        voices: async () => {
            const cacheKey = `voices:all`;
            try {
                // let data = await getRedisCached(cacheKey);
                // if(!data) {
                    let data = await Voice.findAll();
                    // await addRedisCached(cacheKeyActive, data);
                // }
                return data;
            } catch (error) {
                console.error('Error fetching voices:', error);
                throw new Error('Failed to fetch voices');
            }
        },
    },
};

module.exports = voicesResolver;