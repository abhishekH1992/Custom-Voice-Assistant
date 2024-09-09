const openai = require('./openai.util');
const fs = require('fs');

const textCompletion = async(model, messages, stream = false) => {
    const response =  await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: stream,
    });

    return response;
}

const transcribeAudio = async(filePath) => {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
            stream: true
        });
        return transcription.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

const textToSpeech = async function*(text, voice='alloy') {
    const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: alloy,
        input: text,
    });
  
    yield* response.body;
};

module.exports = { textCompletion, transcribeAudio, textToSpeech };