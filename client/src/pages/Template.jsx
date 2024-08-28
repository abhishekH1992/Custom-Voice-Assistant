import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { SEND_MESSAGE } from '../graphql/mutations/conversation.mutation';

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
    const isStreamingRef = useRef(false);
    const streamedMessageRef = useRef('');
    const chatContainerRef = useRef(null);

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
                streamedMessageRef.current += newContent;
                setCurrentStreamedMessage(streamedMessageRef.current);
                isStreamingRef.current = true;
            } else if (isStreamingRef.current) {
                setMessages(prev => [...prev, { type: 'system', content: streamedMessageRef.current }]);
                setCurrentStreamedMessage('');
                streamedMessageRef.current = '';
                isStreamingRef.current = false;
            }
        }
    });

    useEffect(() => {
        if (!isStreamingRef.current && currentStreamedMessage) {
            setMessages(prev => [...prev, { type: 'system', content: currentStreamedMessage }]);
            setCurrentStreamedMessage('');
        }
    }, [currentStreamedMessage]);

    if (loading || typeLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const handleSendMessage = async (message) => {
        currentStreamedMessage ? 
            setMessages(prevMessages => [...prevMessages, { type: 'system', content: currentStreamedMessage }, { type: 'user', content: message }]) :
            setMessages(prevMessages => [...prevMessages, { type: 'user', content: message }])
        setCurrentStreamedMessage('');
        streamedMessageRef.current = '';
        isStreamingRef.current = false;
        try {
            await sendMessage({
                variables: {
                    templateId: data?.templateBySlug?.id,
                    message: message
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 m-auto items-center overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                    {currentStreamedMessage && (
                        <ChatMessage message={{ type: 'system', content: currentStreamedMessage }} isStreaming={true} />
                    )}
                </div>
                <ChatBottom onSendMessage={handleSendMessage} />
            </div>
        </>
    );
}

export default Template;