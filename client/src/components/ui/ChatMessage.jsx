import { Flower, UserRound } from 'lucide-react';

const ChatMessage = ({ message }) => {
    console.log('Rendering ChatMessage:', message);
    const getIcon = () => {
        switch (message.type) {
            case 'system':
                return (
                    <Flower />
                );
            case 'user':
                return (
                    <UserRound />
                );
            case 'assistant':
                return (
                    <Flower />
                );
            default:
                return null;
            }
    };

    return (
        <div className="group relative flex items-start md:-ml-12 mb-4">
            <div className={`flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm ${message.type === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                {getIcon()}
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
                <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words">
                    <p className="mb-2 last:mb-0">{message.content}</p>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;