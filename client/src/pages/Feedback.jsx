import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ME_QUERY } from '../graphql/queries/me.query';
import { useQuery } from '@apollo/client';
import { GET_SAVED_CHAT_AND_GENERATE_FEEDBACK } from '../graphql/queries/chat.query';
import Header from '../components/nav/Header';
import { GET_TEMPLATE_BY_SLUG } from '../graphql/queries/templates.query';
import Loader from '../components/ui/Loader';
import CardWithProgress from '../components/ui/analytics/CardWithProgress';
import AccentEmotionToneSentimentCard from '../components/ui/analytics/AccentEmotionToneSentimentCard';
import PronunciationCard from '../components/ui/analytics/PronunciationCard';
import InteractionSpeedCard from '../components/ui/analytics/InteractionSpeedCard';
import FillerWordCard from '../components/ui/analytics/FillerWordCard';
import LoosingPromptContentCard from '../components/ui/analytics/LoosingPromptContentCard';
import OverviewCard from '../components/ui/analytics/OverviewCard';
import SentimentAnalysis from '../components/ui/analytics/SentimentAnalysis';
import WordCloud from '../components/ui/analytics/WordCloud';

const Feedback = () => {
    const { templateSlug, savedChatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [chatName, setChatName] = useState('');

    const loaderItems = [
        { text: 'Getting your chats' },
        { text: 'Doing clever things' },
        { text: 'Analysing your data' },
    ];

    const { loading: userLoading, data: userData } = useQuery(ME_QUERY);

    const { data: templateData, loading: templateLoading } = useQuery(GET_TEMPLATE_BY_SLUG, {
        variables: {
            slug: templateSlug
        }
    });

    const { data: savedChat, loading: savedChatLoading } = useQuery(GET_SAVED_CHAT_AND_GENERATE_FEEDBACK, {
        variables: {
            savedChatId,
            userId: userData?.me?.id
        },
        skip: !userData?.me?.id,
    });

    useEffect(() => {
        if (savedChat && savedChat?.getSavedChatAndFeedbackById) {
            const { chats, name } = savedChat.getSavedChatAndFeedbackById;
            const transformedChats = Object.values(chats).filter(chat => typeof chat === 'object').map(({ role, content }) => ({ role, content }));
            setMessages(transformedChats);
            setChatName(name);
        }
    }, [savedChat]);

    return (
        <div className="flex flex-col min-h-screen">
            {userLoading || savedChatLoading || templateLoading ? (
                <Loader loaderItems={loaderItems} />
            ) : (
                <>
                    <Header name={chatName || templateData?.templateBySlug?.aiRole} icon={templateData?.templateBySlug?.icon}/>
                    <div className="w-full flex-grow m-auto overflow-y-auto">
                        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                            <div className="grid gap-8">
                                <CardWithProgress confidenceData={savedChat?.getSavedChatAndFeedbackById?.feedback?.confidenceScore}/>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <AccentEmotionToneSentimentCard 
                                    accentEmotion={savedChat?.getSavedChatAndFeedbackById?.feedback?.accentEmotionAnalysis} 
                                    toneSentiment={savedChat?.getSavedChatAndFeedbackById?.feedback?.toneSentimentOverview}
                                />
                                <div className="col-span-3">
                                    <SentimentAnalysis data={messages} />
                                </div>
                                <PronunciationCard data={savedChat?.getSavedChatAndFeedbackById?.feedback?.pronunciationAnalysis}/>
                                <InteractionSpeedCard data={savedChat?.getSavedChatAndFeedbackById?.feedback?.interactionSpeed}/>
                                <LoosingPromptContentCard data={savedChat?.getSavedChatAndFeedbackById?.feedback?.loosingPromptContent}/>
                                <FillerWordCard data={savedChat?.getSavedChatAndFeedbackById?.feedback?.fillerWordAnalysis}/>
                                <div className="col-span-4">
                                    <OverviewCard data={savedChat?.getSavedChatAndFeedbackById?.feedback?.overview}/>
                                </div>
                                <div className='col-span-4'>
                                    <WordCloud data={messages}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Feedback;