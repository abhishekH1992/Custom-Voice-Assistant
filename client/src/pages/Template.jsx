import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION, AUDIO_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { SEND_MESSAGE, START_RECORDING, STOP_RECORDING, SEND_AUDIO_DATA } from '../graphql/mutations/conversation.mutation';

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isAudioChatType, setIsAudioChatType] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioQueue, setAudioQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLastChunkReceived, setIsLastChunkReceived] = useState(false);
    const isStreamingRef = useRef(false);
    const currentRoleRef = useRef('');
    const chatContainerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(new Audio());

    const { data, loading } = useQuery(GET_TEMPLATE_BY_SLUG, {
        variables: { slug: templateSlug }
    });

    const { data: enableTypes, loading: typeLoading } = useQuery(GET_ENABLE_TYPES, {
        variables: { isActive: true }
    });

    const [sendMessage] = useMutation(SEND_MESSAGE);
    const [startRecording] = useMutation(START_RECORDING);
    const [stopRecording] = useMutation(STOP_RECORDING);
    const [sendAudioData] = useMutation(SEND_AUDIO_DATA);

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStreamedMessage, scrollToBottom]);

    const handleMessageStreamed = useCallback(({ content }) => {
        if (content !== undefined) {
            setIsTyping(false);
            if(isStreamingRef.current === '') {
                currentRoleRef.current = 
            }
            setCurrentStreamedMessage(prevMessage => prevMessage + content);
        } else if (isStreamingRef.current) {
            setMessages(prevMessages => [...prevMessages, { role: currentRoleRef.current, content: currentStreamedMessage }]);
            setCurrentStreamedMessage('');
            currentRoleRef.current = '';
            isStreamingRef.current = false;
            setIsTyping(true);
        }
    }, []);

    useSubscription(MESSAGE_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { messageStreamed } = subscriptionData.data;
            handleMessageStreamed(messageStreamed);
        }
    });

    useSubscription(AUDIO_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const { audioStreamed } = subscriptionData.data;
            if (audioStreamed && audioStreamed.audio) {
                setAudioQueue(prevQueue => [...prevQueue, audioStreamed.audio]);
                if (audioStreamed.isLast) {
                    setIsLastChunkReceived(true);
                }
            }
        }
    });

    useEffect(() => {
        const playNextAudio = () => {
            if (audioQueue.length > 0 && !isPlaying) {
                setIsPlaying(true);
                const audioChunk = audioQueue[0];
                const byteCharacters = atob(audioChunk);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'audio/mpeg' });
                
                const audioUrl = URL.createObjectURL(blob);
                audioRef.current.src = audioUrl;
                
                audioRef.current.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    setAudioQueue(prevQueue => prevQueue.slice(1));
                    setIsPlaying(false);
                };

                audioRef.current.onerror = (error) => {
                    console.error('Error playing audio:', error);
                    URL.revokeObjectURL(audioUrl);
                    setAudioQueue(prevQueue => prevQueue.slice(1));
                    setIsPlaying(false);
                };

                audioRef.current.play().catch(error => {
                    console.error('Error starting audio playback:', error);
                    URL.revokeObjectURL(audioUrl);
                    setAudioQueue(prevQueue => prevQueue.slice(1));
                    setIsPlaying(false);
                });
            }
        };

        playNextAudio();

        if (audioQueue.length === 0 && isLastChunkReceived) {
            console.log('Finished playing all audio chunks');
            setIsLastChunkReceived(false);
        }
    }, [audioQueue, isPlaying, isLastChunkReceived]);

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
            const newMessages = [...prevMessages, { role: 'user', content: message }];
            sendMessageToServer(newMessages);
            return newMessages;
        });
        setIsTyping(true);
    }, [sendMessageToServer]);

    const handleStartRecording = useCallback(async () => {
        try {
            await startRecording();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

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
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }, [startRecording, sendAudioData]);

    const handleStopRecording = useCallback(async () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            await stopRecording({
                variables: {
                    templateId: data?.templateBySlug?.id,
                    messages: messages
                }
            });
        }
    }, [stopRecording, data?.templateBySlug?.id, messages]);

    if (loading || typeLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))}
                    {(isRecording || currentStreamedMessage) && (
                        <ChatMessage 
                            message={{ 
                                role: currentRoleRef.current || 'system', 
                                content: isRecording ? 'Recording...' : 
                                         !isRecording && !currentStreamedMessage ? 'Transcribing...' : 
                                         currentStreamedMessage 
                            }} 
                        />
                    )}
                </div>
                <ChatBottom 
                    onSendMessage={handleSendMessage} 
                    isAudioChatType={isAudioChatType}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    isRecording={isRecording}
                />
            </div>
        </>
    );
};

export default Template;