import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartLine } from 'lucide-react';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

const SentimentAnalysis = ({ data }) => {
    const analyzeSentiment = (messages) => {
        return messages.map((message, index) => {
            const analysis = sentiment.analyze(message.content);
            return {
                index: index + 1,
                sentiment: analysis.comparative,
                role: message.role,
                content: message.content
            };
        });
    };

    const sentimentData = analyzeSentiment(data);

    return (
        <div>
            <div className="text-md font-semibold mb-4 flex gap-2 text-center justify-center"><ChartLine /> Sentiment Analysis</div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: 'Message Number', position: 'insideBottom', offset: -10 }} />
                    <YAxis domain={[-1, 1]} label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                        content={({ payload, label }) => {
                            if (payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white border p-2">
                                        <p>Message: {label}</p>
                                        <p>Role: {data.role.toUpperCase()}</p>
                                        <p>Sentiment: {data.sentiment.toFixed(2)}</p>
                                        <p>Content: {data.content.substring(0, 50)}...</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Sentiment" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SentimentAnalysis;