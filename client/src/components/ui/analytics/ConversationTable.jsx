import { useTheme } from "../../../context/ThemeContext";
import { Card, CardBody } from "@nextui-org/react";

const ConversationTable = ({ data, capitalizeFirstLetter }) => {
    const { theme } = useTheme();

    const isDark = theme === 'dark';

    return (
        <Card className="p-4">
            <CardBody>
                <div className={isDark ? 'text-white' : 'text-black'}>
                 <div className="text-lg font-semibold mb-4 text-gray-800">Conversation Analysis</div>
                    <div className="overflow-x-auto">
                        <table className={`min-w-full border-collapse ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <thead>
                                <tr>
                                    <th className={`px-4 py-2 text-left border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>Role</th>
                                    <th className={`px-4 py-2 text-left border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>Content</th>
                                    <th className={`px-4 py-2 text-left border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>Feedback</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((message, index) => (
                                    <tr key={index} className={index % 2 === 0 
                                        ? (isDark ? 'bg-gray-800' : 'bg-white')
                                        : (isDark ? 'bg-gray-700' : 'bg-gray-50')
                                    }>
                                        <td className={`px-4 py-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                            {capitalizeFirstLetter(message.role)}
                                        </td>
                                        <td className={`px-4 py-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                            {message.content}
                                        </td>
                                        <td className={`px-4 py-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                            {message.feedback}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default ConversationTable;