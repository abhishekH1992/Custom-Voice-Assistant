import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatBottom: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-background space-y-4 border-t px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
      <form onSubmit={handleSubmit}>
        <div className="bg-background relative flex max-h-60 w-full grow flex-col overflow-hidden px-8 sm:rounded-md sm:border sm:px-12">
          <button
            type="button"
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 bg-background absolute left-0 top-[13px] size-8 rounded-full p-0 sm:left-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="size-4">
              <path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8Z" />
            </svg>
            <span className="sr-only">New Chat</span>
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message."
            className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
            rows={1}
          />
          <div className="absolute right-0 top-[13px] sm:right-4">
            <button
              type="submit"
              disabled={!message.trim()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="size-4">
                <path d="M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0Z" />
              </svg>
              <span className="sr-only">Send message</span>
            </button>
          </div>
        </div>
      </form>
      <p className="text-muted-foreground px-2 text-center text-xs leading-normal hidden sm:block">
        Open source AI chatbot built with{' '}
        <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 justify-center gap-1 leading-4 hover:underline">
          <span>Next.js</span>
          <svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" className="opacity-70">
            <path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor" />
          </svg>
        </a>{' '}
        and{' '}
        <a href="https://github.com/vercel/ai" target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 justify-center gap-1 leading-4 hover:underline">
          <span>Vercel AI SDK</span>
          <svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" className="opacity-70">
            <path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor" />
          </svg>
        </a>
        .
      </p>
    </div>
  );
};

export default ChatBottom;