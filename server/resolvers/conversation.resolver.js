const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion, transcribeAudio } = require('../utils/conversation.util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const pubsub = new PubSub();

let audioChunks = [];

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
                    pubsub.publish('MESSAGE_STREAMED', { 
                        messageStreamed: { content, isUserMessage: false },
                        templateId 
                    });
                }
        
                return true;
            } catch (error) {
                console.error('Error sending message to OpenAI:', error);
                return false;
            }
        },
        startRecording: () => {
            audioChunks = [];
            console.log('Started recording');
            return true;
        },
        stopRecording: async (_, { templateId, messages }) => {
            const audioBuffer = Buffer.concat(audioChunks);
            const fileName = `audio_${Date.now()}.wav`;
            const filePath = path.join(os.tmpdir(), fileName);
            
            fs.writeFileSync(filePath, audioBuffer);

            try {
                const transcriptionStream = await transcribeAudio(filePath);
                let fullTranscription = '';
                //first stream
                for await (const part of transcriptionStream) {
                    const transcriptionPart = part || '';
                    fullTranscription += transcriptionPart;
                    
                    pubsub.publish('MESSAGE_STREAMED', { 
                        messageStreamed: { content: part, isUserMessage: true },
                        templateId
                    });
                }

                pubsub.publish('MESSAGE_STREAMED', { 
                    messageStreamed: { content: '', isUserMessage: false },
                    templateId
                });

                fs.unlinkSync(filePath);

                const template = await Template.findByPk(templateId);
                
                // System response stream
                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        ...messages,
                        { 'role': 'user', content: fullTranscription }
                    ],
                    true
                );
                for await (const part of stream) {
                    const content = part.choices[0]?.delta?.content || '';
                    pubsub.publish('MESSAGE_STREAMED', { 
                        messageStreamed: { content, isUserMessage: false },
                        templateId 
                    });
                }

                return true;
            } catch (error) {
                console.error('Error transcribing audio:', error);
                return false;
            }
        },
        sendAudioData: (_, { data }) => {
            const audioData = Buffer.from(data, 'base64');
            audioChunks.push(audioData);
            return true;
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
    },
};

module.exports = conversationResolver;