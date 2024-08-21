import React from 'react';
import { Flower, UserRound } from 'lucide-react';

interface MessageProps {
  type: 'system' | 'user' | 'assistant';
  content: string;
  chart?: boolean;
}

const ChatMessage: React.FC<{ message: MessageProps }> = ({ message }) => {
  const getIcon = (): JSX.Element | null => {
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
        {message.chart && (
          <div className="rounded-xl border bg-zinc-950 p-4 text-green-400">
            {/* You would replace this with your actual chart component */}
            <div className="text-lg text-zinc-300">BTC</div>
            <div className="text-3xl font-bold">$45000</div>
            <div className="text mt-1 text-xs text-zinc-500">Closed: Feb 27, 4:59 PM EST</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;