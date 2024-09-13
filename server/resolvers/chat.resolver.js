const { SavedChats } = require('../models');

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
        }
    },
    Mutation: {
        saveChat: async(_, { input }) => {
            try {
                const { id, userId, templateId, chats, name } = input;
        
                if (!name.trim()) {
                    throw new Error('Chat name cannot be empty');
                }
        
                let savedChat;
                let message;
        
                if (id) {
                    savedChat = await SavedChats.update(
                        { userId, templateId, chats, name },
                        { 
                            where: { id, userId },
                            returning: true,
                        }
                    );
                    console.log(savedChat);
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