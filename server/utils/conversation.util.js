const openai = require('./openai.util');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const textCompletion = async(model, messages, stream = false) => {
    const response =  await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: stream,
    });

    return response;
}

const speechToText = async (audioFile) => {
    console.log(audioFile);
    const transcript = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
    });
    return transcript.text;
};

const textToSpeech = async (text) => {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const fileName = `${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, '../public/audio', fileName);

    await fs.promises.writeFile(filePath, buffer);

    return `/audio/${fileName}`;
};

module.exports = { textCompletion, speechToText, textToSpeech };