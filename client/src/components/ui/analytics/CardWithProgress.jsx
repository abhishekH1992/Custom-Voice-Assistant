import { Card, CardBody, Progress, Tooltip } from "@nextui-org/react";
import GaugeChart from "./GuageChart";

const CardWithProgress = ({ confidenceData }) => {
    const formatKey = (key) => {
        return key.split(/(?=[A-Z])/).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const getProgressColor = (value) => {
        if (value <= 2) return "danger";
        if (value <= 3.5) return "warning";
        return "success";
    };

    const filteredData = Object.entries(confidenceData).filter(([key]) => key !== 'avgConfidence' && key !== '__typename');
    const columnLength = Math.ceil(filteredData.length / 3);
    const columns = [
        filteredData.slice(0, columnLength),
        filteredData.slice(columnLength, columnLength * 2),
        filteredData.slice(columnLength * 2)
    ];

    return (
        <Card className="p-4">
            <CardBody>
                <div className="text-lg font-semibold mb-4 text-gray-800">Call Metrics</div>
                <div className="flex flex-wrap mx-2">
                    <div className="w-full md:w-1/4 px-2 mb-4">
                        <div className="text-center">
                        <GaugeChart value={confidenceData.avgConfidence} height={125} startAngle={180} innerRadius={60} outerRadius={80}/>
                        <div className="mt-2 font-bold text-lg">
                            {Number(confidenceData.avgConfidence).toFixed(1)}
                        </div>
                        <p className="text-sm font-semibold mb-1">Average Confidence</p>
                        </div>
                    </div>
                    {columns.map((column, columnIndex) => (
                        <div key={columnIndex} className="w-full md:w-1/4 px-2">
                            {column.map(([key, value]) => (
                                <div key={key} className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-semibold">{formatKey(key)}</p>
                                        <span className="text-sm">{Number(value).toFixed(1)}</span>
                                    </div>
                                    <Tooltip content={`${Number(value).toFixed(1)} / 5`} placement="right">
                                        <Progress 
                                        value={Math.min(Math.max(Number(value) * 20, 0), 100)}
                                        maxValue={100}
                                        color={getProgressColor(Number(value))}
                                        className="h-2"
                                        aria-label={`${key} progress`}
                                        />
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
};

export default CardWithProgress;