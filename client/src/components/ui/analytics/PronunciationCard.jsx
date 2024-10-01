import { Card, CardBody, Progress, Tooltip } from "@nextui-org/react";

const PronunciationCard = ({ data, capitalizeFirstLetter }) => {
    const getColorClass = (rate) => {
        if (rate <= 2) return "text-danger";
        if (rate <= 3.5) return "text-warning";
        return "text-success";
    };

    const getProgressColor = (rate) => {
        if (rate <= 2) return "danger";
        if (rate <= 3.5) return "warning";
        return "success";
    };

    return (
        <Card className="p-4">
            <CardBody>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Pronunciation Analysis</h3>
                <div className="space-y-6">
                    {Object.entries(data)
                        .filter(([key]) => key !== '__typename')
                        .map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm capitalize text-gray-700">{key}</p>
                                <Tooltip content={`Score: ${value.rate.toFixed(2)} / 5`}>
                                    <span className={`text-sm font-bold ${getColorClass(value.rate)}`}>
                                    {capitalizeFirstLetter(value.key)}
                                    </span>
                                </Tooltip>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Progress 
                                    value={value.rate * 20} 
                                    maxValue={100} 
                                    color={getProgressColor(value.rate)}
                                    className="w-full h-2"
                                    aria-label={`${key} pronunciation score`}
                                />
                                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                                    {(value.rate * 20).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
};

export default PronunciationCard;