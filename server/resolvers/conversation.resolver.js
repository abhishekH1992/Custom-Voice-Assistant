const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion, speechToText, textToSpeech } = require('../utils/conversation.util');

const pubsub = new PubSub();

const conversationResolver = {
    Mutation: {
        sendMessage: async (_, { templateId, messages }) => {
            try {
                const template = await Template.findByPk(templateId);
                
                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        ...messages
                    ],
                    true
                );
                for await (const part of stream) {
                    const content = part.choices[0]?.delta?.content || '';
                    pubsub.publish('MESSAGE_STREAMED', { messageStreamed: content, templateId });
                }
        
                return true;
            } catch (error) {
                console.error('Error sending message to OpenAI:', error);
                return false;
            }
        },
        sendAudio: async (_, { templateId, audio }) => {
            // try {
                const template = await Template.findByPk(templateId);
                
                // Convert audio to text
                const text = await speechToText(audio);
                
                // Get response from ChatGPT
                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        { 'role': 'user', content: text }
                    ],
                    true
                );
                
                let fullResponse = '';
                for await (const part of stream) {
                    const content = part.choices[0]?.delta?.content || '';
                    fullResponse += content;
                    pubsub.publish('MESSAGE_STREAMED', { messageStreamed: content, templateId });
                }
                
                // Convert response to audio
                const audioUrl = await textToSpeech(fullResponse);
                
                pubsub.publish('AUDIO_STREAMED', { audioStreamed: audioUrl, templateId });
                
                return true;
            // } catch (error) {
            //     console.error('Error processing audio:', error);
            //     return false;
            // }
        },
    },
    Subscription: {
        messageStreamed: {
            subscribe: (_, { templateId }) => pubsub.asyncIterator(['MESSAGE_STREAMED']),
            resolve: (payload, variables) => {
                if (payload.templateId === variables.templateId) {
                    return payload.messageStreamed;
                }
                return null;
            },
        },
        audioStreamed: {
            subscribe: (_, { templateId }) => pubsub.asyncIterator(['AUDIO_STREAMED']),
            resolve: (payload, variables) => {
                if (payload.templateId === variables.templateId) {
                    return payload.audioStreamed;
                }
                return null;
            },
        },
    },
};

module.exports = conversationResolver;