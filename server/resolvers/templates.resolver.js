const { Template } = require('../models');

const templatesResolver = {
    Query: {
        templates: async (_, {isActive}) => {
            try {
                if(isActive) {
                    const data = await Template.findAll({
                        where: {
                            isActive: true
                        }
                    });
                    return data;
                } else {
                    const data = await Template.findAll();
                    return data;
                }
            } catch (error) {
                console.error('Error fetching template:', error);
                throw new Error('Failed to fetch template');
            }
        },
    },
};

module.exports = templatesResolver;