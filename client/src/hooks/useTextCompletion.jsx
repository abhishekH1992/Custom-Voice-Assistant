import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { SEND_MESSAGE } from '../graphql/mutations/conversation.mutation';
import { useMutation } from '@apollo/client';

export const useTextCompletion = (templateId, setMessages, setIsTyping, currentStreamedMessage, isEmpty) => {
    const [sendMessage] = useMutation(SEND_MESSAGE);

    const sendMessageToServer = useCallback(async (messages) => {
        try {
            await sendMessage({
                variables: {
                    templateId,
                    messages
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Something went wrong!');
        }
    }, [templateId, sendMessage]);

    const handleSendMessage = useCallback((message) => {
        setMessages(prevMessages => {
            const newMessages = !isEmpty(currentStreamedMessage)
                ? [...prevMessages, { role: 'system', content: currentStreamedMessage }, { role: 'user', content: message }]
                : [...prevMessages, { role: 'user', content: message }];
            sendMessageToServer(newMessages);
            return newMessages;
        });

        setIsTyping(true);
    }, [setMessages, setIsTyping, isEmpty, currentStreamedMessage, sendMessageToServer]);

    return {
        handleSendMessage
    };
};