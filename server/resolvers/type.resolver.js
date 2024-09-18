const { Type } = require('../models');
const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const typeResolver = {
    Query: {
        types: async (_, {isActive}) => {
            const cacheKey = 'types:active';
            const cacheKeyAll = 'types:all';
            try {
                if(isActive) {
                    let data = await getRedisCached(cacheKey);
                    if(!data) {
                        data = await Type.findAll({
                            where: {
                                isActive: true
                            }
                        });
                        await addRedisCached(cacheKey, data);
                    }
                    return data;
                } else {
                    let data = await getRedisCached(cacheKeyAll);
                    if(!data) {
                        data = await Type.findAll();
                        await addRedisCached(cacheKeyAll, data);
                    }
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