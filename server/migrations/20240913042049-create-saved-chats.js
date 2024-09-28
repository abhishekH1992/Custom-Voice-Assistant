'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('SavedChats', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            templateId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Templates',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            chats: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: '[]'
            },
            feedback: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: '[]'
            },
            table: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: '[]'
            },
            feedbackLastGeneratedAt: {
                allowNull: true,
                type: Sequelize.DATE
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('SavedChats');
    }
};