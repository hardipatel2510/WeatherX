'use client';

import React, { useEffect, useState } from 'react';

interface CloudBackgroundProps {
    timezone: number; // Seconds offset from UTC
}

export default function CloudBackground({ timezone }: CloudBackgroundProps) {
    const [mounted, setMounted] = useState(false);
    const [timeState, setTimeState] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');

    useEffect(() => {
        setMounted(true);
        const calculateTime = () => {
            // Helper to get local time at target timezone
            const now = new Date();
            // Get UTC milliseconds: current local time + (local timezone offset in min * 60000)
            const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
            // Target time in milliseconds
            const targetMs = utcMs + (timezone * 1000);
            const targetDate = new Date(targetMs);
            const hour = targetDate.getHours();

            if (hour >= 6 && hour < 11) return 'morning'; // 6am - 11am
            if (hour >= 11 && hour < 17) return 'afternoon'; // 11am - 5pm
            if (hour >= 17 && hour < 19) return 'evening'; // 5pm - 7pm
            return 'night'; // 7pm - 5am (Default else)
        };

        setTimeState(calculateTime());
        // Re-check periodically
        const timer = setInterval(() => setTimeState(calculateTime()), 60000); // Every minute
        return () => clearInterval(timer);
    }, [timezone]);

    // Define Gradients based on Time State - Simplified for valid CSS
    // Using string interpolation for classes or inline styles
    const getGradient = () => {
        switch (timeState) {
            case 'morning': // Warm orange gradient
                return 'bg-gradient-to-b from-[#FFD7A1] via-[#FFC570] to-[#FFB347]';
            case 'afternoon': // Deep dark-orange gradient
                return 'bg-gradient-to-b from-[#FF9F43] via-[#FF8520] to-[#FF6F00]';
            case 'evening': // Golden/Purple/Orange (keeping compatible transition)
                return 'bg-gradient-to-b from-[#2E2055] via-[#804060] to-[#FF8C00]';
            case 'night': // Dark blue/black
                return 'bg-gradient-to-b from-[#0B1026] via-[#1B2735] to-[#090A0F]';
        }
    };

    const gradientClass = getGradient();

    return (
        <div className={`fixed inset-0 z-[-1] overflow-hidden transition-all duration-[3000ms] ${gradientClass}`}>

            {/* Stars (Night Only) */}
            <div className={`absolute inset-0 transition-opacity duration-[3000ms] ${timeState === 'night' ? 'opacity-100' : 'opacity-0'}`}>
                {/* Generated Star Field */}
                {mounted && Array.from({ length: 150 }).map((_, i) => {
                    // Deterministic pseudo-random based on index to avoid hydration mismatch if possible, 
                    // relying on mounted check to ensure client-only render
                    const top = Math.random() * 100;
                    const left = Math.random() * 100;
                    const size = Math.random() * 2 + 1; // 1px to 3px
                    // Random blink animation delay/duration
                    const delay = Math.random() * 5;
                    const duration = Math.random() * 3 + 2;

                    return (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full animate-pulse"
                            style={{
                                top: `${top}%`,
                                left: `${left}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                opacity: Math.random() * 0.7 + 0.3,
                                animationDelay: `${delay}s`,
                                animationDuration: `${duration}s`
                            }}
                        />
                    );
                })}
            </div>

            {/* Clouds (Adjust opacity/color based on time) */}
            {/* Clouds are more visible in day, darker/more transparent at night */}
            <div className={`transition-all duration-[3000ms] ${timeState === 'night' ? 'opacity-40 brightness-50 contrast-125' : (timeState === 'afternoon' ? 'opacity-90 brightness-90 contrast-110 saturate-125' : (timeState === 'morning' ? 'opacity-80 brightness-95 contrast-110 saturate-110' : 'opacity-80 sepia-[0.3] hue-rotate-[-10deg]'))}`}>

                {/* Cloud Layer 1 (Far/Slow) - Sharper */}
                <div className="absolute top-0 left-0 w-[200%] h-full flex animate-cloud-slow opacity-90 pointer-events-none">
                    <div className="w-1/2 h-full relative" style={{ transform: 'scale(1.5)' }}>
                        {/* CSS Clouds - Reduced blur for crisper edges */}
                        <div className="absolute top-[20%] left-[10%] w-[500px] h-[200px] rounded-full bg-white blur-[24px] opacity-90" />
                        <div className="absolute top-[10%] left-[40%] w-[400px] h-[180px] rounded-full bg-white blur-[20px] opacity-80" />
                        <div className="absolute top-[30%] left-[70%] w-[600px] h-[250px] rounded-full bg-white blur-[30px] opacity-85" />
                    </div>
                    {/* Duplicate for Loop */}
                    <div className="w-1/2 h-full relative" style={{ transform: 'scale(1.5)' }}>
                        <div className="absolute top-[20%] left-[10%] w-[500px] h-[200px] rounded-full bg-white blur-[24px] opacity-90" />
                        <div className="absolute top-[10%] left-[40%] w-[400px] h-[180px] rounded-full bg-white blur-[20px] opacity-80" />
                        <div className="absolute top-[30%] left-[70%] w-[600px] h-[250px] rounded-full bg-white blur-[30px] opacity-85" />
                    </div>
                </div>

                {/* Cloud Layer 2 (Mid/Medium) - Crisp */}
                <div className="absolute top-1/4 left-0 w-[200%] h-full flex animate-cloud-mid opacity-100 pointer-events-none">
                    <div className="w-1/2 h-full relative">
                        <div className="absolute top-[10%] left-[5%] w-[300px] h-[120px] rounded-full bg-white blur-[15px] opacity-95" />
                        <div className="absolute top-[50%] left-[30%] w-[500px] h-[200px] rounded-full bg-white blur-[25px] opacity-90" />
                        <div className="absolute top-[20%] left-[60%] w-[400px] h-[150px] rounded-full bg-white blur-[20px] opacity-90" />
                        <div className="absolute top-[60%] left-[80%] w-[350px] h-[140px] rounded-full bg-white blur-[15px] opacity-95" />
                    </div>
                    {/* Duplicate */}
                    <div className="w-1/2 h-full relative">
                        <div className="absolute top-[10%] left-[5%] w-[300px] h-[120px] rounded-full bg-white blur-[15px] opacity-95" />
                        <div className="absolute top-[50%] left-[30%] w-[500px] h-[200px] rounded-full bg-white blur-[25px] opacity-90" />
                        <div className="absolute top-[20%] left-[60%] w-[400px] h-[150px] rounded-full bg-white blur-[20px] opacity-90" />
                        <div className="absolute top-[60%] left-[80%] w-[350px] h-[140px] rounded-full bg-white blur-[15px] opacity-95" />
                    </div>
                </div>

                {/* Cloud Layer 3 (Near/Fast) - Very Crisp / Wispy */}
                <div className="absolute top-1/3 left-0 w-[200%] h-full flex animate-cloud-fast opacity-80 pointer-events-none mix-blend-screen">
                    <div className="w-1/2 h-full relative">
                        <div className="absolute top-[40%] left-[-10%] w-[600px] h-[300px] rounded-full bg-white blur-[35px] opacity-60" />
                        <div className="absolute top-[60%] left-[40%] w-[500px] h-[250px] rounded-full bg-white blur-[30px] opacity-50" />
                    </div>
                    <div className="w-1/2 h-full relative">
                        <div className="absolute top-[40%] left-[-10%] w-[600px] h-[300px] rounded-full bg-white blur-[35px] opacity-60" />
                        <div className="absolute top-[60%] left-[40%] w-[500px] h-[250px] rounded-full bg-white blur-[30px] opacity-50" />
                    </div>
                </div>

            </div>

            {/* Global Atmosphere Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-blue-500/5 pointer-events-none" />
            {timeState !== 'night' && <div className={`absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-yellow-100/30 rounded-full blur-[100px] mix-blend-overlay pointer-events-none transition-opacity duration-1000 ${timeState === 'morning' ? 'opacity-40' : 'opacity-100'}`} />}
        </div>
    );
}
