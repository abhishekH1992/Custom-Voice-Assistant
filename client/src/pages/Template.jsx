import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION, AUDIO_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { SEND_MESSAGE, SEND_AUDIO } from '../graphql/mutations/conversation.mutation';


const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const isStreamingRef = useRef(false);
    const streamedMessageRef = useRef('');
    const chatContainerRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

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
    const [sendAudio] = useMutation(SEND_AUDIO);

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

    const { data: audioSubscriptionData } = useSubscription(AUDIO_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const newAudioUrl = subscriptionData?.data?.audioStreamed;
            if (newAudioUrl) {
                setAudioUrl(newAudioUrl);
                setMessages(prev => [...prev, { role: 'system', content: 'Audio response', audioUrl: newAudioUrl }]);
            }
        }
    });

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await sendAudioToServer(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const sendAudioToServer = async (audioBlob) => {
        try {
            await sendAudio({
                variables: {
                    templateId: 1,
                    audio: audioBlob
                }
            });
        } catch (error) {
            console.error('Error sending audio:', error);
        }
    };

    useEffect(() => {
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
        setIsTyping(true);  // Set typing to true when a new message is sent
    }, [currentStreamedMessage, sendMessageToServer]);

    if (loading || typeLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 mx-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.role}-${index}`} message={message} />
                    ))}
                    {currentStreamedMessage && (
                        <ChatMessage message={{ role: 'system', content: currentStreamedMessage }} isStreaming={true} />
                    )}
                    {isTyping && !currentStreamedMessage && (
                        <ChatMessage message={{ role: 'system', content: 'Thining...' }} isTyping={true} />
                    )}
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white">
                    {/* <ChatBottom onSendMessage={handleSendMessage} /> */}
                    <div className="mt-2 flex justify-center">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`px-4 py-2 rounded ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                        >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Template;