import { Card, CardBody, Chip, Tooltip } from "@nextui-org/react";
import { TEMPLATE_SUCCESS, TEMPLATE_WARNING, TEMPLATE_DANGER } from "../../../constant/colors";
import GaugeChart from "./GuageChart";

const InteractionSpeedCard = ({ data, capitalizeFirstLetter }) => {
    const getColor = (value) => {
        if (value <= 2) return TEMPLATE_DANGER;
        if (value <= 3.5) return TEMPLATE_WARNING;
        return TEMPLATE_SUCCESS;
    };

    const getSpeedColor = (speed) => {
        if (speed === "Slow") return "danger";
        if (speed === "Medium" || speed === "Normal") return "warning";
        return "success";
    };

    return (
        <Card className="p-4">
            <CardBody>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Interaction Speed</h3>
                <div className="flex flex-col 2xl:flex-row 2xl:justify-between items-start 2xl:items-center space-y-4 md:space-y-0">
                    <div className="space-y-4 w-full 2xl:w-1/2">
                        <div className="flex gap-4 items-center">
                            <p className="font-medium text-sm text-gray-600">Speed:</p>
                            <Chip 
                                color={getSpeedColor(data.speed)}
                                variant="flat"
                            >
                                {capitalizeFirstLetter(data.speed)}
                            </Chip>
                        </div>
                        <div>
                            <p className="font-medium text-sm text-gray-600 mb-2">Interaction Rate:</p>
                            <Tooltip content={`${data.rate.toFixed(1)} / 5`}>
                                <p className={`text-lg font-bold ${getColor(data.rate)}`}>
                                    {data.rate.toFixed(1)}
                                </p>
                            </Tooltip>
                        </div>
                        <div>
                            <p className="font-medium text-sm text-gray-600 mb-2">Reflection:</p>
                            <p className="text-sm text-gray-600">{data.reflection}</p>
                        </div>
                    </div>
                    <div className="w-full 2xl:w-1/2 h-48">
                        <GaugeChart value={data.rate} height={125} startAngle={180} innerRadius={60} outerRadius={80}/>
                        <div className="mt-2 font-bold text-lg text-center">
                            {Number(data.rate).toFixed(1)}
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default InteractionSpeedCard;