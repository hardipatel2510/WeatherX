'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CloudBackgroundProps {
    timezone: number; // Seconds offset from UTC
    sunrise: string;
    sunset: string;
}

// Time parsing helper
const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [t, period] = timeStr.split(' ');
    const [h, m] = t.split(':').map(Number);
    let hours = h;
    if (period === 'PM' && h !== 12) hours += 12;
    if (period === 'AM' && h === 12) hours = 0;
    return hours * 60 + m; // Minutes from midnight
};

// Gradient Definitions
const GRADIENTS = {
    sunrise: 'linear-gradient(to top, #6584c4 0%, #b2d6fa 40%, #fdc899 100%)', // Soft orange/blue
    day: 'linear-gradient(to top, #4ca1af 0%, #c4e0e5 100%)', // Bright blue/white
    sunset: 'linear-gradient(to top, #36174D 0%, #E0485F 50%, #FFB656 100%)', // Pink/Purple/Orange
    night: 'linear-gradient(to top, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Deep blue/black
};

export default function CloudBackground({ timezone, sunrise, sunset }: CloudBackgroundProps) {
    const [mounted, setMounted] = useState(false);
    const [sunProgress, setSunProgress] = useState(-0.1);

    useEffect(() => {
        setMounted(true);
        const updateSun = () => {
            const now = new Date();
            const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
            const cityTime = new Date(utcMs + (timezone * 1000));

            const currentMins = cityTime.getHours() * 60 + cityTime.getMinutes();
            const sunriseMins = parseTime(sunrise) || 6 * 60;
            const sunsetMins = parseTime(sunset) || 18 * 60;

            // Total day length in minutes
            const dayLength = sunsetMins - sunriseMins;

            // Calculate progress: 0 (sunrise) -> 1 (sunset)
            // We allow < 0 (before sunrise) and > 1 (after sunset)
            let progress = (currentMins - sunriseMins) / dayLength;

            setSunProgress(progress);
        };

        updateSun();
        const timer = setInterval(updateSun, 10000); // Update every 10s
        return () => clearInterval(timer);
    }, [timezone, sunrise, sunset]);

    // Calculate Layer Opacities based on sunProgress
    const getOpacity = (phase: 'sunrise' | 'day' | 'sunset' | 'night') => {
        const p = sunProgress;

        switch (phase) {
            case 'sunrise':
                // Visible from -0.1 to 0.2, peak at 0.05
                if (p < -0.1 || p > 0.2) return 0;
                return 1 - Math.abs((p - 0.05) / 0.15); // Triangle wave approx

            case 'day':
                // Visible 0.1 to 0.7, peak 0.3-0.5
                if (p < 0.1 || p > 0.7) return 0;
                if (p >= 0.25 && p <= 0.55) return 1; // Full day
                if (p < 0.25) return (p - 0.1) / 0.15; // Fade in
                return (0.7 - p) / 0.15; // Fade out

            case 'sunset':
                // Visible 0.55 to 0.85, peak 0.75
                if (p < 0.55 || p > 0.85) return 0;
                if (p >= 0.7 && p <= 0.8) return 1;
                if (p < 0.7) return (p - 0.55) / 0.15;
                return (0.85 - p) / 0.05;

            case 'night':
                // Visible > 0.8 or < -0.1
                if (p > 0.8) return Math.min(1, (p - 0.8) / 0.1); // Fade in evening
                if (p < -0.1) return Math.min(1, (-0.1 - p) / 0.1); // Fade in pre-dawn
                if (p > -0.1 && p < 0.8) return 0; // Day time
                return 1; // Deep night
        }
    };

    // Sun Position Calculation (Parabolic Arc)
    // x: 0% -> 100% (Linear)
    // y: 100% -> 10% (Top) -> 100% (Parabola)
    // Only visible roughly 0 to 1
    const sunX = sunProgress * 100;
    // Parabola: y = 4 * (x - 0.5)^2 + k.  At x=0.5, y=0 (top). At x=0/1, y=1 (bottom).
    // Let's map 0->1 range for visual top padding.
    // CSS 'top': 10% (noon) to 110% (horizon)
    const sunY = 10 + 100 * (4 * Math.pow(sunProgress - 0.5, 2));

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-black transition-colors duration-1000">

            {/* 1. Background Layers (Cross-fading) */}
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ background: GRADIENTS.night, opacity: getOpacity('night') }} />
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ background: GRADIENTS.sunset, opacity: getOpacity('sunset') }} />
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ background: GRADIENTS.day, opacity: getOpacity('day') }} />
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ background: GRADIENTS.sunrise, opacity: getOpacity('sunrise') }} />

            {/* 2. The Celestial Bodies */}

            {/* Sun */}
            <div
                className="absolute w-24 h-24 rounded-full blur-[2px] transition-all duration-[20s] ease-linear"
                style={{
                    left: `calc(${sunX}% - 3rem)`, // Centered
                    top: `${sunY}%`,
                    background: 'radial-gradient(circle, #FFF 20%, #FDB813 60%, transparent 100%)',
                    boxShadow: '0 0 60px 20px rgba(253, 184, 19, 0.6)',
                    opacity: (sunProgress > -0.1 && sunProgress < 1.1) ? 1 : 0
                }}
            />

            {/* Stars (Only at Night) */}
            <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: getOpacity('night') }}>
                {mounted && Array.from({ length: 100 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 80}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 2 + 1}px`,
                            height: `${Math.random() * 2 + 1}px`,
                            opacity: Math.random() * 0.8 + 0.2,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            {/* Clouds (Existing Logic - overlaying) */}
            {/* Reduce opacity at night */}
            <div className={`transition-opacity duration-3000 ${sunProgress > 0.8 || sunProgress < 0.1 ? 'opacity-30' : 'opacity-80'}`}>
                {/* Simplified Cloud Layers slightly for performance/cleanliness with new bg */}
                <div className="absolute top-0 left-0 w-[200%] h-full flex animate-cloud-slow opacity-60 pointer-events-none mix-blend-screen">
                    <div className="w-1/2 h-full relative" style={{ transform: 'scale(1.5)' }}>
                        <div className="absolute top-[20%] left-[10%] w-[500px] h-[200px] rounded-full bg-white blur-[40px] opacity-60" />
                        <div className="absolute top-[10%] left-[60%] w-[400px] h-[180px] rounded-full bg-white blur-[50px] opacity-50" />
                    </div>
                </div>
            </div>

        </div>
    );
}
