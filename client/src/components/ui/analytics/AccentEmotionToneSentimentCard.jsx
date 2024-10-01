import { Card, CardBody, Chip } from "@nextui-org/react";
import GaugeChart from "./GuageChart";

const AccentEmotionToneSentimentCard = ({ accentEmotion, toneSentiment }) => {
    const getProgressColor = (value) => {
        if (value <= 2) return "danger";
        if (value <= 3.5) return "warning";
        return "success";
    };

    const renderItem = (label, data) => (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex-grow">
                <span className="font-medium text-sm text-gray-600">{label}</span>
                <div className="flex items-center mt-1 space-x-2">
                    <Chip 
                        color={getProgressColor(Number(data.rate))} 
                        variant="flat" 
                        size="sm"
                    >
                        {data.key}
                    </Chip>
                    <span className="text-sm font-semibold">
                        {Number(data.rate).toFixed(1)}
                    </span>
                </div>
            </div>
            <div className="w-16">
                <GaugeChart 
                    value={data.rate} 
                    height={40} 
                    startAngle={90} 
                    endAngle={-270} 
                    innerRadius={15} 
                    outerRadius={20} 
                    cy={`50%`}
                />
            </div>
        </div>
    );

    return (
        <div className="grid gap-8">
            <Card className="p-4">
                <CardBody>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Accent and Emotion Analysis</h3>
                    <div className="space-y-4">
                        {renderItem("Accent", accentEmotion?.accent)}
                        {renderItem("Emotion", accentEmotion?.emotion)}
                    </div>
                </CardBody>
            </Card>
            <Card className="p-4">
                <CardBody>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Tone and Sentiment Overview</h3>
                    <div className="space-y-4">
                        {renderItem("Tone", toneSentiment?.tone)}
                        {renderItem("Sentiment", toneSentiment?.sentiment)}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AccentEmotionToneSentimentCard;