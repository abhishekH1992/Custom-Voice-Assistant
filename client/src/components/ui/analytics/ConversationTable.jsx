import React from "react";
import { Headphones } from "lucide-react";
import Sentiment from "sentiment";
import { useTheme } from "../../../context/ThemeContext";

const sentiment = new Sentiment();

const ConversationTable = ({ data }) => {
    const { theme } = useTheme();

    const generateImprovement = (content) => {
        const analysis = sentiment.analyze(content);
        const score = analysis.score;

        if (score < -2) {
            return "Your message seems quite negative. Try to use more positive language to build rapport.";
        } else if (score < 0) {
            return "Your message has a slightly negative tone. Consider rephrasing to be more neutral or positive.";
        } else if (score === 0) {
            return "Your message is neutral. Try to be more engaging or enthusiastic if appropriate.";
        } else if (score <= 2) {
            return "Good positive tone. You could try to be even more specific or detailed in your response.";
        } else {
            return "Excellent positive tone! Keep up the good work and continue to address the customer's needs.";
        }
    };

    const isDark = theme === 'dark';

    return (
        <div className={isDark ? 'text-white' : 'text-black'}>
            <div className={`text-md font-semibold mb-4 flex gap-2`}>
                <Headphones /> Conversation Analysis
            </div>
            <div className="overflow-x-auto">
                <table className={`min-w-full border-collapse ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <thead>
                        <tr>
                            <th className={`px-4 py-2 text-left border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>Role</th>
                            <th className={`px-4 py-2 text-left border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>Content</th>
                            <th className={`px-4 py-2 text-left border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>Sentiment Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((message, index) => (
                            <tr key={index} className={index % 2 === 0 
                                ? (isDark ? 'bg-gray-800' : 'bg-white')
                                : (isDark ? 'bg-gray-700' : 'bg-gray-50')
                            }>
                                <td className={`px-4 py-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                    {message.role.toUpperCase()}
                                </td>
                                <td className={`px-4 py-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                    {message.content}
                                </td>
                                <td className={`px-4 py-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                    {message.role === 'user' && generateImprovement(message.content)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConversationTable;