import { TagCloud } from 'react-tagcloud';
import { Cloudy } from 'lucide-react';

const WordCloud = ({ data }) => {
    const wordFrequency = data.reduce((acc, message) => {
        const words = message.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3) {  // Ignore short words
                acc[word] = (acc[word] || 0) + 1;
            }
        });
        return acc;
    }, {});

    const cloudData = Object.entries(wordFrequency).map(([key, value]) => ({
        value: key,
        count: value,
    }));

    return (
        <div className="w-full">
            <div className="text-md font-semibold mb-4 flex gap-2"><Cloudy /> Word Cloud</div>
            <TagCloud 
                minSize={12}
                maxSize={35}
                tags={cloudData}
                className="w-full h-64"
            />
        </div>
    );
};

export default WordCloud;