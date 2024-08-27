import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { ScrollShadow } from '@nextui-org/react';

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [tempMsg, setTempMsg] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollRef = useRef(null);

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
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, tempMsg]);

    if (loading || typeLoading) return <div>Loading...</div>;

    const handleSendMessage = async (message) => {
        try {
            setMessages(prevMessages => [...prevMessages, { type: 'user', content: message }]);
            setIsStreaming(true);
            setTempMsg('');

            const response = await fetch("http://localhost:4000/aiCompletion", {
                method: "POST",
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userPrompt: message }),
            });

            if (!response.ok || !response.body) {
                throw new Error(response.statusText || 'Network response was not ok');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const decodedChunk = decoder.decode(value, { stream: true });
                setTempMsg(prev => prev + decodedChunk);
            }
            console.log(tempMsg);
            setMessages(prevMessages => [...prevMessages, { type: 'assistant', content: tempMsg }]);
            setIsStreaming(false);
            // setTempMsg('');
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prevMessages => [...prevMessages, { type: 'error', content: 'Failed to send message. Please try again.' }]);
            setIsStreaming(false);
        }
    };

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 m-auto items-center overflow-hidden">
                <ScrollShadow className="flex-grow p-4 overflow-y-auto scrollbar-hide mb-40" ref={scrollRef}>
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                    {isStreaming && (
                        <div className="bg-gray-100 p-4 rounded-lg mt-2">
                            <p className="font-medium">Assistant is typing...</p>
                            <p>{tempMsg}</p>
                        </div>
                    )}
                </ScrollShadow>
                <ChatBottom onSendMessage={handleSendMessage} />
            </div>
        </>
    );
}

export default Template;