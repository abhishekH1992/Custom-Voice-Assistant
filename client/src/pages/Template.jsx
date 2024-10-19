import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION, STREAM_STOPPED_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { SEND_MESSAGE, STOP_RECORDING, STOP_STREAMING } from '../graphql/mutations/conversation.mutation';
import TypeSettingsModal from '../components/ui/TypeSettingsModal';
import { SAVE_CHAT, DELETE_CHAT } from '../graphql/mutations/chat.mutation';
import SaveChatModal from '../components/ui/SaveChatModal';
import { ME_QUERY } from '../graphql/queries/me.query';
import toast from "react-hot-toast";
import { GET_SAVED_CHAT } from '../graphql/queries/chat.query';
import vad from 'voice-activity-detection';

const Template = () => {
    const { templateSlug, savedChatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const isStreamingRef = useRef(false);
    const streamedMessageRef = useRef('');
    const chatContainerRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [recordingDuration, setRecordingDuration] = useState(null);
    const [isSystemAudioComplete, setIsSystemAudioComplete] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);
    const [isSaveChatModalOpen, setIsSaveChatModalOpen] = useState(false);
    const [chatName, setChatName] = useState();
    const navigate = useNavigate();
    const messagesRef = useRef([]);
    const [userStreamedContent, setUserStreamedContent] = useState('');
    const isActivityDetected = useRef(false);
    const [currentType, setCurrentType] = useState();
    const messageStartTimeRef = useRef(null);
    const recognitionRef = useRef(null);
    const isRecognitionActive = useRef(false);
    const isUserInterrupted = useRef(false);
    const isRecordingStopped = useRef(false);
    const isUserInitiatedStop = useRef(false);
    const [isActiveCall, setIsActiveCall] = useState(false);
    const vadRef = useRef(null);

    const { data, loading } = useQuery(GET_TEMPLATE_BY_SLUG, {
        variables: {
            slug: templateSlug
        }
    });
    const { loading: userLoading, error: userError, data: userData } = useQuery(ME_QUERY);
    const { data: enableTypes, loading: typeLoading } = useQuery(GET_ENABLE_TYPES, {
        variables: {
            isActive: true
        }
    });

    useEffect(() => {
        if (enableTypes && enableTypes.types && enableTypes.types.length > 0) {
            const firstType = enableTypes.types[0];
            setSelectedType(firstType);
            setCurrentType(firstType.name);
        }
    }, [enableTypes]);

    const { data: savedChat, loading: savedChatLoading } = useQuery(GET_SAVED_CHAT, {
        variables: {
            savedChatId,
            userId: userData.me.id
        }
    });

    useEffect(() => {
        if (savedChat && savedChat.getSavedChatById) {
            const { chats, name } = savedChat.getSavedChatById;
            const transformedChats = Object.values(chats).filter(chat => typeof chat === 'object').map(({ role, content, type, timeStamp }) => ({ role, content, type, timeStamp }));
            setMessages(transformedChats);
            setChatName(name || data?.templateBySlug?.aiRole);
        }
    }, [data?.templateBySlug?.aiRole, savedChat]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleOpenSaveChatModal = () => {
        if (messages.length) {
            setIsSaveChatModalOpen(true);
        } else {
            toast.error('Start the conversation before storing this chat');
        }
    };

    const handleSelectType = (type) => {
        setSelectedType(type);
        setIsModalOpen(false);
        setRecordingDuration(type.duration);
        setCurrentType(type.name);
    };

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-NZ', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const [sendMessage] = useMutation(SEND_MESSAGE);
    const [stopRecording] = useMutation(STOP_RECORDING);
    const [stopStreaming] = useMutation(STOP_STREAMING);

    const [saveChat] = useMutation(SAVE_CHAT);
    const [deleteChat] = useMutation(DELETE_CHAT);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStreamedMessage]);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (isUserInterrupted.current) {
            window.speechSynthesis.cancel();
            return;
        }
        
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name.includes('Google') || voice.lang.startsWith('en'));
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    
        if (isActivityDetected.current || isUserInterrupted.current) {
            window.speechSynthesis.cancel();
            return;
        }
    
        utterance.pitch = 0.8;
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    // Add new streamed message to messages when it is available
    const addStreamedMessage = useCallback(() => {
        if (!isEmpty(currentStreamedMessage) || streamedMessageRef.current !== '') {
            setMessages(prevMessages => {
                const updatedMessages = [
                    ...prevMessages, 
                    {
                        role: currentStreamedMessage.role || 'system',
                        content: currentStreamedMessage.content || streamedMessageRef.current,
                        type: currentStreamedMessage.type || currentType,
                        timeStamp: currentStreamedMessage.timeStamp || getCurrentTime()
                    }
                ];
                messagesRef.current = updatedMessages;
                setCurrentStreamedMessage({});
                streamedMessageRef.current = '';
                return updatedMessages;
            });
        }
    }, [currentStreamedMessage, currentType]);

    // Add new user streamed content to messages when available
    const addUserStreamedContent = useCallback(() => {
        if (!isEmpty(userStreamedContent)) {
            setMessages(prevMessages => {
                const updatedMessages = [
                    ...prevMessages, 
                    { role: 'user', content: userStreamedContent, type: currentType, timeStamp: getCurrentTime() }
                ];
                messagesRef.current = updatedMessages;
                setUserStreamedContent('');
                return updatedMessages;
            });
        }
    }, [currentType, userStreamedContent]);

    const { error: msgErr } = useSubscription(MESSAGE_SUBSCRIPTION, {
        skip: !data?.templateBySlug?.id,
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { role, content: newContent } = subscriptionData?.data?.messageStreamed;
            if (newContent !== undefined && isActivityDetected.current === false && isUserInterrupted.current === false) {
                if (streamedMessageRef.current === '') {
                    setIsTyping(false);
                    messageStartTimeRef.current = getCurrentTime();
                }
                streamedMessageRef.current += newContent;
                setCurrentStreamedMessage({
                    role,
                    content: streamedMessageRef.current,
                    type: currentType,
                    timeStamp: messageStartTimeRef.current
                });
                isStreamingRef.current = true;
                speak(newContent);
            } else if (isStreamingRef.current && isActivityDetected.current === false) {
                addStreamedMessage();
                isStreamingRef.current = false;
            }
        },
        onComplete: () => {
            setIsSystemAudioComplete(true);
            if (selectedType?.isAutomatic) handleStartCall();
        }
    });

    const initializeSpeechRecognition = useCallback(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser.');
            return;
        }
    
        const recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
    
        let finalTranscript = ''; // To hold the final transcript
    
        recognition.onresult = (event) => {
            let interimTranscript = ''; // To hold interim results
    
            // Loop through results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript; // Append final results
                    setUserStreamedContent(finalTranscript); // Set userStreamedContent state
                    console.log('Final transcript:', finalTranscript);
                } else {
                    interimTranscript += result[0].transcript; // Keep adding interim results
                }
            }
    
            // You can use interimTranscript for displaying partial results in the UI
            console.log('Interim transcript:', interimTranscript);
        };
    
        recognition.onerror = (event) => {
            setIsRecording(false);
            console.error('Speech recognition error:', event.error);
        };
    
        recognition.onend = () => {
            console.log('Speech recognition ended.');
            setIsRecording(false);
            isRecognitionActive.current = false;
        };
    
        recognitionRef.current = recognition; // Store recognition instance for future use
    }, []);

    useEffect(() => {
        initializeSpeechRecognition();
    }, [initializeSpeechRecognition]);

    useEffect(() => {
        addStreamedMessage();
    }, [currentStreamedMessage]);

    const { error: stopStreamErr } = useSubscription(STREAM_STOPPED_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { templateId } = subscriptionData?.data?.streamStopped;
            if (templateId === data?.templateBySlug?.id) {
                window.speechSynthesis.cancel();
            }
        }
    });

    useEffect(() => {
        if (msgErr) console.log('MESSAGE_STREAM: '+msgErr);
        if (stopStreamErr) console.log('STREAM_STOPPED: '+stopStreamErr);
    });

    const sendMessageToServer = useCallback(async (messages) => {
        try {
            await sendMessage({
                variables: {
                    templateId: data?.templateBySlug?.id,
                    messages: messages
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [data?.templateBySlug?.id, sendMessage]);

    const handleSendMessage = useCallback((message) => {
        addStreamedMessage();
        addUserStreamedContent();
        setMessages(prevMessages => {
            const newMessages = [...prevMessages, { role: 'user', content: message, type: currentType, timeStamp: getCurrentTime() }];
            sendMessageToServer(newMessages);
            return newMessages;
        });
        setIsTyping(true);
    }, [addStreamedMessage, addUserStreamedContent, currentType, sendMessageToServer]);

    const isEmpty = (value) => {
        return typeof value !== 'string' || value.trim() === ''; 
    };


    const sendStopRecording = useCallback(async (updatedMessages) => {
        if (isRecordingStopped.current) return;
        isRecordingStopped.current = true;
        try {
            await stopRecording({
                variables: {
                    templateId: data?.templateBySlug?.id,
                    messages: updatedMessages
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            isRecordingStopped.current = false;
        }
    }, [data?.templateBySlug?.id, stopRecording]);

    const stopStreamingData = useCallback(async () => {
        if (recognitionRef.current && isRecognitionActive.current) {
            recognitionRef.current?.stop();
            isRecognitionActive.current = false;
        }
        isUserInterrupted.current = true;
        try {
            await stopStreaming({
                variables: {
                    templateId: data?.templateBySlug?.id
                }
            });
        } catch (error) {
            console.error("Error stopping streaming:", error);
        }
    }, [data?.templateBySlug?.id, stopStreaming]);

    const handleStopRecording = useCallback(async (isUserStopped = false) => {
        if (isUserStopped && (selectedType?.isAutomatic || selectedType?.isContinous)) {
            await stopStreamingData();
            isUserInitiatedStop.current = true;
            setIsActiveCall(false);
        }

        recognitionRef.current?.stop();
        isRecognitionActive.current = false;
        setIsRecording(false);

        // Ensure all messages are added before sending the stop recording request
        addStreamedMessage();
        addUserStreamedContent();
        console.log(messagesRef.current);
        setTimeout(() => {
            console.log('Messages before sending:', messagesRef.current); // Ensure updated messagesRef
            if (!isEmpty(messagesRef.current)) {
                sendStopRecording(messagesRef.current);
            }
        }, 500);
        
        isStreamingRef.current = false;
        isUserInterrupted.current = false;
    }, [addStreamedMessage, addUserStreamedContent, selectedType?.isAutomatic, selectedType?.isContinous, sendStopRecording, stopStreamingData]);

    const handleStartRecording = useCallback(async (stopStreaming = true) => {
        addStreamedMessage();
        addUserStreamedContent();
        setIsActiveCall(true);
        window.speechSynthesis.cancel();
        if (stopStreaming) await stopStreamingData();
        if (!recognitionRef.current || isRecognitionActive.current) {
            console.warn('Speech recognition is already running or not initialized.');
            return;
        }
        setIsRecording(true);
        try {
            recognitionRef.current?.start();
        } catch (error) {
            console.warn('Speech recognition is already running');
        }
        isRecognitionActive.current = true;
    }, [addStreamedMessage, addUserStreamedContent, stopStreamingData]);

    const startVoiceActivityDetection = useCallback(() => {
        if (vadRef.current) return;
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new AudioContext();

                vadRef.current = vad(audioContext, stream, {
                    onVoiceStart: () => {
                        isActivityDetected.current = true;
                        window.speechSynthesis.cancel();
                        handleStartRecording();
                    },
                    onVoiceStop: () => {
                        isActivityDetected.current = false;
                        if (!isEmpty(messagesRef.current)) {
                            handleStopRecording(false);
                        }
                    },
                    noiseCaptureDuration: 300,
                    minNoiseLevel: 0.3,
                    maxNoiseLevel: 0.9,
                });
            })
            .catch(err => console.error('Error accessing microphone:', err));
    }, [handleStartRecording, handleStopRecording]);

    const handleStartCall = useCallback(async () => {
        if (selectedType?.isContinous) {
            startVoiceActivityDetection();
        } else {
            handleStartRecording();
        }
    }, [handleStartRecording, selectedType?.isContinous, startVoiceActivityDetection]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            window.speechSynthesis.cancel();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.speechSynthesis.cancel();
        };
    }, []);

    if (loading || typeLoading || savedChatLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <>
            <Header name={chatName ? chatName : data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages && messages.map((message, index) => (
                        <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))}
                    {!isEmpty(currentStreamedMessage) && currentStreamedMessage.content && (
                        <ChatMessage message={{ role: currentStreamedMessage.role, content: currentStreamedMessage.content, timeStamp: currentStreamedMessage.timeStamp, type: currentStreamedMessage.type }} />
                    )}
                    {isRecording && isEmpty(currentStreamedMessage) && (
                        <ChatMessage message={{ role: 'user', content: selectedType.isAutomatic ? `Listening...(${remainingTime.toString()} seconds remaining)` : 'Listening...' }} />
                    )}
                    {isTyping && !isRecording && (
                        <ChatMessage message={{ role: 'system', content: 'Thinking...' }} />
                    )}
                </div>
                <ChatBottom 
                    selectedType={selectedType}
                    onSendMessage={handleSendMessage}
                    onStartRecording={handleStartCall}
                    onStopRecording={() => handleStopRecording(true)}
                    isRecording={isRecording}
                    onOpenSettings={handleOpenModal}
                    onSaveChat={handleOpenSaveChatModal}
                    // onDeleteChat={onDeleteChat}
                    savedChatId={savedChatId}
                    // onFeedback={onFeedback}
                    isContinuousMode={isActiveCall}
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
                    // onSave={handleSaveChat}
                    savedName={chatName}
                />
            </div>
        </>
    );
};

export default Template;
