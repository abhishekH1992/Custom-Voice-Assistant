import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION, AUDIO_SUBSCRIPTION, STREAM_STOPPED_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { SEND_MESSAGE, START_RECORDING, STOP_RECORDING, STOP_STREAMING } from '../graphql/mutations/conversation.mutation';
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
    const audioRef = useRef(new Audio());
    const audioQueue = useRef([]);
    const isPlayingAudio = useRef(false);
    const [userStreamedContent, setUserStreamedContent] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [recordingDuration, setRecordingDuration] = useState(null);
    const [isSystemAudioComplete, setIsSystemAudioComplete] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isUserInitiatedStop, setIsUserInitiatedStop] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [isSaveChatModalOpen, setIsSaveChatModalOpen] = useState(false);
    const [chatName, setChatName] = useState();
    const navigate = useNavigate();
    const vadRef = useRef(null);
    const [isContinuousMode, setIsContinuousMode] = useState(false);
    const messagesRef = useRef([]);
    const isActivityDetected = useRef(false);
    const [currentType, setCurrentType] = useState();
    const messageStartTimeRef = useRef(null);
    const userStartTimeRef = useRef(null);

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
            console.log(firstType.name);
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
        if(messages.length) {
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
    const [startRecording] = useMutation(START_RECORDING);
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

    const { error: msgErr } = useSubscription(MESSAGE_SUBSCRIPTION, {
        skip: !data?.templateBySlug?.id,
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { role, content: newContent } = subscriptionData?.data?.messageStreamed || {};
            
            if (newContent !== undefined && isActivityDetected.current === false) {
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
            } else if (isStreamingRef.current && isActivityDetected.current === false) {
                if (!isEmpty(streamedMessageRef)) {
                    setMessages(prev => [
                        ...prev, 
                        {
                            role: 'system', 
                            content: streamedMessageRef.current, 
                            type: currentType, 
                            timeStamp: messageStartTimeRef.current 
                        }
                    ]);
                }
                setCurrentStreamedMessage('');
                streamedMessageRef.current = '';
                isStreamingRef.current = false;
            }
        }        
    });

    useEffect(() => {
        if (!isStreamingRef.current && !isEmpty(currentStreamedMessage)) {
            setMessages(prev => [...prev, { role: 'system', content: currentStreamedMessage.content, type: currentStreamedMessage.type, timeStamp: currentStreamedMessage.timeStamp }]);
            setCurrentStreamedMessage('');
            streamedMessageRef.current = '';
        }
    }, [currentStreamedMessage, messages]);

    useEffect(() => {
        if (!isEmpty(userStreamedContent)) {
            setMessages(prevMessages => [...prevMessages, { role: 'user', content: userStreamedContent, type: currentType, timeStamp: userStartTimeRef.current || getCurrentTime() }]);
            setUserStreamedContent('');
        }
    }, [currentType, userStreamedContent]);

    const { error: audioErr} = useSubscription(AUDIO_SUBSCRIPTION, {
        skip: !data?.templateBySlug?.id,
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { content } = subscriptionData?.data?.audioStreamed || {};
            if(content && isActivityDetected.current === false) {
                audioQueue.current.push(content);
                if (!isPlayingAudio.current) {
                    console.log(getCurrentTime());
                    playNextAudio();
                }
            }
        }
    });

    const { error: stopStreamErr} = useSubscription(STREAM_STOPPED_SUBSCRIPTION, {
        skip: !data?.templateBySlug?.id,
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            console.log(subscriptionData);
            const { templateId } = subscriptionData?.data?.streamStopped || {};
            if (templateId === data?.templateBySlug?.id) {
                handleStreamStopped();
            }
        }
    });

    useEffect(() => {
        if(msgErr) console.log('MESSAGE_STREAM: '+msgErr);
        if(audioErr) console.log('AUDIO_STREAM: '+msgErr);
        if(stopStreamErr) console.log('STREAM_STOPPED: '+stopStreamErr);
    })

    const playNextAudio = useCallback(() => {
        if ((audioQueue.current.length > 0 && !selectedType?.isAutomatic && !selectedType?.isContinous) || (audioQueue.current.length > 0 && !isUserInitiatedStop && (selectedType?.isAutomatic || selectedType?.isContinous) && isActivityDetected.current === false)) {
            isPlayingAudio.current = true;
            const audioContent = audioQueue.current.shift();
            const audioChunk = base64ToArrayBuffer(audioContent);
            const audioFormats = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg'];
            const attemptPlay = (formatIndex) => {
                if (formatIndex >= audioFormats.length) {
                    console.error("Failed to play audio with all known formats");
                    playNextAudio();
                    return;
                }

                const blob = new Blob([audioChunk], { type: audioFormats[formatIndex] });
                const url = URL.createObjectURL(blob);
                
                audioRef.current.src = url;
                audioRef.current.play()
                    .then(() => {
                        console.log("Audio playing successfully with format:", audioFormats[formatIndex]);
                        audioRef.current.onended = playNextAudio;
                    })
                    .catch(e => {
                        console.warn(`Error playing audio with format ${audioFormats[formatIndex]}:`, e);
                        URL.revokeObjectURL(url);
                        attemptPlay(formatIndex + 1);
                    });
            };
            attemptPlay(0);
        } else {
            setIsSystemAudioComplete(true);
            isPlayingAudio.current = false;
        }
    }, [isUserInitiatedStop, selectedType]);

    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

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
        setMessages(prevMessages => {
            const newMessages = !isEmpty(currentStreamedMessage)
                ? [...prevMessages, { role: 'system', content: currentStreamedMessage.content, type: currentStreamedMessage.type, timeStamp: currentStreamedMessage.timeStamp }, { role: 'user', content: message, type: currentType, timeStamp: getCurrentTime() }]
                : [...prevMessages, { role: 'user', content: message, type: currentType, timeStamp: getCurrentTime() }];
            sendMessageToServer(newMessages);
            return newMessages;
        });

        setCurrentStreamedMessage({});
        streamedMessageRef.current = '';
        isStreamingRef.current = false;
        setIsTyping(true);

    }, [currentStreamedMessage, currentType, sendMessageToServer]);

    const handleStartRecording = useCallback(async () => {
        try {
            if (!isEmpty(currentStreamedMessage) || streamedMessageRef.current !== '') {
                setMessages(prevMessages => {
                    const newMessages = [...prevMessages, { role: currentStreamedMessage.role || 'system', content: currentStreamedMessage.content || streamedMessageRef.current, type: currentStreamedMessage.type || currentType, timeStamp: currentStreamedMessage.timeStamp || getCurrentTime() }];
                    messagesRef.current = newMessages;
                    return newMessages;
                });
            }
            await startRecording();
            setIsRecording(true);
            setCurrentStreamedMessage({});
            streamedMessageRef.current = '';
            isStreamingRef.current = false;

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            let recognition;

            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.interimResults = true; // Capture interim results (not final yet)
                recognition.maxAlternatives = 1;
                recognition.start();
            } else {
                console.error('SpeechRecognition API is not supported in this browser.');
            }

            recognition.onresult = (event) => {
                for (let i = 0; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        setUserStreamedContent((prev) => prev + transcript + ' ');
                        messagesRef.current = [
                            ...messagesRef.current,
                            {
                                role: 'user',
                                content: transcript,
                                type: currentType,
                                timeStamp: getCurrentTime(),
                            }
                        ];
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('SpeechRecognition error:', event.error);
            };

            recognition.onend = () => {
                console.log('Speech recognition service disconnected.');
            };
        } catch (error) {
            console.error('Error starting recording:', error);

            if (error.name === 'NotAllowedError') {
                console.error('Microphone access was denied by the user.');
            } else if (error.name === 'NotFoundError') {
                console.error('No microphone was found on this device.');
            } else {
                console.error('An unknown error occurred:', error);
            }
        }
    }, [currentStreamedMessage, startRecording, currentType]);

    const stopVoiceActivityDetection = useCallback(() => {
        if (vadRef.current) {
            vadRef.current.disconnect();
            vadRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            messagesRef.current = messages;
        }
    }, [messages]);

    const handleStreamStopped = useCallback(() => {
        setIsRecording(false);
        setIsTyping(false);
        setIsCallActive(false);
        setIsContinuousMode(false);
        setIsUserInitiatedStop(true);
        setIsSystemAudioComplete(true);
        
        if (isStreamingRef.current) {
            isStreamingRef.current = false;
            setCurrentStreamedMessage({});
            streamedMessageRef.current = '';
        }

        audioQueue.current = [];
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        isPlayingAudio.current = false;

        stopVoiceActivityDetection();
    }, [stopVoiceActivityDetection]);

    const handleStopRecording = useCallback(async(isUserInitiated = false) => {
        setIsRecording(false);
        if(selectedType?.isContinous && isUserInitiated) {
            stopVoiceActivityDetection();
            setIsContinuousMode(false);
        }
        setIsUserInitiatedStop(isUserInitiated);
        if ((!selectedType.isAutomatic && !selectedType.isContinous) || (!isUserInitiated && (selectedType?.isAutomatic || selectedType?.isContinous))) {
            await stopRecording(
                { 
                    variables: {
                        templateId: data?.templateBySlug?.id,
                        messages: messagesRef.current
                    }
                }
            );
            setIsTyping(true);
        }
        if (isUserInitiated && (selectedType?.isAutomatic || selectedType?.isContinous)) {
            handleStreamStopped();
        }
    }, [selectedType?.isContinous, selectedType?.isAutomatic, stopVoiceActivityDetection, stopRecording, data?.templateBySlug?.id, handleStreamStopped]);

    useEffect(() => {
        let recordingTimer;
        let countdownTimer;
        console.log(isCallActive, selectedType?.isAutomatic);
        if (isCallActive && selectedType && selectedType.isAutomatic && !isUserInitiatedStop) {
            if (isRecording) {
                setRemainingTime(recordingDuration);
                countdownTimer = setInterval(() => {
                    setRemainingTime(prevTime => {
                        if (prevTime <= 1) {
                            clearInterval(countdownTimer);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
                recordingTimer = setTimeout(() => {
                    console.log('stop')
                    handleStopRecording(false);
                }, recordingDuration * 1000);
            } else if (isSystemAudioComplete) {
                console.log('start')
                handleStartRecording();
                setIsSystemAudioComplete(false);
            }
        }
        return () => {
            clearTimeout(recordingTimer);
        };
    }, [isCallActive, isRecording, isSystemAudioComplete, recordingDuration, handleStartRecording, handleStopRecording, selectedType, isUserInitiatedStop]);

    const isEmpty = (obj) => Object.keys(obj).length === 0;

    const handleSaveChat = async (name) => {
        if (userLoading || userError || !userData?.me) {
            toast.error('User not authenticated');
            return;
        }
        try {
            if(currentStreamedMessage.content) {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { role: currentStreamedMessage.role, content: currentStreamedMessage.content },
                ]);
            }

            const result = await saveChat({
                variables: {
                    input: {
                        userId: userData.me.id,
                        templateId: data?.templateBySlug?.id,
                        chats: messages,
                        name: name ? name : chatName,
                        id: savedChatId
                    }
                }
            });
    
            if (result.data && result.data.saveChat && result.data.saveChat.success) {
                setIsSaveChatModalOpen(false);
                toast.success('Chat saved successfully');
                const savedChatId = result.data.saveChat.savedChat.id;
                navigate(`/template/${templateSlug}/${savedChatId}`);
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
        if (userLoading || userError || !userData?.me) {
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
                setChatName(data?.templateBySlug?.aiRole);
            } else {
                toast.error('Failed to delete chat');
            }
        } catch (error) {
            console.error('Error saving chat:', error);
            toast.error(error.message || 'Something went wrong. Try again later.');
        }
    }

    const onFeedback = () => {
        window.location.assign(`/analytics/${templateSlug}/${savedChatId}`);
    }

    const stopAudioPlayback = useCallback(() => {
        isActivityDetected.current = true;
        audioQueue.current = [];
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        isPlayingAudio.current = false;
        setIsSystemAudioComplete(true);
        setIsCallActive(true);
        setIsUserInitiatedStop(false);
    }, []);

    const startVoiceActivityDetection = useCallback(() => {
        if (vadRef.current) return;
        setIsRecording(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new AudioContext();

                vadRef.current = vad(audioContext, stream, {
                    onVoiceStart: () => {
                        console.log('Start: '+isActivityDetected.current);
                        stopAudioPlayback();
                        handleStartRecording();
                    },
                    onVoiceStop: () => {
                        // setTimeout(() => {
                        //     isActivityDetected.current = false;
                        // }, 100);
                        isActivityDetected.current = false;
                        console.log('Stopped: '+isActivityDetected.current);
                        setIsCallActive(false);
                        handleStopRecording(false);
                    },
                    // fftSize: 2048,
                    // bufferLen: 2048,
                    smoothingTimeConstant: 0.9,
                    // minCaptureFreq: 150,
                    // maxCaptureFreq: 3500,
                    noiseCaptureDuration: 200,
                    minNoiseLevel: 0.4,
                    maxNoiseLevel: 0.8,
                    // avgNoiseMultiplier: 1.4,
                });
            })
            .catch(err => console.error('Error accessing microphone:', err));
    }, [handleStartRecording, handleStopRecording, stopAudioPlayback]);

    useEffect(() => {
        return () => {
            stopVoiceActivityDetection();
        };
    }, [stopVoiceActivityDetection]);

    const handleStopStreaming = useCallback(async () => {
        try {
            await stopStreaming({
                variables: {
                    templateId: data?.templateBySlug?.id
                }
            });
            handleStreamStopped();
        } catch (error) {
            console.error('Error stopping stream:', error);
        }
    }, [data?.templateBySlug?.id, stopStreaming, handleStreamStopped]);

    const handleStartCall = useCallback(async() => {
        if(selectedType.isAutomatic) {
            setIsCallActive(true);
            setIsSystemAudioComplete(false);
            setIsUserInitiatedStop(false);
            handleStartRecording();
        } else if(selectedType.isContinous) {
            await handleStopStreaming();
            setIsCallActive(true);
            setIsSystemAudioComplete(false);
            setIsUserInitiatedStop(false);
            setIsContinuousMode(true);
            startVoiceActivityDetection();
        }else {
            handleStartRecording();
        }
    }, [handleStartRecording, handleStopStreaming, selectedType, startVoiceActivityDetection]);

    if (loading || typeLoading || savedChatLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <>
            <Header name={chatName ? chatName : data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages && messages.map((message, index) => (
                        <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))}
                    {!isEmpty(userStreamedContent) && (
                        <ChatMessage message={{ role: 'user', content: userStreamedContent }} />
                    )}
                    {!isEmpty(currentStreamedMessage) && currentStreamedMessage.content &&  (
                        <ChatMessage message={{ role: currentStreamedMessage.role, content: currentStreamedMessage.content, timeStamp: currentStreamedMessage.timeStamp, type: currentStreamedMessage.type }} />
                    )}
                    {isRecording && isEmpty(currentStreamedMessage) && (
                        <ChatMessage message={{ role: 'user', content: selectedType.isAutomatic ? `Listening...(${remainingTime.toString()} seconds remaining)` : 'Listening...' }} />
                    )}
                    {isTyping && !isRecording && isEmpty(currentStreamedMessage) && (
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
                    isCallActive={isCallActive}
                    onSaveChat={handleOpenSaveChatModal}
                    onDeleteChat={onDeleteChat}
                    savedChatId={savedChatId}
                    onFeedback={onFeedback}
                    isContinuousMode={isContinuousMode}
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
}

export default Template;