"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface MoonPhaseVisualProps {
    phase: number;
    lat?: number;
    isUp?: boolean;
    className?: string; // Support className for sizing
}

export function MoonPhaseVisual({ phase, lat = 0, isUp = true, className = "" }: MoonPhaseVisualProps) {
    const isSouthern = lat < 0;

    // 1. Sliding Shadow Logic (Right to Left)
    // Waxing (0 -> 0.5): Shadow covers Main, moves Left. Reveals Right.
    // cx starts at 50, ends at -50.
    // Waning (0.5 -> 1): Shadow starts at Right, moves Left. Covers Right. Leaves Left Lit.
    // cx starts at 150, ends at 50.

    let shadowCx = 50;
    if (phase <= 0.5) {
        // Waxing
        shadowCx = 50 - (phase * 200);
    } else {
        // Waning
        shadowCx = 150 - ((phase - 0.5) * 200);
    }

    // Illumination Calculation for Glow
    // Phase 0/1 (New) -> 0. Phase 0.5 (Full) -> 1.
    const illum = 1 - Math.abs((phase - 0.5) * 2);

    const TEXTURE = "/moon_texture.png";

    return (
        <div className={`relative ${className}`}>
            {/* Floating Animation Wrapper */}
            <motion.div
                className="relative w-full h-full"
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Glow Halo - Only visible if illumination > 10% */}
                {illum > 0.1 && (
                    <motion.div
                        className="absolute inset-[-20px] rounded-full bg-white/20 blur-2xl z-0"
                        initial={{ opacity: 0.6 }}
                        animate={
                            illum > 0.3
                                ? { opacity: [0.6, 1, 0.6] }
                                : { opacity: 0.3 }
                        }
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                )}

                {/* Moon Container */}
                <div
                    className="relative w-full h-full rounded-full overflow-hidden shadow-2xl bg-black z-10"
                    style={{
                        transform: isSouthern ? 'scaleY(-1)' : 'none',
                        opacity: isUp ? 1 : 0.4,
                        filter: isUp ? 'contrast(1.1)' : 'grayscale(100%) blur(4px) brightness(0.5)',
                        transition: 'opacity 1s, filter 1s'
                    }}
                >
                    {/* Base Texture */}
                    <img
                        src={TEXTURE}
                        alt="Moon"
                        className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
                    />

                    {/* Animated Shadow Mask */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <filter id="blurShadow">
                                <feGaussianBlur stdDeviation="3" />
                            </filter>
                        </defs>
                        <motion.circle
                            cy="50"
                            r="55"
                            fill="rgba(0,0,0,0.9)"
                            filter="url(#blurShadow)"
                            animate={{ cx: shadowCx }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                    </svg>

                    {/* Rim Glow / Depth */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
                    <div className="absolute inset-0 rounded-full shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1)] mix-blend-screen pointer-events-none" />
                </div>
            </motion.div>
        </div>
    );
}
