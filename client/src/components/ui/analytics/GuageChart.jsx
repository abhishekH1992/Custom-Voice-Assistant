import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TEMPLATE_DANGER, TEMPLATE_WARNING, TEMPLATE_SUCCESS } from "../../../constant/colors";

const GaugeChart = ({ value, height, startAngle, endAngle = 0, cy = "100%", innerRadius, outerRadius }) => {
    const data = [
        { name: 'score', value: Math.min(Math.max(value, 0), 5) },
        { name: 'empty', value: 5 - Math.min(Math.max(value, 0), 5) }
    ];

    const getGaugeColor = (value) => {
        if (value <= 2) return TEMPLATE_DANGER;
        if (value <= 3.5) return TEMPLATE_WARNING;
        return TEMPLATE_SUCCESS;
    };

    const gaugeColor = getGaugeColor(value);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="value"
                >
                    <Cell key="score" fill={gaugeColor} />
                    <Cell key="empty" fill="#cccccc" />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default GaugeChart;