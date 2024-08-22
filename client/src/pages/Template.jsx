import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import CallControlPanel from '../components/ui/AudioWave.jsx';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { ScrollShadow } from '@nextui-org/react';
import { ASK_AI } from '../graphql/mutations/conversations.mutation';
import { SUBSCRIPTION_AI } from '../graphql/mutations/conversations.mutation';

const Template = () => {
    const { templateSlug } = useParams();
    const [isType, setIsType] = useState();
    const [messages, setMessages] = useState([]);
    const [streamingMessage, setStreamingMessage] = useState('');

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

    const [askAI] = useMutation(ASK_AI);

    const { data: subscriptionData } = useSubscription(SUBSCRIPTION_AI, {
        variables: { 
            templateId: parseInt(data?.templateBySlug?.id), 
            newMessage: messages[messages.length - 1]?.content || '',
            history: messages.map(({ type, content }) => ({ role: type, content }))
        },
        skip: !data?.templateBySlug?.id || messages.length === 0,
    });

    useEffect(() => {
        if (subscriptionData?.streamingResponse) {
            setStreamingMessage(prev => prev + subscriptionData.streamingResponse);
        }
    }, [subscriptionData]);

    useEffect(() => {
        if (streamingMessage) {
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.type === 'assistant') {
                    newMessages[newMessages.length - 1].content = streamingMessage;
                } else {
                    newMessages.push({ type: 'assistant', content: streamingMessage });
                }
                return newMessages;
            });
        }
    }, [streamingMessage]);

    const handleSendMessage = async (message) => {
        const newUserMessage = { type: 'user', content: message };
        setMessages(prev => [...prev, newUserMessage]);
        setStreamingMessage('');
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

    if (loading || typeLoading) return <div>Loading...</div>;

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 m-auto items-center overflow-hidden">
                <ScrollShadow className="flex-grow p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                    {streamingMessage && (
                        <ChatMessage message={{ type: 'assistant', content: streamingMessage }} />
                    )}
                </ScrollShadow>
                <ChatBottom onSendMessage={handleSendMessage} />
            </div>
        </>
    );
}

export default Template;