import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useTextCompletion } from '../hooks/useTextCompletion';
import { MESSAGE_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { useCrud } from '../hooks/useCrud';
import useVoiceDetection from '../hooks/useVoiceDetection';
import useAudioStreaming from '../hooks/useAudioStreaming';

const Template = () => {
    const { templateSlug, savedChatId } = useParams();
    const [selectedType, setSelectedType] = useState(null);
    const [chatName, setChatName] = useState('');
    const [isSaveChatModalOpen, setIsSaveChatModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chatContainerRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [currentType, setCurrentType] = useState();
    const navigate = useNavigate();
    const [recordingDuration, setRecordingDuration] = useState(null);
    const [isInterrupted, setIsInterrupted] = useState(false);
    const vadRef = useRef(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const isCallActiveRef = useRef(false);

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

    useEffect(() => {
        if (enableTypes && enableTypes.types && enableTypes.types.length > 0) {
            setSelectedType(enableTypes.types[0]);
            setCurrentType(enableTypes.types[0].name);
        }
    }, [enableTypes]);

    useEffect(() => {
        if (savedChat && savedChat.getSavedChatById) {
            const { chats, name } = savedChat.getSavedChatById;
            const transformedChats = Object.values(chats)
                .filter(chat => typeof chat === 'object')
                .map(({ role, content, type, timeStamp }) => ({ role, content, type, timeStamp }));
            setMessages(transformedChats);
            setChatName(name || data?.templateBySlug?.aiRole);
        }
    }, [data?.templateBySlug?.aiRole, savedChat, setMessages]);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleOpenSaveChatModal = () => setIsSaveChatModalOpen(true);
    const handleSelectType = (type) => {
        setSelectedType(type);
        setCurrentType(type.name);
        setIsModalOpen(false);
        setRecordingDuration(type.duration);
    };

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-NZ', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const { error: msgStreamErr } = useSubscription(MESSAGE_SUBSCRIPTION, {
        skip: !data?.templateBySlug?.id,
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { role, content, type } = subscriptionData?.data?.messageStreamed;
            if (content !== undefined) {
                const timeStamp = getCurrentTime();
                setCurrentStreamedMessage((prevMessage) => {
                    if (!prevMessage) return { role, content, type, timeStamp };
                    return {
                        ...prevMessage, 
                        role, 
                        content: prevMessage.content ? prevMessage.content + content : '' + content, 
                        type: currentType, 
                        timeStamp: prevMessage.timeStamp || timeStamp };
                });
                if(isTyping) setIsTyping(false);
            }
        }
    });

    useEffect(() => {
        if(msgStreamErr) console.log(msgStreamErr);
    }, [msgStreamErr]);

    const { handleSendMessage } = useTextCompletion(data?.templateBySlug?.id, setMessages, currentStreamedMessage, setCurrentStreamedMessage, isEmpty, setIsTyping, currentType, getCurrentTime);
    const { handleSaveChat, onDeleteChat, onFeedback } = useCrud(data?.templateBySlug, userData, currentStreamedMessage, setCurrentStreamedMessage, setChatName, messages, setMessages, chatName, savedChatId, setIsSaveChatModalOpen, templateSlug, navigate);
    const { isPlaying, stopAudio, audioJammer } = useAudioStreaming(data?.templateBySlug?.id);
    const { isListening, startTheCall, stopListening, recognition } = useVoiceDetection(data?.templateBySlug?.id, setMessages, currentStreamedMessage, setCurrentStreamedMessage, isEmpty, setIsTyping, currentType, getCurrentTime, isInterrupted, selectedType, vadRef, isCallActiveRef, audioJammer);

    const handleStartListening = useCallback(() => {
        setIsCallActive(true);
        isCallActiveRef.current = true;
        if (isPlaying) {
            setIsInterrupted(true);
            stopAudio().then(() => {
                startTheCall();
            });
        } else {
            setIsInterrupted(false);
            startTheCall();
        }
    }, [isPlaying, startTheCall, stopAudio]);

    const stopVoiceActivityDetection = useCallback(() => {
        recognition.stop();
        setIsCallActive(false);
        isCallActiveRef.current = false;
        if (vadRef.current) {
            vadRef.current.disconnect();
            vadRef.current = null;
        }
    }, [recognition]);

    const handleStopListening = useCallback(() => {
        if(selectedType?.isContinous) stopVoiceActivityDetection();
        audioJammer();
        if(!selectedType?.isContinous) stopListening();
    }, [selectedType?.isContinous, audioJammer, stopListening, stopVoiceActivityDetection]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStreamedMessage, isListening, isTyping]);

    if (loading || typeLoading || savedChatLoading || userLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <>
            <Header name={chatName || data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages && messages.map((message, index) => (<ChatMessage key={`${message.role}-${index}`} message={message} />))}
                    {!isEmpty(currentStreamedMessage) && <ChatMessage message={currentStreamedMessage} />}
                    {isListening && <ChatMessage message={{ role: 'system', content: 'Listening...' }} />}
                    {isTyping && <ChatMessage message={{ role: 'system', content: 'Thinking...' }} />}
                </div>
                <ChatBottom 
                    selectedType={selectedType}
                    onSendMessage={handleSendMessage}
                    onOpenSettings={handleOpenModal}
                    onSaveChat={handleOpenSaveChatModal}
                    onDeleteChat={onDeleteChat}
                    savedChatId={savedChatId}
                    onFeedback={onFeedback}
                    onStartRecording={handleStartListening}
                    onStopRecording={handleStopListening}
                    isRecording={isListening}
                    isCallActiveRef={isCallActiveRef}
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