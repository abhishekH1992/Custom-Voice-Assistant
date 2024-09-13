import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ME_QUERY } from '../graphql/queries/me.query';
import { useQuery } from '@apollo/client';
import { GET_SAVED_CHAT } from '../graphql/queries/chat.query';
import SentimentAnalysis from '../components/ui/analytics/SentimentAnalysis';
import WordCloud from '../components/ui/analytics/WordCloud';
import ConversationTable from '../components/ui/analytics/ConversationTable';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import MessageLengthChart from '../components/ui/analytics/MessageLengthChart';
import ResponseTimeChart from '../components/ui/analytics/ResponseTimeChart';
import KeywordFrequencyChart from '../components/ui/analytics/KeywordFrequencyChart';
import SpeakerTalkTimeChart from '../components/ui/analytics/SpeakerTalkTimeChart';

const Feedback = () => {
    const { templateSlug, savedChatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [chatName, setChatName] = useState('');

    const { loading: userLoading, data: userData } = useQuery(ME_QUERY);

    const { data: templateData, loading: templateLoading } = useQuery(GET_TEMPLATE_BY_SLUG, {
        variables: {
            slug: templateSlug
        }
    });

    const { data: savedChat, loading: savedChatLoading } = useQuery(GET_SAVED_CHAT, {
        variables: {
            savedChatId,
            userId: userData?.me?.id
        },
        skip: !userData?.me?.id,
    });

    useEffect(() => {
        if (savedChat && savedChat.getSavedChatById) {
            const { chats, name } = savedChat.getSavedChatById;
            const transformedChats = Object.values(chats).filter(chat => typeof chat === 'object').map(({ role, content }) => ({ role, content }));
            setMessages(transformedChats);
            setChatName(name);
        }
    }, [savedChat]);

    if (savedChatLoading || userLoading || templateLoading) return <p>Loading...</p>;

    return (
        <div className="flex flex-col min-h-screen">
            <Header name={chatName || templateData?.templateBySlug?.aiRole} icon={templateData?.templateBySlug?.icon}/>
            <div className="flex-grow max-w-940 m-auto overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <SentimentAnalysis data={messages} />
                        <MessageLengthChart data={messages} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <SpeakerTalkTimeChart data={messages} />
                        <KeywordFrequencyChart data={messages} />
                    </div>
                    <ResponseTimeChart data={messages} />
                    <WordCloud data={messages} />
                    <ConversationTable data={messages} />
                </div>
            </div>
        </div>
    );
}

export default Feedback;