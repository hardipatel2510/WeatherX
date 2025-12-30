
import { CSSProperties, FC } from 'react';

interface TextTypeProps {
    text: string | string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    loop?: boolean;
    initialDelay?: number;
    cursorCharacter?: string;
    cursorBlinkDuration?: number; // Seconds
    showCursor?: boolean;
    hideCursorWhileTyping?: boolean;
    textColors?: string[];
    variableSpeed?: { min: number; max: number };
    startOnVisible?: boolean;
    reverseMode?: boolean;
    mode?: 'default' | 'scramble' | 'random';
    scrambleStep?: number;
    scrambleSpeed?: number;
    randomCharPool?: string;
    className?: string;
    style?: CSSProperties;
}

declare const TextType: FC<TextTypeProps>;
export default TextType;
