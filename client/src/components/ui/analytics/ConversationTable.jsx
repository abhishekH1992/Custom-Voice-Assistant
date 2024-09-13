import React from "react";
import { Headphones } from "lucide-react";

const ConversationTable = ({ data }) => {
    const generateImprovement = (content) => {
        const suggestions = [
            "Try to be more specific in your responses.",
            "Consider asking more open-ended questions.",
            "Provide more details about the product features.",
            "Try to address the customer's concerns more directly.",
            "Use more positive language to build rapport."
        ];
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    };

    return (
        <div className="text-gray-300">
            <div className="text-md font-semibold mb-4 flex gap-2">
                <Headphones className="text-gray-300" /> Conversation Analysis
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 border-collapse">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 bg-gray-700 text-left text-gray-300 border border-gray-600">Role</th>
                            <th className="px-4 py-2 bg-gray-700 text-left text-gray-300 border border-gray-600">Content</th>
                            <th className="px-4 py-2 bg-gray-700 text-left text-gray-300 border border-gray-600">Improvement Suggestion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((message, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                                <td className="px-4 py-2 border border-gray-600 text-gray-300">{message.role.toUpperCase()}</td>
                                <td className="px-4 py-2 border border-gray-600 text-gray-300">{message.content}</td>
                                <td className="px-4 py-2 border border-gray-600 text-gray-300">
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