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
import ConversationTable from '../components/ui/analytics/ConversationTable';

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
        variables: { slug: templateSlug }
    });

    const { data: savedChat, loading: savedChatLoading } = useQuery(GET_SAVED_CHAT_AND_GENERATE_FEEDBACK, {
        variables: { savedChatId, userId: userData?.me?.id },
        skip: !userData?.me?.id,
    });

    useEffect(() => {
        if (savedChat?.getSavedChatAndFeedbackById) {
            const { chats, name } = savedChat.getSavedChatAndFeedbackById;
            if (chats && typeof chats === 'object') {
                const transformedChats = Object.values(chats)
                    .filter(chat => chat && typeof chat === 'object')
                    .map(({ role, content }) => ({ role, content }));
                setMessages(transformedChats);
            }
            if (name) {
                setChatName(name);
            }
        }
    }, [savedChat]);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const feedback = savedChat?.getSavedChatAndFeedbackById?.feedback;
    const table = savedChat?.getSavedChatAndFeedbackById?.table;
    const renderFeedbackContent = () => {
        if (feedback) {
            return (
                <>
                    <div className="grid gap-4 md:gap-8">
                        {feedback.confidenceScore && (
                            <CardWithProgress confidenceData={feedback.confidenceScore} />
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {feedback.accentEmotionAnalysis && feedback.toneSentimentOverview && (
                            <AccentEmotionToneSentimentCard 
                                accentEmotion={feedback.accentEmotionAnalysis} 
                                toneSentiment={feedback.toneSentimentOverview}
                                capitalizeFirstLetter={capitalizeFirstLetter}
                            />
                        )}
                        <div className="sm:col-span-2 lg:col-span-3">
                            <SentimentAnalysis data={messages} />
                        </div>
                        {feedback.pronunciationAnalysis && (
                            <PronunciationCard data={feedback.pronunciationAnalysis} capitalizeFirstLetter={capitalizeFirstLetter}/>
                        )}
                        {feedback.interactionSpeed && (
                            <InteractionSpeedCard data={feedback.interactionSpeed} capitalizeFirstLetter={capitalizeFirstLetter}/>
                        )}
                        {feedback.loosingPromptContent && (
                            <LoosingPromptContentCard data={feedback.loosingPromptContent} capitalizeFirstLetter={capitalizeFirstLetter}/>
                        )}
                        {feedback.fillerWordAnalysis && (
                            <FillerWordCard data={feedback.fillerWordAnalysis} capitalizeFirstLetter={capitalizeFirstLetter}/>
                        )}
                        {feedback.overview && (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                                <OverviewCard data={feedback.overview}/>
                            </div>
                        )}
                        {messages && (
                            <div className='col-span-1 sm:col-span-2 lg:col-span-4'>
                                <WordCloud data={messages}/>
                            </div>
                        )}
                        {table && (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                                <ConversationTable data={table} capitalizeFirstLetter={capitalizeFirstLetter}/>
                            </div>
                        )}
                    </div>
                </>
            );
        } else {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-lg text-gray-500">No feedback available</p>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {userLoading || savedChatLoading || templateLoading ? (
                <Loader loaderItems={loaderItems} />
            ) : (
                <>
                    <Header name={chatName || templateData?.templateBySlug?.aiRole} icon={templateData?.templateBySlug?.icon}/>
                    <div className="w-full flex-grow m-auto overflow-y-auto">
                        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-4 md:space-y-8 h-full">
                            {renderFeedbackContent()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Feedback;