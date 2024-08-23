import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { ScrollShadow } from '@nextui-org/react';
import { ASK_AI } from '../graphql/mutations/conversations.mutation';
import { AI_RESPONSE_STREAM } from '../graphql/subscriptions/conversations.subscription';

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [askAI] = useMutation(ASK_AI);

    const { data, loading } = useQuery(GET_TEMPLATE_BY_SLUG, {
        variables: { slug: templateSlug }
    });

    const { data: enableTypes, loading: typeLoading } = useQuery(GET_ENABLE_TYPES, {
        variables: { isActive: true }
    });

    const { data: streamData } = useSubscription(AI_RESPONSE_STREAM, {
        variables: { templateId: parseInt(data?.templateBySlug?.id) },
        skip: !data?.templateBySlug?.id,
    });

    useEffect(() => {
        if (streamData?.aiResponseStream) {
            const { chunk, done } = streamData.aiResponseStream;
            if (!done) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1].type === 'assistant') {
                        newMessages[newMessages.length - 1].content += chunk;
                    } else {
                        newMessages.push({ type: 'assistant', content: chunk });
                    }
                    return newMessages;
                });
            }
        }
    }, [streamData]);

    useEffect(() => {
        // Scroll to bottom when messages change
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [messages]);

    if (loading || typeLoading) return <div>Loading...</div>;

    const handleSendMessage = async (message) => {
        const newUserMessage = { type: 'user', content: message };
        setMessages(prev => [...prev, newUserMessage]);

        try {
            await askAI({ 
                variables: { 
                    templateId: parseInt(data.templateBySlug.id), 
                    newMessage: message,
                    history: messages.map(({ type, content }) => ({ role: type, content }))
                } 
            });
        } catch (err) {
            console.error('Error asking AI:', err);
            setMessages(prev => [...prev, { type: 'system', content: 'Error: Unable to get response from AI' }]);
        }
    };

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 m-auto items-center overflow-hidden">
                <ScrollShadow className="flex-grow p-4 overflow-y-auto scrollbar-hide mb-40 messages-container">
                    {messages && messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                </ScrollShadow>
                <ChatBottom onSendMessage={handleSendMessage} />
            </div>
        </>
    );
}

export default Template;