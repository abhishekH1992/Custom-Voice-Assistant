import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Headset } from 'lucide-react';

const SpeakerTalkTimeChart = ({ data }) => {
    const talkTime = data && data.reduce((acc, message) => {
        acc[message.role] = (acc[message.role] || 0) + message.content.split(' ').length;
        return acc;
    }, {});

    const chartData = Object.entries(talkTime).map(([role, words]) => ({
        role: role === 'system' ? 'AI Assistant' : 'User',
        words,
        color: role === 'system' ? '#0088FE' : '#00C49F'
    }));

    return (
        <div>
            <div className="text-md justify-center font-semibold mb-4 flex gap-2 text-center">
                <Headset /> Speaker Talk Time Distribution
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis label={{ value: 'Number of Words', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        formatter={(value, name, props) => [`${value} words`, props.payload.role]}
                    />
                    <Legend />
                    <Bar dataKey="words" name="Word Count">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpeakerTalkTimeChart;