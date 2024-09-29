import { Card, CardBody, Chip, Tooltip } from "@nextui-org/react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const OverviewCard = ({ data }) => {
    const getChipColor = (value) => {
        const numValue = parseFloat(value);
        if (numValue <= 2) return "danger";
        if (numValue <= 3.5) return "warning";
        return "success";
    };

    const chartData = [
        { subject: 'Sentiment', A: parseFloat(data.sentiment) },
        { subject: 'Awareness', A: parseFloat(data.awareness) },
        { subject: 'Proactive', A: parseFloat(data.proactive) },
    ];

    return (
        <Card className="p-4">
            <CardBody>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Call Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Abstract Summary</h4>
                        <p className="text-sm">{data.abstractSummary}</p>
                        </div>
                        <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Key Points</h4>
                        <p className="text-sm">{data.keyPoints}</p>
                        </div>
                        <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Action Item</h4>
                        <p className="text-sm">{data.actionItem}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-4">Performance Metrics</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                <Radar name="Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between mt-4">
                            <Tooltip content={`Score: ${data.sentiment} / 5`}>
                                <Chip color={getChipColor(data.sentiment)}>Sentiment</Chip>
                            </Tooltip>
                            <Tooltip content={`Score: ${data.awareness} / 5`}>
                                <Chip color={getChipColor(data.awareness)}>Awareness</Chip>
                            </Tooltip>
                            <Tooltip content={`Score: ${data.proactive} / 5`}>
                                <Chip color={getChipColor(data.proactive)}>Proactive</Chip>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default OverviewCard;