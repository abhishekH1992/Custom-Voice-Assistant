import { Card, CardBody, Chip, Progress, Tooltip } from "@nextui-org/react";

const FillerWordCard = ({ data, capitalizeFirstLetter }) => {
    const getColorClass = (count) => {
        if (count <= 3) return "text-success";
        if (count <= 7) return "text-warning";
        return "text-danger";
    };

    const getProgressColor = (count) => {
        if (count <= 3) return "success";
        if (count <= 7) return "warning";
        return "danger";
    };

    const maxExpectedFillerWords = 15;

    return (
        <Card className="p-4">
            <CardBody>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Filler Word Analysis</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="font-medium text-sm text-gray-600">Filler Word Count:</p>
                        <Tooltip content={`${data.count} filler words detected`}>
                        <span className={`text-lg font-bold ${getColorClass(data.count)}`}>
                            {data.count}
                        </span>
                        </Tooltip>
                    </div>
                    <Progress 
                        value={data.count} 
                        maxValue={maxExpectedFillerWords} 
                        color={getProgressColor(data.count)}
                        className="h-2"
                        aria-label="Filler word count"
                    />
                    {data.fillerWords.length > 0 ? (
                        <div className="mt-4">
                        <p className="font-medium text-sm text-gray-600 mb-2">Filler Words Used:</p>
                        <div className="flex flex-wrap gap-2">
                            {data.fillerWords.map((word, index) => (
                            <Chip 
                                key={index} 
                                color={getProgressColor(data.count)}
                                variant="flat"
                                size="sm"
                            >
                                {capitalizeFirstLetter(word)}
                            </Chip>
                            ))}
                        </div>
                        </div>
                    ) : (
                        <p className="text-sm text-success font-medium mt-2">No filler words detected. Great job!</p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default FillerWordCard;