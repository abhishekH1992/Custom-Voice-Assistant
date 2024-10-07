const { Template } = require('../models');
// const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const templatesResolver = {
    Query: {
        templates: async(_, {isActive}) => {
            const cacheKeyActive = `allTemplates:active`;
            const cacheKey = `allTemplates:all`;
            try {
                if(isActive) {
                    // let data = await getRedisCached(cacheKeyActive);
                    // if(!data) {
                        let data = await Template.findAll({
                            where: {
                                isActive: true
                            }
                        });
                        // await addRedisCached(cacheKeyActive, data);
                    // }
                    return data;
                } else {
                    // let data = await getRedisCached(cacheKey);
                    // if(!data) {
                        let data = await Template.findAll();
                        // await addRedisCached(cacheKey, data);
                    // }
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
                // let data = await getRedisCached(cacheKey);
                // if(!data) {
                    let data = await Template.findOne({
                        where: {
                            slug: slug,
                            isActive: true,
                        }
                    });
                    // await addRedisCached(cacheKey, data);
                // }
                return data;
            } catch (error) {
                console.error('Error fetching template by id:', error);
                throw new Error('Failed to fetch template by id');
            }
        }
    },
};

module.exports = templatesResolver;