import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import TypeSettingsModal from '../components/ui/TypeSettingsModal';
import SaveChatModal from '../components/ui/SaveChatModal';
import { ME_QUERY } from '../graphql/queries/me.query';
import { GET_SAVED_CHAT } from '../graphql/queries/chat.query';
import { MESSAGE_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { useTextCompletion } from '../hooks/useTextCompletion';

const Template = () => {
    const { templateSlug, savedChatId } = useParams();
    const [selectedType, setSelectedType] = useState(null);
    const [chatName, setChatName] = useState('');
    const [isSaveChatModalOpen, setIsSaveChatModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chatContainerRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [streamingMessage, setStreamingMessage] = useState({});
    const [isThinking, setIsThinking] = useState(false);

    const { data, loading } = useQuery(GET_TEMPLATE_BY_SLUG, {
        variables: { slug: templateSlug }
    });
    const { loading: userLoading, data: userData } = useQuery(ME_QUERY);
    const { data: enableTypes, loading: typeLoading } = useQuery(GET_ENABLE_TYPES, {
        variables: { isActive: true }
    });
    const { data: savedChat, loading: savedChatLoading } = useQuery(GET_SAVED_CHAT, {
        variables: { savedChatId, userId: userData?.me?.id }
    });

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const isEmpty = (obj) => Object.keys(obj).length === 0;

    useSubscription(MESSAGE_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { role, content } = subscriptionData?.data?.messageStreamed;
            if (content !== undefined) {
                setStreamingMessage((prevMessage) => {
                    if (!prevMessage) {
                        return { role, content };
                    }
                    return { ...prevMessage, role, content: prevMessage.content ? prevMessage.content + content : '' + content };
                });
                if(isThinking) setIsThinking(false);
                scrollToBottom();
            }
        }
    });

    useEffect(() => {
        if (enableTypes && enableTypes.types && enableTypes.types.length > 0) {
            setSelectedType(enableTypes.types[0]);
        }
    }, [enableTypes]);

    useEffect(() => {
        if (savedChat && savedChat.getSavedChatById) {
            const { chats, name } = savedChat.getSavedChatById;
            const transformedChats = Object.values(chats)
                .filter(chat => typeof chat === 'object')
                .map(({ role, content }) => ({ role, content }));
            setMessages(transformedChats);
            setChatName(name || data?.templateBySlug?.aiRole);
        }
    }, [data?.templateBySlug?.aiRole, savedChat, setMessages]);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleOpenSaveChatModal = () => setIsSaveChatModalOpen(true);
    const handleSelectType = (type) => {
        setSelectedType(type);
        setIsModalOpen(false);
    };

    const handleSaveChat = () => {
        // Implementation for saving chat
    };

    const onDeleteChat = () => {
        // Implementation for deleting chat
    };

    const onFeedback = () => {
        // Implementation for feedback
    };

    const onStopRecording = () => {
        // Implementation for feedback
    };

    const onStartListening = () => {
        // Implementation for feedback
    };

    const { handleSendMessage } = useTextCompletion(data?.templateBySlug?.id, streamingMessage, setStreamingMessage, setMessages, setIsThinking, scrollToBottom, isEmpty)

    if (loading || typeLoading || savedChatLoading || userLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <>
            <Header name={chatName || data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages && messages.map((message, index) => (
                        <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))}
                    {!isEmpty(streamingMessage) && <ChatMessage message={streamingMessage} />}
                    {isThinking && <ChatMessage message={{ role: 'system', content: 'Thinking...' }} />}
                </div>
                <ChatBottom 
                    selectedType={selectedType}
                    onSendMessage={handleSendMessage}
                    onOpenSettings={handleOpenModal}
                    onSaveChat={handleOpenSaveChatModal}
                    onDeleteChat={onDeleteChat}
                    savedChatId={savedChatId}
                    onFeedback={onFeedback}
                    onStartRecording={onStartListening}
                    onStopRecording={onStopRecording}
                    isRecording={false}
                />
                <TypeSettingsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    types={enableTypes?.types || []}
                    onSelectType={handleSelectType}
                    selectedType={selectedType}
                />
                <SaveChatModal
                    isOpen={isSaveChatModalOpen}
                    onClose={() => setIsSaveChatModalOpen(false)}
                    onSave={handleSaveChat}
                    savedName={chatName}
                />
            </div>
        </>
    );
};

export default Template;