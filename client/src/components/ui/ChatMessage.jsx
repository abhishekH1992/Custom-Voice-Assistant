import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Flower, UserRound } from 'lucide-react';

const ChatMessage = ({ message }) => {
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
        <div className={`mb-4 p-3 rounded-lg max-w-full ${
            message.type === 'user' 
                ? 'self-end bg-theme-100' 
                : 'self-start bg-gray-100'
        }`}>
            <div className="flex gap-2 message-content break-words">
                <div className="my-2">{getIcon()}</div>
                <div>
                    <ReactMarkdown
                        components={{
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        children={String(children).replace(/\n$/, '')}
                                        style={tomorrow}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    />
                                ) : (
                                    <code className="bg-gray-200 px-1 py-0.5 rounded-sm font-mono text-sm" {...props}>
                                         {children}
                                    </code>
                                )
                            },
                            p: ({node, ...props}) => <p className="my-2" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold my-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;