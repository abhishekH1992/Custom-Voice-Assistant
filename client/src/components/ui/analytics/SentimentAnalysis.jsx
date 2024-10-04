import { useMemo } from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import Sentiment from 'sentiment';
import { TEMPLATE_SUCCESS, TEMPLATE_DANGER, TEMPLATE_WARNING } from '../../../constant/colors';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const sentiment = new Sentiment();

const SentimentAnalysis = ({ data }) => {
    const analyzeSentiment = useMemo(() => {
        return data.map((message, index) => {
            const analysis = sentiment.analyze(message.content);
            return {
                index: index + 1,
                sentiment: analysis.comparative,
                role: message.role,
                content: message.content,
                words: analysis.words.length,
                score: analysis.score,
                positive: analysis.positive.length,
                negative: analysis.negative.length,
                tokens: analysis.tokens,
            };
        });
    }, [data]);

    const combinedChartData = {
        labels: analyzeSentiment.map(item => item.index),
        datasets: [
            {
                type: 'line',
                label: 'Sentiment',
                borderColor: TEMPLATE_SUCCESS,
                borderWidth: 2,
                fill: false,
                data: analyzeSentiment.map(item => item.sentiment),
                yAxisID: 'y-axis-sentiment',
            },
            {
                type: 'bar',
                label: 'Word Count',
                backgroundColor: TEMPLATE_WARNING,
                data: analyzeSentiment.map(item => item.words),
                yAxisID: 'y-axis-wordcount',
            }
        ]
    };

    const combinedChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    afterBody: (tooltipItems) => {
                        const dataIndex = tooltipItems[0].dataIndex;
                        const dataPoint = analyzeSentiment[dataIndex];
                        return [
                            `Role: ${dataPoint.role.toUpperCase()}`,
                            `Content: ${dataPoint.content.substring(0, 50)}...`,
                            `Positive Words: ${dataPoint.positive}`,
                            `Negative Words: ${dataPoint.negative}`,
                            `Overall Score: ${dataPoint.score}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Message Number' }
            },
            'y-axis-sentiment': {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Sentiment Score' },
                min: -1,
                max: 1,
            },
            'y-axis-wordcount': {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Word Count' },
                min: 0,
                grid: { drawOnChartArea: false }
            },
        }
    };

    const positiveNegativeChartData = {
        labels: analyzeSentiment.map(item => item.index),
        datasets: [
            {
                type: 'bar',
                label: 'Positive Words',
                backgroundColor: TEMPLATE_SUCCESS,
                data: analyzeSentiment.map(item => item.positive),
            },
            {
                type: 'bar',
                label: 'Negative Words',
                backgroundColor: TEMPLATE_DANGER,
                data: analyzeSentiment.map(item => item.negative),
            }
        ]
    };

    const positiveNegativeChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                stacked: true,
                title: { display: true, text: 'Message Number' }
            },
            y: {
                stacked: true,
                title: { display: true, text: 'Word Count' }
            }
        }
    };

    const responsiveChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 10,
                    font: {
                        size: 10
                    }
                }
            },
            title: {
                font: {
                    size: 14
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    // Merge responsive options with existing options
    const mergeOptions = (baseOptions) => ({
        ...baseOptions,
        ...responsiveChartOptions,
        scales: {
            ...baseOptions.scales,
            ...responsiveChartOptions.scales
        }
    });

    const responsiveCombinedChartOptions = mergeOptions(combinedChartOptions);
    const responsivePositiveNegativeChartOptions = mergeOptions(positiveNegativeChartOptions);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Card className="p-2 sm:p-4">
                <CardBody>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800">Sentiment and Word Count Analysis</h3>
                    <div className="h-64 sm:h-80 lg:h-96">
                        <Chart type='bar' data={combinedChartData} options={responsiveCombinedChartOptions} />
                    </div>
                </CardBody>
            </Card>
            <Card className="p-2 sm:p-4">
                <CardBody>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800">Positive vs Negative Words per Message</h3>
                    <div className="h-64 sm:h-80 lg:h-96">
                        <Chart type='bar' data={positiveNegativeChartData} options={responsivePositiveNegativeChartOptions} />
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default SentimentAnalysis;