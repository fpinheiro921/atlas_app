import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { marked } from 'marked';

interface ChatWindowProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onClose: () => void;
    onClearChat: () => void;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const bubbleStyles = isUser
        ? 'bg-brand text-white rounded-br-none'
        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none';

    const renderer = new marked.Renderer();
    renderer.link = ({ href, title, tokens }: { href: string | null; title?: string | null; tokens: marked.Token[] }): string => {
        const text = tokens.map(t => t.raw).join('');
        const innerHtml = marked.parseInline(text);
        return `<a target="_blank" rel="noopener noreferrer" href="${href || ''}" title="${title || ''}" class="text-accent-light hover:underline">${innerHtml}</a>`;
    };
    
    // Use optional chaining just in case parts[0] is not yet available during initial render
    const html = marked.parse(message.parts[0]?.text || '', { renderer });

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md md:max-w-lg lg:max-w-xl p-3 rounded-xl shadow-md ${bubbleStyles}`}>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0.5" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </div>
    );
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, onClose, onClearChat }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-24 z-50 w-full h-full sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl sm:rounded-card shadow-2xl animate-fade-in-up">
            <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Atlas AI Coach</h2>
                <div className="flex items-center gap-2">
                    <button onClick={onClearChat} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="Clear Chat">
                         <span className="material-symbols-outlined text-xl">refresh</span>
                    </button>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="Close Chat">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg) => (
                    <ChatBubble key={msg.timestamp} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'model' && (
                     <div className="flex justify-start">
                        <div className="max-w-md p-3 rounded-xl shadow-md bg-slate-200 dark:bg-slate-700 rounded-bl-none">
                            <Spinner size="h-5 w-5" className="text-slate-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Atlas anything..."
                        rows={1}
                        className="w-full px-4 py-2 pr-12 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm text-slate-900 dark:text-white"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-brand hover:bg-brand/10 disabled:text-slate-400 disabled:hover:bg-transparent">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};