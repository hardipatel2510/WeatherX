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
            const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
            const targetMs = utcMs + (timezone * 1000);
            const targetDate = new Date(targetMs);
            const hour = targetDate.getHours();

            let state: 'morning' | 'afternoon' | 'evening' | 'night' = 'night';
            let gradient = 'radial-gradient(circle at 50% -20%, #240046 0%, #3c096c 40%, #10002b 100%)'; // Default Night

            if (hour >= 6 && hour < 12) {
                state = 'morning';
                // Morning: Warm Sunrise -> Soft Blue -> Light Sky
                gradient = 'radial-gradient(circle at 50% -20%, #fed9b7 0%, #f4a261 30%, #8ecae6 100%)';
            } else if (hour >= 12 && hour < 18) {
                state = 'afternoon';
                // Afternoon: Sunlight -> Bright Blue -> Deep Blue
                gradient = 'radial-gradient(circle at 50% -20%, #fff3b0 0%, #48cae4 40%, #0077b6 100%)';
            } else {
                state = 'night';
                // Night: Deep Purple -> Indigo -> Dark
                gradient = 'radial-gradient(circle at 50% -20%, #240046 0%, #3c096c 40%, #10002b 100%)';
            }

            return { state, gradient };
        };

        const updateTheme = () => {
            const { state, gradient } = calculateTime();
            setTimeState(state);
            document.documentElement.style.setProperty('--bg-gradient', gradient);
        };

        updateTheme();

        // Update every minute
        const timer = setInterval(updateTheme, 60000);

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
