import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import CallControlPanel from '../components/ui/AudioWave';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';

interface TemplateProps {
    id: number;
    aiRole: string;
    icon: string;
    description: string;
    slug: string;
    prompt: string;
    isVoice: boolean;
}

interface TemplateBySlugQueryResult {
    templateBySlug: TemplateProps;
}

interface TypesProps {
    id: number;
    name: string;
    description: string;
    isAudio: boolean;
    duration: number;
    isText: boolean;
    icon: string;
}

interface TypesQueryResult {
    types: TypesProps[];
}

interface MessageProps {
    type: 'system' | 'user' | 'assistant';
    content: string;
    chart?: boolean;
}

const Template: React.FC = () => {
    const { templateSlug } = useParams<{ templateSlug: string }>();
    const [isType, setIsType] = useState<number | undefined>();

    const [messages, setMessages] = useState<MessageProps[]>([
        { type: 'system', content: 'Please log in or sign up to save and revisit your chat history!' },
        { type: 'user', content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry...' },
        { type: 'assistant', content: 'I can help you with stock trading. If you\'re interested, I can show you the trending stocks or provide you with the current price of a specific stock. Just let me know what you\'d like to do!' },
        { type: 'user', content: 'What\'s the bitcoin trend?' },
        { type: 'assistant', content: 'Here\'s the current trend for Bitcoin (BTC):', chart: true },
    ]);

    const { data, loading } = useQuery<TemplateBySlugQueryResult>(GET_TEMPLATE_BY_SLUG, {
        variables: {
            slug: templateSlug
        }
    });

    const { data: enableTypes, loading: typeLoading } = useQuery<TypesQueryResult>(GET_ENABLE_TYPES, {
        variables: {
            isActive: true
        }
    });

    if (loading || typeLoading) return <div>Loading...</div>;

    const handleSendMessage = (message: string) => {
        setMessages(prevMessages => [...prevMessages, { type: 'user', content: message }]);
        // Here you would typically send the message to your AI backend
        // and then add the response to the messages array
    };

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen">
                <div className="flex-grow overflow-auto p-4">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                </div>
                <ChatBottom onSendMessage={handleSendMessage} />
            </div>
        </>
    );
}

export default Template;