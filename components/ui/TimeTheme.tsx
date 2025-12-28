'use client';

// Restored TimeThemeProvider to handle time state logic globally
// Provides isMorning, isAfternoon, isNight based on timezone.

import React, { createContext, useContext, useEffect, useState } from 'react';

type TimeContextType = {
    timeState: 'morning' | 'afternoon' | 'evening' | 'night';
    isMorning: boolean;
    isAfternoon: boolean;
    isNight: boolean;
};

const TimeThemeContext = createContext<TimeContextType>({
    timeState: 'afternoon',
    isMorning: false,
    isAfternoon: true,
    isNight: false,
});

export const useTimeTheme = () => useContext(TimeThemeContext);

interface TimeThemeProviderProps {
    children: React.ReactNode;
    timezone: number; // Seconds offset from UTC
}

export function TimeThemeProvider({ children, timezone }: TimeThemeProviderProps) {
    const [timeState, setTimeState] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            // Get UTC milliseconds: current local time + (local timezone offset in min * 60000)
            const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
            // Target time in milliseconds
            const targetMs = utcMs + (timezone * 1000);
            const targetDate = new Date(targetMs);
            const hour = targetDate.getHours();

            // Logic:
            // Morning: 6 AM - 12 PM
            // Afternoon: 12 PM - 5 PM (17)
            // Evening: 5 PM - 8 PM (20)
            // Night: 8 PM - 6 AM

            if (hour >= 6 && hour < 12) return 'morning';
            if (hour >= 12 && hour < 17) return 'afternoon';
            if (hour >= 17 && hour < 20) return 'evening';
            return 'night';
        };

        setTimeState(calculateTime());

        // Update every minute
        const timer = setInterval(() => {
            setTimeState(calculateTime());
        }, 60000);

        return () => clearInterval(timer);
    }, [timezone]);

    const isMorning = timeState === 'morning';
    const isAfternoon = timeState === 'afternoon';
    const isNight = timeState === 'night' || timeState === 'evening';

    return (
        <TimeThemeContext.Provider value={{ timeState, isMorning, isAfternoon, isNight }}>
            {children}
        </TimeThemeContext.Provider>
    );
}
