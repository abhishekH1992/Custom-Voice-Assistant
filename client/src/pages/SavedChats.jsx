import { useQuery } from "@apollo/client";
import Header from '../components/nav/Header';
import { GET_USER_SAVED_CHAT_LIST } from "../graphql/queries/chat.query";
import { ME_QUERY } from "../graphql/queries/me.query";
import { useTheme } from "../context/ThemeContext";
import CardSkeleton from '../components/ui/skeleton/CardSkeleton';
import TemplateCard from "../components/ui/TemplateCard";
import { Link } from "react-router-dom";

const SavedChats = () => {
    const { loading: userLoading, data: userData } = useQuery(ME_QUERY);
    const { data, loading } = useQuery(GET_USER_SAVED_CHAT_LIST, {
        variables: { userId: userData?.me?.id },
        skip: !userData?.me?.id,
    });
    const { theme } = useTheme();

    return (
        <>
            <Header name="Saved Chats" />
            <div className="px-6 my-5 sm:mt-6">
                <div className="grid grid-cols-1 gap-5 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 max-w-940 m-auto">
                    {loading || userLoading ? (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <CardSkeleton key={index} />
                            ))}
                        </>
                    ) : (
                        data?.getUsersSavedTemplateListByUserId.map((savedChat, index) => (
                            <div key={index}>
                                <Link to={`/template/${savedChat.template.slug}/${savedChat.id}`} className="w-full">
                                    <TemplateCard
                                        template={{
                                            name: savedChat.name,
                                            ...savedChat.template,
                                        }}
                                        theme={theme}
                                    />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default SavedChats;