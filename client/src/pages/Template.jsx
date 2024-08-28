import React, { useState, useRef } from 'react';
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
                // End of stream
                setMessages(prev => [...prev, { type: 'ai', content: currentStreamedMessage }]);
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
        <div className="flex flex-col h-screen">
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex-grow overflow-hidden flex flex-col max-w-3xl mx-auto w-full">
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                    {currentStreamedMessage && (
                        <ChatMessage message={{ type: 'ai', content: currentStreamedMessage }} isStreaming={true} />
                    )}
                </div>
                <div className="p-4">
                    <ChatBottom onSendMessage={handleSendMessage} />
                </div>
            </div>
        </div>
    );
}

export default Template;