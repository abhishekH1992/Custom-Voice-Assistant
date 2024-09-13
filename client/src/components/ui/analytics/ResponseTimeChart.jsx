import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Timer } from 'lucide-react';

const ResponseTimeChart = ({ data }) => {
    // This assumes each message has a timestamp. Adjust as necessary.
    const chartData = data.slice(1).map((message, index) => {
        const prevMessage = data[index];
        const responseTime = (new Date(message.timestamp) - new Date(prevMessage.timestamp)) / 1000; // in seconds
        return {
            index: index + 1,
            responseTime,
            role: message.role
        };
    });

    return (
        <div>
            <div className="text-md font-semibold mb-4 flex gap-2"><Timer /> Response Time</div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: 'Message Number', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Response Time (s)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="responseTime" fill="#8884d8" name="Response Time" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ResponseTimeChart;