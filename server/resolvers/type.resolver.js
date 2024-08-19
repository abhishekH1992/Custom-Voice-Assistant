const { Type } = require('../models');

const typeResolver = {
    Query: {
        getTypes: async () => {
            try {
                const types = await Type.findAll();
                return types;
            } catch (error) {
                console.error('Error fetching types:', error);
                throw new Error('Failed to fetch types');
            }
        },
        getActiveTypes: async () => {
            try {
                const activeTypes = await Type.findAll({
                    where: {
                        isActive: true
                    }
                });
                return activeTypes;
            } catch (error) {
                console.error('Error fetching active types:', error);
                throw new Error('Failed to fetch active types');
            }
        }
    },
};

module.exports = typeResolver;