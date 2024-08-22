const openai = require('../utils/openai.utils');
const { Template } = require('../models');
const axios = require('axios');

getTemplateInfo = async(templateId) => {
    try {
        const template = await Template.findByPk(templateId);
        if (!template) {
            throw new Error('Template not found');
        }
        return template;
    } catch (error) {
        console.error('Error fetching template:', error);
        throw error;
    }
}

async function* completion(model, messages, stream = false) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: model,
                messages: messages,
                stream: stream,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHATGPT_SECRET}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'stream',
            }
        );

        for await (const chunk of response.data) {
            const lines = chunk.toString('utf8').split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                const message = line.replace(/^data: /, '');
                if (message === '[DONE]') {
                    return;
                }
                try {
                    const parsed = JSON.parse(message);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                        yield content;
                    }
                } catch (error) {
                    console.error('Error parsing stream message:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error in completion:', error);
        throw error;
    }
}


module.exports = {
    getTemplateInfo,
    completion
};