const { openai } = require('./openai.util');

export const textCompletion = async(model, message, stream = false) => {
    return await openai.chat.completions.create({
        model: model,
        messages: message,
        stream: stream,
    });
}