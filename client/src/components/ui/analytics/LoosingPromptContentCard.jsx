import { Card, CardBody, Chip, Tooltip } from "@nextui-org/react";
import { TEMPLATE_SUCCESS, TEMPLATE_WARNING, TEMPLATE_DANGER } from "../../../constant/colors";
import GaugeChart from "./GuageChart";

const LoosingPromptContentCard = ({ data, capitalizeFirstLetter }) => {
    const getColor = (value) => {
        if (value <= 2) return TEMPLATE_SUCCESS;
        if (value <= 3.5) return TEMPLATE_WARNING;
        return TEMPLATE_DANGER;
    };

    const getBadgeColor = (key) => {
        if (key === "Yes") return "danger";
        if (key === "No") return "success";
        return "warning";
    };

    return (
        <Card className="p-4">
            <CardBody>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Loosing Prompt Content</h3>
                <div className="flex flex-col xl:flex-row xl:justify-between items-start xl:items-center space-y-4 md:space-y-0">
                    <div className="space-y-4 w-full xl:w-1/2">
                        <div className="flex gap-4 items-center">
                            <p className="font-medium text-sm text-gray-600">Is Losing Content:</p>
                            <Chip 
                                color={getBadgeColor(data.isLosingContent.key)}
                                variant="flat"
                            >
                                {capitalizeFirstLetter(data.isLosingContent.key)}
                            </Chip>
                        </div>
                        <div>
                            <p className="font-medium text-sm text-gray-600 mb-2">Content Loss Rate:</p>
                            <Tooltip content={`${data.isLosingContent.rate.toFixed(1)} / 5`}>
                                <p className={`text-lg font-bold ${getColor(data.isLosingContent.rate)}`}>
                                {data.isLosingContent.rate.toFixed(1)}
                                </p>
                            </Tooltip>
                        </div>
                        <div>
                            <p className="font-medium text-sm text-gray-600 mb-2">Sections Missed:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                                {data.sectionsMissed.map((section, index) => (
                                <li key={index}>{section}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="w-full xl:w-1/2 h-48">
                        <GaugeChart value={data.isLosingContent.rate} height={125} startAngle={180} innerRadius={60} outerRadius={80}/>
                        <div className="mt-2 font-bold text-lg text-center">
                            {Number(data.isLosingContent.rate).toFixed(1)}
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default LoosingPromptContentCard;