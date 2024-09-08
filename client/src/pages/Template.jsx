import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { SEND_MESSAGE, START_RECORDING, STOP_RECORDING, SEND_AUDIO_DATA } from '../graphql/mutations/conversation.mutation';

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const isStreamingRef = useRef(false);
    const streamedMessageRef = useRef('');
    const chatContainerRef = useRef(null);
    const [isAudioType, setIsAudioType] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);

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

    const { data: subscriptionData } = useSubscription(MESSAGE_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            console.log(subscriptionData);
            const newContent = subscriptionData?.data?.messageStreamed;
            if (newContent !== undefined) {
                if (streamedMessageRef.current === '') {
                    setIsTyping(false);
                }
                streamedMessageRef.current += newContent;
                setCurrentStreamedMessage(streamedMessageRef.current);
                isStreamingRef.current = true;
            } else if (isStreamingRef.current) {
                setMessages(prev => [...prev, { role: 'system', content: streamedMessageRef.current }]);
                setCurrentStreamedMessage('');
                streamedMessageRef.current = '';
                isStreamingRef.current = false;
            }
        }
    });

    useEffect(() => {
        console.log(currentStreamedMessage);
        if (!isStreamingRef.current && currentStreamedMessage) {
            setMessages(prev => [...prev, { role: 'system', content: currentStreamedMessage }]);
            setCurrentStreamedMessage('');
        }
    }, [currentStreamedMessage]);

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
            const newMessages = currentStreamedMessage
                ? [...prevMessages, { role: 'system', content: currentStreamedMessage }, { role: 'user', content: message }]
                : [...prevMessages, { role: 'user', content: message }];
            sendMessageToServer(newMessages);
            return newMessages;
        });

        setCurrentStreamedMessage('');
        streamedMessageRef.current = '';
        isStreamingRef.current = false;
        setIsTyping(true);
    }, [currentStreamedMessage, sendMessageToServer]);

    const handleStartRecording = useCallback(async () => {
        try {
            await startRecording();
            setIsRecording(true);
            setCurrentStreamedMessage('');
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
    }, [startRecording, sendAudioData]);

    const handleStopRecording = useCallback(async () => {
        setIsRecording(false);
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
    }, [stopRecording, data?.templateBySlug?.id, messages]);
    // console.log(currentStreamedMessage);

    if (loading || typeLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))}
                    {currentStreamedMessage && currentStreamedMessage.content && (
                        <ChatMessage message={{ role: currentStreamedMessage.role, content: currentStreamedMessage.content }} isStreaming={true} />
                    )}
                    {isTyping && !currentStreamedMessage && (
                        <ChatMessage message={{ role: 'system', content: 'Thining...' }} isTyping={true} />
                    )}
                </div>
                <ChatBottom 
                    isAudioType={isAudioType}
                    onSendMessage={handleSendMessage}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    isRecording={isRecording}
                />
            </div>
        </>
    );
}

export default Template;