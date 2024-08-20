const { Voice } = require('../models');

const voicesResolver = {
    Query: {
        voices: async () => {
            try {
                const data = await Voice.findAll();
                return data;
            } catch (error) {
                console.error('Error fetching voices:', error);
                throw new Error('Failed to fetch voices');
            }
        },
    },
};

module.exports = voicesResolver;