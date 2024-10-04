import { Card, CardBody, Progress, Tooltip } from "@nextui-org/react";
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
                        <div className="grid mt-4">
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-semibold">Sentiment</p>
                                    <span className="text-sm">{Number(data.sentiment).toFixed(1)}</span>
                                </div>
                                <Tooltip content={`${Number(data.sentiment).toFixed(1)} / 5`} placement="right">
                                    <Progress 
                                        value={Math.min(Math.max(Number(data.sentiment) * 20, 0), 100)}
                                        maxValue={100}
                                        color={getChipColor(Number(data.sentiment))}
                                        className="h-2"
                                    />
                                </Tooltip>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-semibold">Awareness</p>
                                    <span className="text-sm">{Number(data.awareness).toFixed(1)}</span>
                                </div>
                                <Tooltip content={`${Number(data.awareness).toFixed(1)} / 5`} placement="right">
                                    <Progress 
                                        value={Math.min(Math.max(Number(data.awareness) * 20, 0), 100)}
                                        maxValue={100}
                                        color={getChipColor(Number(data.awareness))}
                                        className="h-2"
                                    />
                                </Tooltip>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-semibold">Proactive</p>
                                    <span className="text-sm">{Number(data.proactive).toFixed(1)}</span>
                                </div>
                                <Tooltip content={`${Number(data.proactive).toFixed(1)} / 5`} placement="right">
                                    <Progress 
                                        value={Math.min(Math.max(Number(data.proactive) * 20, 0), 100)}
                                        maxValue={100}
                                        color={getChipColor(Number(data.proactive))}
                                        className="h-2"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default OverviewCard;