'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.addColumn('Types', 'duration', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('Types', 'isText', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('Types', 'isActive', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.removeColumn('Types', 'duration');
        await queryInterface.removeColumn('Types', 'isText');
        await queryInterface.removeColumn('Types', 'isActive');
    }
};
