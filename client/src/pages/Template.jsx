import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { MESSAGE_SUBSCRIPTION } from '../graphql/subscriptions/message.subscription';
import { SEND_MESSAGE } from '../graphql/mutations/sendMessage.mutation';

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
    const isStreamingRef = useRef(false);

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

    const { data: subscriptionData } = useSubscription(MESSAGE_SUBSCRIPTION, {
        variables: { templateId: data?.templateBySlug?.id },
        onSubscriptionData: ({ subscriptionData }) => {
            const newContent = subscriptionData?.data?.messageStreamed;
            if (newContent !== undefined) {
                setCurrentStreamedMessage(prev => prev + newContent);
                isStreamingRef.current = true;
            } else if (isStreamingRef.current) {
                setMessages(prev => [...prev, { type: 'system', content: currentStreamedMessage }]);
                setCurrentStreamedMessage('');
                isStreamingRef.current = false;
            }
        }
    });

    if (loading || typeLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const handleSendMessage = async (message) => {
        setMessages(prevMessages => [...prevMessages, { type: 'user', content: message }]);
        setCurrentStreamedMessage('');
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
                <div className="flex-grow w-full p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                    {currentStreamedMessage && (
                        <ChatMessage message={{ type: 'system', content: currentStreamedMessage }} />
                    )}
                </div>
                <ChatBottom onSendMessage={handleSendMessage} />
            </div>
        </>
    );
}

export default Template;