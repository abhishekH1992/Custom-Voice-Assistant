const { Type } = require('../models');
// const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const typeResolver = {
    Query: {
        types: async (_, {isActive}) => {
            const cacheKeyActive = `types:active`;
            const cacheKey = `types:all`;
            try {
                if(isActive) {
                    // let data = await getRedisCached(cacheKeyActive);
                    // if(!data) {
                        let data = await Type.findAll({
                            where: {
                                isActive: true
                            }
                        });
                    //     await addRedisCached(cacheKeyActive, data);
                    // }
                    return data;
                } else {
                    // let data = await getRedisCached(cacheKey);
                    // if(!data) {
                        let data = await Type.findAll();
                        // await addRedisCached(cacheKey, data);
                    // }
                    return data;
                }
            } catch (error) {
                console.error('Error fetching types:', error);
                throw new Error('Failed to fetch types');
            }
        },
    },
};

module.exports = typeResolver;