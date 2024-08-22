import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import { GET_ENABLE_TYPES } from '../graphql/queries/types.query';
import CallControlPanel from '../components/ui/AudioWave.jsx';
import ChatMessage from '../components/ui/ChatMessage';
import ChatBottom from '../components/ui/ChatBottom';
import { ScrollShadow } from '@nextui-org/react';

const Template = () => {
    const { templateSlug } = useParams();
    const [isType, setIsType] = useState();

    const [messages, setMessages] = useState([]);

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

    if (loading || typeLoading) return <div>Loading...</div>;

    const handleSendMessage = (message) => {
        setMessages(prevMessages => [...prevMessages, { type: 'user', content: message }]);
    };

    return (
        <>
            <Header name={data?.templateBySlug?.aiRole} icon={data?.templateBySlug?.icon} />
            <div className="flex flex-col h-screen relative max-w-940 m-auto items-center overflow-hidden">
                <ScrollShadow className="flex-grow p-4 overflow-y-auto scrollbar-hide mb-40">
                    {messages && messages.map((message, index) => (
                        <ChatMessage key={`${message.type}-${index}`} message={message} />
                    ))}
                </ScrollShadow>
                <ChatBottom onSendMessage={handleSendMessage} />
                {/* <CallControlPanel /> */}
            </div>
        </>
    );
}

export default Template;