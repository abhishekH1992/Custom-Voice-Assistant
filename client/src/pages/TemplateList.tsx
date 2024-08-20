import { useQuery } from "@apollo/client";
import { GET_TEMPLATES } from '../graphql/queries/templates.query';
import { useTheme } from "../context/ThemeContext";
import CardSkeleton from '../components/ui/CardSkeleton';
import TemplateCard from "../components/ui/TemplateCard";
import { Link } from "@nextui-org/react";

interface Template {
    aiRole: string;
    icon: string;
    description: string;
    slug: string;
}

interface TemplatesQueryResult {
    templates: Template[];
}

const TemplateChat = () => {
    const { data, loading } = useQuery<TemplatesQueryResult>(GET_TEMPLATES, {
        variables: {
            isActive: true
        }
    });
    const { theme } = useTheme();

    return (
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
                        <Link href={`template/${template.slug}`} className="w-full">
                            <TemplateCard template={template} theme={theme} />
                        </Link>
                    </div>
                ))
            )}
        </div>
    );
}

export default TemplateChat;