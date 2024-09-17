import { useState } from 'react';
import { CornerDownLeft, Settings, SaveAll, ChartNetwork, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import CallControlPanel from './AudioWave';

const ChatBottom = ({ selectedType, onSendMessage, onOpenSettings, onSaveChat, savedChatId, onFeedback, onDeleteChat, onStartRecording, onStopRecording, isRecording }) => {
    const { theme } = useTheme();
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className={`bg-background absolute bottom-10 h-36 w-full border-t px-8 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4 ${theme === 'dark' ? 'border-brand-darkBorder' : ''}`}>
            {selectedType && !selectedType.isAudio ? 
                (
                    <form onSubmit={handleSubmit}>
                        <div className={`bg-background relative flex w-full grow flex-col overflow-hidden px-8 sm:rounded-md sm:border sm:px-12 ${theme === 'dark' ?  'border-brand-darkBorder' : ''}`}>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Send a message."
                                className="min-h-[60px] w-full resize-none bg-transparent pr-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                                rows={1}
                            />
                            <div className="absolute right-0 top-[13px] sm:right-4">
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-theme-800 text-primary-foreground shadow hover:bg-theme-800/90 h-9 w-9"
                                >
                                    <CornerDownLeft size={16} />
                                    <span className="sr-only">Send message</span>
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <CallControlPanel 
                        onStartRecording={onStartRecording}
                        onStopRecording={onStopRecording}
                        isRecording={isRecording}
                    />
                )
            }
            <div className="flex justify-end m-0 gap-2">
                <button
                    onClick={onOpenSettings}
                    className="flex items-center p-2 rounded-md hover:bg-theme-200 dark:hover:bg-theme-700 transition-colors"
                >
                    <Settings size={16} className="mr-2" />
                    <span className="text-xs hidden sm:block">Settings</span>
                </button>
                {savedChatId && 
                    <button
                        onClick={onFeedback}
                        className="flex items-center p-2 rounded-md hover:bg-theme-200 dark:hover:bg-theme-700 transition-colors"
                    >
                        <ChartNetwork size={16} className="mr-2" />
                        <span className="text-xs hidden sm:block">Feedback</span>
                    </button>
                }
                <button
                    onClick={onSaveChat}
                    className="flex items-center p-2 rounded-md hover:bg-theme-200 dark:hover:bg-theme-700 transition-colors"
                >
                    <SaveAll size={16} className="mr-2" />
                    <span className="text-xs hidden sm:block">Save</span>
                </button>
                {savedChatId && 
                    <button
                        onClick={onDeleteChat}
                        className="flex items-center p-2 rounded-md hover:bg-theme-200 dark:hover:bg-theme-700 transition-colors"
                    >
                        <Trash2 size={16} className="mr-2" />
                        <span className="text-xs hidden sm:block">Delete</span>
                    </button>
                }
            </div>
        </div>
    );
};

export default ChatBottom;