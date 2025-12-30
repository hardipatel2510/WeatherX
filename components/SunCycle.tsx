"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SunCycleProps {
    sunrise: string;
    sunset: string;
    timezone: number;
    className?: string;
}

// Helpers
const parseTimeStr = (timeStr: string | undefined): number | null => {
    if (!timeStr) return null;
    const [t, period] = timeStr.split(' ');
    if (!t || !period) return null;
    const [h, m] = t.split(':').map(Number);
    let hours = h;
    if (period === 'PM' && h !== 12) hours += 12;
    if (period === 'AM' && h === 12) hours = 0;
    return hours * 60 + m;
};

const getCityTimeMins = (timezone: number) => {
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utcMs + (timezone * 1000));
    return (cityTime.getHours() * 60) + cityTime.getMinutes();
};

export default function SunCycle({ sunrise, sunset, timezone, className = "" }: SunCycleProps) {
    // State for hydration safe time
    const [currentMins, setCurrentMins] = useState(0);

    useEffect(() => {
        setCurrentMins(getCityTimeMins(timezone));
        const timer = setInterval(() => {
            setCurrentMins(getCityTimeMins(timezone));
        }, 60000);
        return () => clearInterval(timer);
    }, [timezone]);

    const riseMins = parseTimeStr(sunrise) ?? 360;
    const setMins = parseTimeStr(sunset) ?? 1080;

    // Layout Constants
    const chartW = 300;
    const chartH = 150;
    const px = 20; // padding x
    const gw = chartW - 2 * px; // graph width
    const yBase = 100; // Horizon Y
    const arcH = 70; // Arc Height
    const timelineY = 125; // Timeline Y position

    // X Helper
    const getX = (m: number) => px + (m / 1440) * gw;

    // Day Status
    const isDay = currentMins >= riseMins && currentMins <= setMins;

    // Arc Path Construction
    // Drawn from RiseX to SetX.
    // We can use a sine wave segment.
    // 0 to 1 progress between Rise and Set.
    let dArc = `M ${getX(riseMins)} ${yBase} `;
    for (let i = 0; i <= 40; i++) {
        const p = i / 40; // 0 to 1
        const mx = getX(riseMins) + p * (getX(setMins) - getX(riseMins));
        const my = yBase - Math.sin(p * Math.PI) * arcH;
        dArc += `L ${mx} ${my} `;
    }

    // Sun Position on Arc
    let sunX = getX(currentMins);
    let sunY = yBase;

    if (currentMins >= riseMins && currentMins <= setMins) {
        // Sun is UP
        const sunP = (currentMins - riseMins) / (setMins - riseMins);
        sunY = yBase - Math.sin(sunP * Math.PI) * arcH;
    } else {
        // Sun is DOWN (clamped to horizon edges for this visual or hidden?)
        // Apple Weather hides sun below horizon usually, or shows strictly on timeline.
        // We'll keep X accurate but clamp Y to horizon.
        sunY = yBase;
    }

    // Timeline Logic
    const startX = getX(riseMins);
    const endX = getX(setMins);
    const progressX = Math.max(startX, Math.min(sunX, endX));

    return (
        <div className={`flex flex-col h-full w-full ${className}`}>
            {/* Header Labels */}
            <div className="flex justify-between px-4 pt-4 shrink-0">
                <div>
                    <span className="block text-xs uppercase opacity-60">Sunrise</span>
                    <span className="text-3xl font-light">{sunrise}</span>
                </div>
                <div className="text-right">
                    <span className="block text-xs uppercase opacity-60">Sunset</span>
                    <span className="text-3xl font-light">{sunset}</span>
                </div>
            </div>

            {/* Visual */}
            <div className="flex-1 relative flex items-center justify-center">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="gSunCycle" x1="0" y1="1" x2="0" y2="0">
                            <stop stopColor="#FB923C" stopOpacity="0" />
                            <stop offset="1" stopColor="#FB923C" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="sunGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" />
                            <feMerge>
                                <feMergeNode in="SourceGraphic" />
                                <feMergeNode />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Horizon Line (Dim) */}
                    <line x1="0" y1={yBase} x2={chartW} y2={yBase} stroke="white" strokeWidth="1" opacity="0.1" />

                    {/* Sun Arc (Fill) */}
                    <path d={dArc} fill="url(#gSunCycle)" stroke="#FB923C" strokeWidth="2" opacity="0.6" />

                    {/* === New Timeline === */}
                    {/* Background Track (Rise to Set) */}
                    <line
                        x1={startX} y1={timelineY}
                        x2={endX} y2={timelineY}
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.2"
                    />

                    {/* Active Track (Rise to Now) */}
                    {/* Only show if we passed sunrise */}
                    {currentMins > riseMins && (
                        <motion.line
                            x1={startX} y1={timelineY}
                            x2={progressX} y2={timelineY}
                            stroke="#FB923C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ x2: startX }}
                            animate={{ x2: progressX }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    )}

                    {/* Current Time Dot on Timeline */}
                    <motion.circle
                        cx={progressX}
                        cy={timelineY}
                        r="3"
                        fill="#FB923C"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Glow Pulse */}
                        <motion.circle
                            r="6"
                            fill="#FB923C"
                            opacity="0.4"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </motion.circle>

                    {/* Sun Element (On Arc) */}
                    {isDay && (
                        <motion.g
                            animate={{ x: sunX, y: sunY }}
                            transition={{ duration: 1 }} // Smooth move on updates
                        >
                            {/* Connector Line (Sun to Timeline) */}
                            <motion.line
                                x1={0} y1={0}
                                x2={0} y2={timelineY - sunY} // relative dist
                                stroke="white"
                                strokeDasharray="3 3"
                                opacity="0.3"
                            />

                            {/* Sun Body */}
                            <circle r="8" fill="#FDB813" filter="url(#sunGlowFilter)" />
                            <circle r="4" fill="white" />
                        </motion.g>
                    )}

                    {/* "Now" Label */}
                    <text x={progressX} y={timelineY + 15} textAnchor="middle" fill="white" fontSize="10" opacity="0.8">Now</text>

                </svg>
            </div>
        </div>
    );
}
