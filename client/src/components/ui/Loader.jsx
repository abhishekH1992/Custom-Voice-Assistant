import { useState, useEffect } from 'react';
import { Spinner } from '@nextui-org/react';

const Loader = ({ loaderItems }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % loaderItems.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [loaderItems]);

    const currentIcon = loaderItems[currentIndex];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-750 bg-opacity-75 backdrop-blur-sm">
            <div className="text-center">
                <div className="flex justify-center items-center mb-4">
                    <Spinner label={currentIcon.text} color="secondary" labelColor="secondary"/>
                </div>
            </div>
        </div>
    );
};

export default Loader;