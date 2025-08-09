import React from 'react';

interface FloatingActionButtonProps {
    onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-brand hover:bg-brand-light text-white shadow-lg flex items-center justify-center transition-transform duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
            aria-label="Open AI Coach Chat"
            title="Open AI Coach Chat"
        >
            <span className="material-symbols-outlined !text-4xl">forum</span>
        </button>
    );
};