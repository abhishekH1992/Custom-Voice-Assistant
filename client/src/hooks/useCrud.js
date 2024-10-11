import { useMutation } from '@apollo/client';
import { SAVE_CHAT } from '../graphql/mutations/chat.mutation';
import { DELETE_CHAT } from '../graphql/mutations/chat.mutation';
import toast from 'react-hot-toast';

export const useCrud = (template, userData, currentStreamedMessage, setCurrentStreamedMessage, setChatName, messages, setMessages, chatName, savedChatId, setIsSaveChatModalOpen, templateSlug, navigate) => {
    const [saveChat] = useMutation(SAVE_CHAT);
    const [deleteChat] = useMutation(DELETE_CHAT);


    const handleSaveChat = async (name) => {
        if (!userData?.me) {
            toast.error('User not authenticated');
            return;
        }
        try {
            let updatedMessages = [...messages];

            // Add currentStreamedMessage to messages if it has content
            if (currentStreamedMessage && currentStreamedMessage.content) {
                updatedMessages = [
                    ...updatedMessages,
                    {
                        role: currentStreamedMessage.role,
                        content: currentStreamedMessage.content,
                        type: currentStreamedMessage.type,
                        timeStamp: currentStreamedMessage.timeStamp
                    }
                ];
                // Update the messages state
                setMessages(updatedMessages);
            }

            const result = await saveChat({
                variables: {
                    input: {
                        userId: userData.me.id,
                        templateId: template.id,
                        chats: updatedMessages,
                        name: name || chatName,
                        id: savedChatId
                    }
                }
            });
    
            if (result.data && result.data.saveChat && result.data.saveChat.success) {
                setCurrentStreamedMessage('');
                setIsSaveChatModalOpen(false);
                toast.success('Chat saved successfully');
                const newSavedChatId = result.data.saveChat.savedChat.id;
                navigate(`/template/${templateSlug}/${newSavedChatId}`);
            } else {
                toast.error('Failed to save chat');
                throw new Error(result.data?.saveChat?.message || 'Failed to save chat');
            }
        } catch (error) {
            console.error('Error saving chat:', error);
            toast.error(error.message || 'Something went wrong. Try again later.');
        }
    };

    const onDeleteChat = async() => {
        if (!userData?.me) {
            toast.error('User not authenticated');
            return;
        }
        try {
            const result = await deleteChat({
                variables: { savedChatId, userId: userData.me.id }
            });
    
            if (result.data) {
                setIsSaveChatModalOpen(false);
                toast.success('Chat deleted successfully');
                navigate(`/template/${templateSlug}`);
                setMessages([]);
                setCurrentStreamedMessage('');
                setChatName(template.aiRole);
            } else {
                toast.error('Failed to delete chat');
            }
        } catch (error) {
            console.error('Error saving chat:', error);
            toast.error(error.message || 'Something went wrong. Try again later.');
        }
    }

    const onFeedback = () => {
        navigate(`/analytics/${templateSlug}/${savedChatId}`);
    }

    return {
        handleSaveChat,
        onDeleteChat,
        onFeedback
    };
}