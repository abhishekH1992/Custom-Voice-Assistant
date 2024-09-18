const { Template } = require('../models');
const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const templatesResolver = {
    Query: {
        templates: async(_, {isActive}) => {
            const cacheKey = `allTemplate:active`;
            const cacheKeyAll = `allTemplate:all`;
            try {
                if(isActive) {
                    let data = await getRedisCached(cacheKey);
                    if(!data) {
                        data = await Template.findAll({
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
                        data = await Template.findAll();
                        await addRedisCached(cacheKeyAll, template);
                    }
                    return data;
                }
            } catch (error) {
                console.error('Error fetching template:', error);
                throw new Error('Failed to fetch template');
            }
        },
        templateBySlug: async(_, {slug}) => {
            const cacheKey = `templateBySlug:${slug}`;
            try {
                let data = await getRedisCached(cacheKey);
                if(!data) {
                    data = await Template.findOne({
                        where: {
                            slug: slug,
                            isActive: true,
                        }
                    });
                    await addRedisCached(cacheKey, data);
                }
                return data;
            } catch (error) {
                console.error('Error fetching template by id:', error);
                throw new Error('Failed to fetch template by id');
            }
        }
    },
};

module.exports = templatesResolver;