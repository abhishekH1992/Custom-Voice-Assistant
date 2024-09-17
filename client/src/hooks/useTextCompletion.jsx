import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { SEND_MESSAGE } from '../graphql/mutations/conversation.mutation';
import { useMutation } from '@apollo/client';

export const useTextCompletion = (templateId, streamingMessage, setStreamingMessage, setMessages, setIsThinking, scrollToBottom, isEmpty) => {
    const [sendMessage] = useMutation(SEND_MESSAGE);

    const sendMessageToServer = useCallback(async (messages) => {
        try {
            scrollToBottom();
            await sendMessage({
                variables: {
                    templateId: templateId,
                    messages: messages
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [templateId, sendMessage]);

    const handleSendMessage = useCallback((message) => {
        setMessages(prevMessages => {
            const newMessages = !isEmpty(streamingMessage)
                ? [...prevMessages, { role: 'system', content: streamingMessage.content }, { role: 'user', content: message }]
                : [...prevMessages, { role: 'user', content: message }];
            sendMessageToServer(newMessages);
            return newMessages;
        });
        setIsThinking(true);
        setStreamingMessage({});
    }, [setMessages, setIsThinking, setStreamingMessage, isEmpty, streamingMessage, sendMessageToServer]);

    return {
        handleSendMessage
    };
};