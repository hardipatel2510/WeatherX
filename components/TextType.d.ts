
import { CSSProperties, FC } from 'react';

interface TextTypeProps {
    text: string | string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseTime?: number;
    loop?: boolean;
    emptyPauseTime?: number;
    cursorCharacter?: string;
    cursorBlinkSpeed?: number;
    showCursor?: boolean;
    mode?: 'default' | 'scramble' | 'random';
    scrambleStep?: number;
    scrambleSpeed?: number;
    randomCharPool?: string;
    className?: string;
    style?: CSSProperties;
}

declare const TextType: FC<TextTypeProps>;
export default TextType;
