'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Container that coordinates the staggering of its children
export const StaggerContainer = ({
    children,
    className = "",
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        delayChildren: delay,
                        staggerChildren: 0.1 // Adjust for faster/slower stagger
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Individual item that fades in and slides up
export const FadeInItem = ({
    children,
    className = ""
}: {
    children: ReactNode;
    className?: string;
}) => {
    return (
        <motion.div
            variants={{
                hidden: {
                    opacity: 0,
                    y: 20,
                    scale: 0.95
                },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        type: "spring",
                        bounce: 0, // No bounce for "Apple Pro" feel
                        duration: 0.6
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
