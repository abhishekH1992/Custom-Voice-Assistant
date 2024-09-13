import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Ruler } from 'lucide-react';

const MessageLengthChart = ({ data }) => {
    const chartData = data.map((message, index) => ({
        index: index + 1,
        length: message.content.split(' ').length,
        role: message.role
    }));

    return (
        <div>
            <div className="text-md justify-center font-semibold mb-4 flex gap-2 text-center"><Ruler /> Message Length Over Time</div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: 'Message Number', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Word Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="length" stroke="#82ca9d" name="Message Length" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MessageLengthChart;