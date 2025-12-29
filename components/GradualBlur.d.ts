import { CSSProperties, FC } from 'react';

interface GradualBlurProps {
    position?: 'top' | 'bottom' | 'left' | 'right';
    strength?: number;
    height?: string;
    divCount?: number;
    exponential?: boolean;
    zIndex?: number;
    animated?: boolean | 'scroll';
    duration?: string;
    easing?: string;
    opacity?: number;
    curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
    responsive?: boolean;
    target?: 'parent' | 'page';
    className?: string;
    style?: CSSProperties;
    preset?: string;
}

declare const GradualBlur: FC<GradualBlurProps>;
export default GradualBlur;
