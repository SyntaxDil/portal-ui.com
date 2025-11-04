
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    onFinished: () => void;
    className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, onFinished, className = '' }) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        setDisplayedText('');
        let index = 0;
        const intervalId = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(prev => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(intervalId);
                onFinished();
            }
        }, 20); // speed can be adjusted here
        return () => clearInterval(intervalId);
    }, [text, onFinished]);

    return <p className={className}>{displayedText}</p>;
}

export default TypewriterText;