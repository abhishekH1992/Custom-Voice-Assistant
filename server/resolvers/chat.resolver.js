const { SavedChats, Template } = require('../models');
const { analyzeTranscription, analyzeChat } = require('../utils/conversation.util');
const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const chatResolver = {
    Query: {
        getSavedChatById: async(_, { savedChatId, userId }) => {
            try {
                const data = await SavedChats.findOne({
                    where: {
                        id: savedChatId,
                        userId
                    }
                });
                return data;
            } catch (error) {
                console.error('Error fetching user chat:', error);
                throw new Error('Failed to user chat');
            }
        },
        getSavedChatAndFeedbackById: async(_, { savedChatId, userId }) => {
            try {
                const data = await SavedChats.findOne({
                    where: {
                        id: savedChatId,
                        userId
                    },
                });
                if(!data.feedbackLastGeneratedAt || new Date(data.feedbackLastGeneratedAt) < new Date(data.updatedAt)) {
                    const cacheKey = `template:${data.templateId}`;
                    let template = await getRedisCached(cacheKey);
                    if(!template) {
                        template = await Template.findByPk(data.templateId);
                        await addRedisCached(cacheKey, template);
                    }

                    const feedback = await analyzeTranscription(template.prompt, template.model, data.chats);
                    const feedbackChat = await analyzeChat(template.prompt, template.model, data.chats);
                    try {
                        await SavedChats.update(
                            {
                                feedback: feedback,
                                feedbackLastGeneratedAt: new Date(),
                                table: feedbackChat
                            },
                            {
                                where: { id: savedChatId }
                            }
                        );
                        const response = await SavedChats.findOne({
                            where: {
                                id: savedChatId,
                                userId
                            },
                        });
                        return response;
                    } catch (error) {
                        console.error('Error updating feedback in database:', error);
                        throw new Error('Failed to update feedback');
                    }
                }
                return data;
            } catch (error) {
                console.error('Error fetching user chat:', error);
                throw new Error('Failed to user chat');
            }
        },
        getUsersSavedTemplateListByUserId: async(_, { userId }) => {
            try {
                return await SavedChats.findAll({
                    where: { userId },
                    include: [
                        {
                            model: Template,
                            as: 'template'
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching user chat:', error);
                throw new Error('Failed to user chat');
            }
        }
    },
    Mutation: {
        saveChat: async(_, { input }) => {
            try {
                const { id, userId, templateId, chats, name } = input;
                const cacheKey = `template:${templateId}`;
                if (!name.trim()) {
                    throw new Error('Chat name cannot be empty');
                }
        
                let savedChat;
                let message;

                let template = await getRedisCached(cacheKey);
                if(!template) {
                    template = await Template.findByPk(templateId);
                    await addRedisCached(cacheKey, template);
                }
                if (id) {
                    savedChat = await SavedChats.update(
                        { userId, templateId, chats, name },
                        { 
                            where: { id, userId },
                            returning: true,
                        }
                    );
                    if (!savedChat) {
                        throw new Error('Chat not found or you do not have permission to update it');
                    }
        
                    message = 'Chat updated successfully';
                    return {
                        success: true,
                        message,
                        savedChat: {
                            id,
                            userId,
                            templateId,
                            chats,
                            name
                        }
                    };
                } else {
                    savedChat = await SavedChats.create({
                        userId,
                        templateId,
                        chats,
                        name
                    });
        
                    message = 'Chat saved successfully';
                }
        
                return {
                    success: true,
                    message,
                    savedChat
                };
            } catch (error) {
                console.error('Error saving/updating chat:', error);
                return {
                    success: false,
                    message: error.message
                };
            }
        },
        deleteChat: async(_, { savedChatId, userId }) => {
            try {
                const result = await SavedChats.destroy({
                    where: {
                        id: savedChatId,
                        userId: userId
                    }
                });
                if (result > 0) {
                    return true; // Successfully deleted
                } else {
                    return false; // No chat found with given id and userId
                }
            } catch (error) {
                console.error('Error saving chat:', error);
                return false;
            }
        }
    }
};

module.exports = chatResolver;