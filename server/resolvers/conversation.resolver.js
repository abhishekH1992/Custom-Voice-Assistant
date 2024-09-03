const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion } = require('../utils/conversation.util');

const fs = require('fs');
const path = require('path');
const openai = require('../utils/openai.util');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ensure the temp directory exists
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir);
}

const convertToWav = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioFrequency(16000)
            .audioChannels(1)
            .audioCodec('pcm_s16le')
            .format('wav')
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
};

const transcribeAudio = async (audioBuffer) => {
    const tempInputPath = path.join(tempDir, `input-${Date.now()}.raw`);
    const tempOutputPath = path.join(tempDir, `output-${Date.now()}.wav`);
    
    try {
        // Write the raw buffer to a temporary input file
        await fs.promises.writeFile(tempInputPath, audioBuffer);

        // Convert to WAV
        await convertToWav(tempInputPath, tempOutputPath);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempOutputPath),
            model: 'whisper-1'
        });

        return transcription.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    } finally {
        // Clean up: delete the temporary files
        fs.unlink(tempInputPath, (err) => {
            if (err) console.error('Error deleting temporary input file:', err);
        });
        fs.unlink(tempOutputPath, (err) => {
            if (err) console.error('Error deleting temporary output file:', err);
        });
    }
};

const pubsub = new PubSub();
let audioBuffer = Buffer.alloc(0);

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
        sendAudioChunk: async (_, { templateId, audioChunk }, { pubsub }) => {
            try {
                // Convert the received audioChunk to a Buffer and concatenate
                const chunk = Buffer.from(audioChunk, 'base64');
                audioBuffer = Buffer.concat([audioBuffer, chunk]);

                // Process the audio chunk (you may want to adjust the buffer size threshold)
                if (audioBuffer.length > 64000) { // Process every ~4 seconds of audio
                    const transcriptionText = await transcribeAudio(audioBuffer);

                    if (transcriptionText) {
                        pubsub.publish(`MESSAGE_STREAMED_${templateId}`, { messageStreamed: transcriptionText });
                    }
                    
                    // Reset the buffer
                    audioBuffer = Buffer.alloc(0);
                }
        
                return true;
            } catch (error) {
                console.error('Error in sendAudioChunk:', error);
                return false;
            }
        }
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