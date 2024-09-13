import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION, AUDIO_SUBSCRIPTION, USER_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { SEND_MESSAGE, START_RECORDING, STOP_RECORDING, SEND_AUDIO_DATA } from '../graphql/mutations/conversation.mutation';
import TypeSettingsModal from '../components/ui/TypeSettingsModal';

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const isStreamingRef = useRef(false);
    const streamedMessageRef = useRef('');
    const chatContainerRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
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

    const { data, loading } = useQuery(GET_TEMPLATE_BY_SLUG, {
        variables: {
            slug: templateSlug
        }
    });

    const { data: enableTypes, loading: typeLoading } = useQuery(GET_ENABLE_TYPES, {
        variables: {
            isActive: true
        }
    });

    useEffect(() => {
        if (enableTypes && enableTypes.types && enableTypes.types.length > 0) {
            const firstType = enableTypes.types[0];
            setSelectedType(firstType);
        }
    }, [enableTypes]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleSelectType = (type) => {
        setSelectedType(type);
        setIsModalOpen(false);
        setRecordingDuration(type.duration);
    };

    const [sendMessage] = useMutation(SEND_MESSAGE);
    const [startRecording] = useMutation(START_RECORDING);
    const [stopRecording] = useMutation(STOP_RECORDING);
    const [sendAudioData] = useMutation(SEND_AUDIO_DATA);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStreamedMessage]);

    useSubscription(MESSAGE_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { role, content: newContent } = subscriptionData?.data?.messageStreamed;
            if (newContent !== undefined) {
                if (streamedMessageRef.current === '') {
                    setIsTyping(false);
                }
                streamedMessageRef.current += newContent;
                setCurrentStreamedMessage({
                    role,
                    content: streamedMessageRef.current
                });
                isStreamingRef.current = true;
            } else if (isStreamingRef.current) {
                if(!isEmpty(streamedMessageRef)) setMessages(prev => [...prev, { role: 'system', content: streamedMessageRef.current }]);
                setCurrentStreamedMessage('');
                streamedMessageRef.current = '';
                isStreamingRef.current = false;
            }
        }
    });

    useEffect(() => {
        if (!isStreamingRef.current && !isEmpty(currentStreamedMessage)) {
            setMessages(prev => [...prev, { role: 'system', content: currentStreamedMessage.content }]);
            setCurrentStreamedMessage('');
            streamedMessageRef.current = '';
        }
    }, [currentStreamedMessage]);

    useSubscription(USER_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { content } = subscriptionData?.data?.userStreamed || {};
            if (content) {
                setUserStreamedContent(prevContent => prevContent + content);
            }
        }
    });

    useEffect(() => {
        if (!isEmpty(userStreamedContent)) {
            setMessages(prevMessages => [...prevMessages, { role: 'user', content: userStreamedContent }]);
            setUserStreamedContent('');
        }
    }, [userStreamedContent]);

    useSubscription(AUDIO_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { content } = subscriptionData?.data?.audioStreamed;
            if(content) {
                audioQueue.current.push(content);
                if (!isPlayingAudio.current) {
                    playNextAudio();
                }
            }
        }
    });

    const playNextAudio = useCallback(() => {
        if (audioQueue.current.length > 0) {
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
    }, []);

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
                ? [...prevMessages, { role: 'system', content: currentStreamedMessage.content }, { role: 'user', content: message }]
                : [...prevMessages, { role: 'user', content: message }];
            sendMessageToServer(newMessages);
            return newMessages;
        });

        setCurrentStreamedMessage({});
        streamedMessageRef.current = '';
        isStreamingRef.current = false;
        setIsTyping(true);
    }, [currentStreamedMessage, sendMessageToServer]);

    const handleStartRecording = useCallback(async () => {
        try {
            if(!isEmpty(currentStreamedMessage)) {
                setMessages(prevMessages => [...prevMessages, { role: currentStreamedMessage.role, content: currentStreamedMessage.content }]);
            }
            await startRecording();
            setIsRecording(true);
            setCurrentStreamedMessage({});
            streamedMessageRef.current = '';
            isStreamingRef.current = false;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            });

            mediaRecorderRef.current.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64AudioData = reader.result.split(',')[1];
                        await sendAudioData({ variables: { data: base64AudioData } });
                    };
                    reader.readAsDataURL(event.data);
                }
            };

            mediaRecorderRef.current.start(250);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }, [currentStreamedMessage, startRecording, sendAudioData]);

    const handleStopRecording = useCallback(async (isUserInitiated = false) => {
        setIsRecording(false);
        if(isUserInitiated) {
            setIsRecording(false);
        }
        setIsUserInitiatedStop(isUserInitiated);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            await stopRecording(
                { 
                    variables: {
                        templateId: data?.templateBySlug?.id,
                        messages: messages
                    }
                }
            );
            setIsTyping(true);
        }
        if (isUserInitiated) {
            if (isStreamingRef.current) {
                isStreamingRef.current = false;
                setCurrentStreamedMessage({});
                streamedMessageRef.current = '';
                setIsTyping(false);
            }
            audioQueue.current = [];
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            isPlayingAudio.current = false;
            setIsSystemAudioComplete(true);
            if (isCallActive) {
                setIsCallActive(false);
            }
        }
    }, [stopRecording, data?.templateBySlug?.id, messages, isCallActive]);

    const handleStartCall = useCallback(async() => {
        if(selectedType.isAutomatic) {
            setIsCallActive(true);
            setIsSystemAudioComplete(false);
            setIsUserInitiatedStop(false);
            handleStartRecording();
        } else {
            handleStartRecording();
        }
    }, [handleStartRecording, selectedType]);

    useEffect(() => {
        let recordingTimer;
        let countdownTimer;
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
                    handleStopRecording(false);
                }, recordingDuration * 1000);
            } else if (isSystemAudioComplete) {
                handleStartRecording();
                setIsSystemAudioComplete(false);
            }
        }

        return () => {
            clearTimeout(recordingTimer);
        };
    }, [isCallActive, isRecording, isSystemAudioComplete, recordingDuration, handleStartRecording, handleStopRecording, selectedType, isUserInitiatedStop]);
    
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const isEmpty = (obj) => Object.keys(obj).length === 0;

    if (loading || typeLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages && messages.map((message, index) => (
                        <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))}
                    {!isEmpty(userStreamedContent) && (
                        <ChatMessage message={{ role: 'user', content: userStreamedContent }} />
                    )}
                    {!isEmpty(currentStreamedMessage) &&  (
                        <ChatMessage message={{ role: currentStreamedMessage.role, content: currentStreamedMessage.content }} />
                    )}
                    {isRecording && isEmpty(currentStreamedMessage) && (
                        <ChatMessage message={{ role: 'user', content: selectedType.isAutomatic ? `Listening...(${formatTime(remainingTime)} remaining)` : 'Listening...' }} />
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
                />
                <TypeSettingsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    types={enableTypes?.types || []}
                    onSelectType={handleSelectType}
                    selectedType={selectedType}
                />
            </div>
        </>
    );
}

export default Template;