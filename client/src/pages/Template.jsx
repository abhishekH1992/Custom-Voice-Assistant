import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { ScrollShadow } from '@nextui-org/react';

const CHAT_SUBSCRIPTION = gql`
  subscription ChatResponse($message: String!) {
    chatResponse(message: $message) {
      content
      done
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($message: String!) {
    sendMessage(message: $message)
  }
`;

const Template = () => {
    const { templateSlug } = useParams();
    const [messages, setMessages] = useState([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const latestMessageRef = useRef('');
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

    const [sendMessage] = useMutation(SEND_MESSAGE);

    const { data: subscriptionData } = useSubscription(CHAT_SUBSCRIPTION, {
        variables: { message: latestMessageRef.current },
        skip: !isStreaming,
    });

    useEffect(() => {
        if (subscriptionData) {
            const { content, done } = subscriptionData.chatResponse;
            console.log(content, done);
            if (content) {
                setCurrentResponse(prev => {
                    const lines = (prev + content).split('\n');
                    return lines.map(line => line.trim()).join('\n');
                });
            }

            if (done) {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { type: 'bot', content: currentResponse + content }
                ]);
                setCurrentResponse('');
                setIsStreaming(false);
            }
        }
    }, [subscriptionData]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentResponse]);

    const handleSendMessage = async (message) => {
        setMessages(prevMessages => [...prevMessages, { type: 'user', content: message }]);
        setCurrentResponse('');
        setIsStreaming(true);
        latestMessageRef.current = message;
        await sendMessage({ variables: { message } });
    };

    if (loading || typeLoading) return <div>Loading...</div>;

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 m-auto items-center overflow-hidden">
                <ScrollShadow ref={scrollRef} className="flex-grow p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                    {isStreaming && (
                        <ChatMessage 
                            message={{ 
                                type: 'bot', 
                                content: currentResponse.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i < currentResponse.split('\n').length - 1 && <br />}
                                    </span>
                                ))
                            }} 
                        />
                    )}
                </ScrollShadow>
                <ChatBottom onSendMessage={handleSendMessage} disabled={isStreaming} />
            </div>
        </>
    );
}

export default Template;