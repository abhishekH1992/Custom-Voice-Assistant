import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '../graphql/mutations/conversation.mutation';

export const useTextCompletion = async(templateId, setMessages, currentStreamedMessage, setCurrentStreamedMessage, isEmpty, setIsTyping) => {
    const [sendMessage] = useMutation(SEND_MESSAGE);

    const sendMessageToServer = useCallback(async (messages) => {
        try {
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
            const newMessages = !isEmpty(currentStreamedMessage)
                ? [...prevMessages, { role: 'system', content: currentStreamedMessage.content }, { role: 'user', content: message }]
                : [...prevMessages, { role: 'user', content: message }];
            sendMessageToServer(newMessages);
            return newMessages;
        });

        setCurrentStreamedMessage({});
        setIsTyping(true);

    }, [currentStreamedMessage, isEmpty, sendMessageToServer, setCurrentStreamedMessage, setIsTyping, setMessages]);

    return {
        handleSendMessage
    };
}