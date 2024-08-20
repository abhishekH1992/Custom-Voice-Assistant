const { Type } = require('../models');

const typeResolver = {
    Query: {
        types: async (_, {isActive}) => {
            try {
                if(isActive) {
                    const data = await Type.findAll({
                        where: {
                            isActive: true
                        }
                    });
                    return data;
                } else {
                    const data = await Type.findAll();
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