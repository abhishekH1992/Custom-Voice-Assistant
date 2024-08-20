'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Voices', [
            {
                name: 'alloy',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'echo',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'fable',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'onyx',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'nova',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'shimmer',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ])
    },

    async down (queryInterface, Sequelize) {
        try {
            await queryInterface.bulkDelete('Voices', null, {
                truncate: true,
                cascade: true,
                restartIdentity: true
            });
            console.log('All records have been deleted from the Voice table.');
        } catch (error) {
            console.error('An error occurred while deleting records:', error);
        }
    }
};
