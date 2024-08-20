'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Types', [
            {
                name: 'Manual Conversation (Voice)',
                description: "This is a manual conversation mode, you need to manually start and stop the conversation. after starting the conversation, speak into the microphone and stop the conversation when you are done speaking and wait for the bot to respond. Click on 'Start Conversation' to begin conversation. and 'Stop Conversation' to end the conversation.",
                isAudio: true,
                isActive: true,
                isText: false,
                icon: 'MicVocal',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Automatic Conversation (Voice)',
                description: "This is an automatic conversation mode, you need to first select the duration you want to speak for. after selecting the duration, click on the start button to begin the conversation. Mic will start recording your voice and stop after the selected duration. After mic stop, the bot will respond. Click on 'Start' to begin conversation. and 'Stop' to end the conversation.",
                isAudio: true,
                isActive: true,
                isText: false,
                duration: 5,
                icon: 'Headphones',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Continues Conversation (Voice)',
                description: "This is a continue conversation mode, you need to manually start and stop the conversation. after starting the conversation, speak into the microphone and stop the conversation when you are done speaking. and wait for the bot to respond. Click on 'Start' to begin conversation. and 'Stop' to end the conversation.",
                isAudio: true,
                isActive: true,
                isText: false,
                icon: 'Headset',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Conversation (Text)',
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
                isAudio: false,
                isActive: true,
                isText: true,
                icon: 'MessageSquareMore',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down (queryInterface, Sequelize) {
        try {
            await queryInterface.bulkDelete('Types', null, {
                truncate: true,
                cascade: true,
                restartIdentity: true
            });
        } catch (error) {
            console.error('An error occurred while deleting records:', error);
        }
    }
};
