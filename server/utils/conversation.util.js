const { openai } = require('./openai.util');

const textCompletion = async(model, messages, stream = false) => {
    const response =  await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: stream,
    });

    return response;
}

module.exports = { textCompletion };