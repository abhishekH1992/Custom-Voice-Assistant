import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Command } from 'lucide-react';

const KeywordFrequencyChart = ({ data }) => {
    // Function to count word frequency
    const getWordFrequency = (text) => {
        const words = text.toLowerCase().match(/\b\w+\b/g);
        return words ? words.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {}) : {};
    };

    // Combine all message content
    const allText = data.map(message => message.content || '').join(' ');

    // Get word frequency
    const wordFrequency = getWordFrequency(allText);

    // Filter out common words (you can expand this list)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after', 'you']);
    const filteredFrequency = Object.entries(wordFrequency)
        .filter(([word]) => !commonWords.has(word) && word.length > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const chartData = filteredFrequency.map(([keyword, count]) => ({
        keyword,
        count
    }));

    if (chartData.length === 0) {
        return (
            <div className="text-center p-4">
                <Command className="mx-auto mb-2" />
                <p className="text-md font-semibold">No keywords found</p>
                <p className="text-sm text-gray-500">There isn't enough text to analyze or all words are common words.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="text-md justify-center font-semibold mb-4 flex gap-2 text-center">
                <Command /> Top 5 Keywords Frequency
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="keyword" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Frequency" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default KeywordFrequencyChart;