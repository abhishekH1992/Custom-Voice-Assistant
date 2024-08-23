const openai = require('./openai.util');

const getStreamingCompletion = async (model, messages, stream = false) => {
    return openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: stream,
    });
};

module.exports = {
    getStreamingCompletion
};