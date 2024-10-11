import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '../graphql/mutations/conversation.mutation';
import toast from 'react-hot-toast';

export const useTextCompletion = (templateId, setMessages, currentStreamedMessage, setCurrentStreamedMessage, isEmpty, setIsTyping, currentType, getCurrentTime) => {
    const [sendMessage] = useMutation(SEND_MESSAGE);

    const sendMessageToServer = useCallback(async (messages) => {
        try {
            await sendMessage({
                variables: {
                    templateId: templateId,
                    messages: messages,
                    type: currentType
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Something went wrong! Retry again.')
        }
    }, [sendMessage, templateId, currentType]);

    const handleSendMessage = useCallback((message) => {
        const currentTime = getCurrentTime();
        setMessages(prevMessages => {
            const newMessages = !isEmpty(currentStreamedMessage)
                ? [...prevMessages, { role: 'system', content: currentStreamedMessage.content, type: currentStreamedMessage.type, timeStamp: currentStreamedMessage.timeStamp }, { role: 'user', content: message, type: currentType, timeStamp: currentTime }]
                : [...prevMessages, { role: 'user', content: message, type: currentType, timeStamp: currentTime  }];
            sendMessageToServer(newMessages);
            return newMessages;
        });

        setCurrentStreamedMessage({});
        setIsTyping(true);

    }, [currentStreamedMessage, currentType, getCurrentTime, isEmpty, sendMessageToServer, setCurrentStreamedMessage, setIsTyping, setMessages]);

    return {
        handleSendMessage
    };
}