import { useQuery } from "@apollo/client";
import Header from '../components/nav/Header';
import { GET_TEMPLATES } from '../graphql/queries/templates.query';
import { useTheme } from "../context/ThemeContext";
import CardSkeleton from '../components/ui/CardSkeleton';
import TemplateCard from "../components/ui/TemplateCard";
import { Link } from "react-router-dom";

const TemplateChat = () => {
    const { data, loading } = useQuery(GET_TEMPLATES, {
        variables: {
            isActive: true
        }
    });
    const { theme } = useTheme();

    return (
        <>
            <Header name="Simulator" />
            <div className="px-6 my-5 sm:mt-6">
                <div className="grid grid-cols-1 gap-5 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 max-w-940 m-auto">
                    {loading ? (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <CardSkeleton key={index} />
                            ))}
                        </>
                    ) : (
                        data?.templates.map((template, index) => (
                            <div key={index}>
                                <Link to={`template/${template.slug}`} className="w-full">
                                    <TemplateCard template={template} theme={theme} />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default TemplateChat;