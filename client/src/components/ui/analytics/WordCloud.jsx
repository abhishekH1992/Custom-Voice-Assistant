import { useState } from 'react';
import { TagCloud } from 'react-tagcloud';
import { Card, CardBody, CardHeader, Tooltip, Button } from "@nextui-org/react";

const WordCloud = ({ data }) => {
    const [maxWords, setMaxWords] = useState(80);

    const wordFrequency = data.reduce((acc, message) => {
        const words = message.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3) {
                acc[word] = (acc[word] || 0) + 1;
            }
        });
        return acc;
    }, {});

    const cloudData = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxWords)
        .map(([key, value]) => ({
            value: key,
            count: value,
        }));

    const customRenderer = (tag, size, color) => (
        <Tooltip key={tag.value} content={`Frequency: ${tag.count}`}>
            <span style={{
                animation: 'blinker 3s linear infinite',
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${size}px`,
                margin: '3px',
                padding: '3px',
                display: 'inline-block',
                color: color
            }}>
                {tag.value}
            </span>
        </Tooltip>
    );

    return (
        <Card className="p-4">
            <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Word Cloud</h3>
                </div>
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        color="primary" 
                        variant="flat"
                        onClick={() => setMaxWords(prev => Math.max(20, prev - 20))}
                    >
                        Less Words
                    </Button>
                    <Button 
                        size="sm" 
                        color="primary" 
                        variant="flat"
                        onClick={() => setMaxWords(prev => Math.min(200, prev + 20))}
                    >
                        More Words
                    </Button>
                </div>
            </CardHeader>
            <CardBody>
                <div className="text-sm text-gray-500 mb-2">
                    Showing top {maxWords} words
                </div>
                <div className="w-full overflow-hidden">
                    <TagCloud 
                        minSize={12}
                        maxSize={35}
                        tags={cloudData}
                        className="w-full h-full"
                        renderer={customRenderer}
                    />
                </div>
            </CardBody>
        </Card>
    );
};

export default WordCloud;