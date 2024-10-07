const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion, transcribeAudio, combinedStream } = require('../utils/conversation.util');
const fs = require('fs');
const path = require('path');
const os = require('os');
// const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const pubsub = new PubSub();
let audioChunks = [];

const activeStreams = new Map();

const conversationResolver = {
    Mutation: {
        sendMessage: async(_, { templateId, messages }) => {
            const cacheKey = `template:${templateId}`;
            try {
                // let template = await getRedisCached(cacheKey);

                // if(!template) {
                    let template = await Template.findByPk(templateId);
                    // await addRedisCached(cacheKey, template);
                // }
                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        ...messages
                    ],
                    true
                );

                for await (const part of stream) {
                    pubsub.publish('MESSAGE_STREAMED', { 
                        messageStreamed: { role: 'system', content: part.choices[0]?.delta?.content || '' },
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
            if (activeStreams.has(templateId)) {
                activeStreams.get(templateId).abort();
                activeStreams.delete(templateId);
            }

            const audioBuffer = Buffer.concat(audioChunks);
            const fileName = `audio_${Date.now()}.wav`;
            const filePath = path.join(__dirname, '..', 'temp', fileName);
            fs.writeFileSync(filePath, audioBuffer);
            const cacheKey = `template:${templateId}`;
            let transcriptionSuccess = true;
            try {
                let fullTranscription = '';
                try {
                    const transcriptionStream = await transcribeAudio(filePath);
                    for await (const part of transcriptionStream) {
                        const transcriptionPart = part || '';
                        fullTranscription += transcriptionPart;
                    }
                    pubsub.publish('USER_STREAMED', { 
                        userStreamed: { content: fullTranscription },
                        templateId
                    });
                    transcriptionSuccess = true;
                } catch(error) {
                    transcriptionSuccess = false;
                }
                fs.unlinkSync(filePath);

                // let template = await getRedisCached(cacheKey);
                // if(!template) {
                    let template = await Template.findByPk(templateId);
                    // await addRedisCached(cacheKey, template);
                // }
                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        ...messages,
                        { 'role': transcriptionSuccess ? 'user' : 'system', content: transcriptionSuccess ? fullTranscription : 'Ask to repeat it. System couldnt heard what user said.' }
                    ],
                    true
                );

                const abortController = new AbortController();
                activeStreams.set(templateId, abortController);

                const combinedStreamInstance = combinedStream(stream, templateId, abortController.signal);
                try {
                    for await (const part of combinedStreamInstance) {
                        if (part.messageStreamed) {
                            pubsub.publish('MESSAGE_STREAMED', {
                                messageStreamed: part.messageStreamed,
                                templateId 
                            });
                        } 
                        else if (part.audioStreamed) {
                            pubsub.publish('AUDIO_STREAMED', {
                                audioStreamed: part.audioStreamed,
                                templateId
                            });
                        }
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.log(`Stream for template ${templateId} was aborted`);
                    } else {
                        throw error;
                    }
                } finally {
                    activeStreams.delete(templateId);
                }
        
                return true;
            } catch (error) {
                console.error('Error transcribing audio or generating response:', error);
                return false;
            }
        },
        sendAudioData: (_, { data }) => {
            const audioData = Buffer.from(data, 'base64');
            audioChunks.push(audioData);
            return true;
        },
        stopStreaming: async (_, { templateId }) => {
            if (activeStreams.has(templateId)) {
                activeStreams.get(templateId).abort();
                activeStreams.delete(templateId);
                pubsub.publish('STREAM_STOPPED', {
                    streamStopped: { templateId },
                });
                return true;
            }
            return false;
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
        userStreamed: {
            subscribe: (_, { templateId }) => pubsub.asyncIterator(['USER_STREAMED']),
            resolve: (payload, variables) => {
                if (payload.templateId === variables.templateId) {
                    return payload.userStreamed;
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
        streamStopped: {
            subscribe: () => pubsub.asyncIterator(['STREAM_STOPPED']),
            resolve: (payload) => payload.streamStopped,
        },
    },
};

module.exports = conversationResolver;