'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { Activity, Cloud as CloudIcon, Thermometer } from 'lucide-react';
import { useUnit } from './UnitProvider';
import { useTimeTheme } from '@/components/ui/TimeTheme';
import { StaggerContainer, FadeInItem } from '@/components/ui/motion-wrappers';

import { DetailType } from './WeatherDetailPanel';

interface RightPanelProps {
    temp: number;
    feelsLike: number;
    airQuality: number;
    clouds: number;
    onDetailClick: (type: DetailType) => void;
}

// ... (helpers remain same)
function getTempDesc(temp: number, unit: 'C' | 'F') {
    const t = temp;
    if (t < 10) return "Cold weather";
    if (t < 18) return "Cool and pleasant";
    if (t < 26) return "Comfortable temperature";
    if (t < 32) return "Warm day";
    return "Hot weather";
}

function getAQIDesc(aqi: number) {
    if (aqi <= 50) return "Good – safe to breathe";
    if (aqi <= 100) return "Moderate – acceptable air";
    if (aqi <= 150) return "Unhealthy for sensitive people";
    if (aqi <= 200) return "Unhealthy air";
    return "Very unhealthy";
}

function getCloudDesc(percent: number) {
    if (percent <= 20) return "Clear skies";
    if (percent <= 40) return "Light clouds";
    if (percent <= 70) return "Partly cloudy";
    if (percent <= 90) return "Mostly cloudy";
    return "Overcast";
}

export default function SidePanel({ temp, feelsLike, airQuality, clouds, onDetailClick }: RightPanelProps) {
    const { convert, unit } = useUnit();
    const { isMorning, isAfternoon } = useTimeTheme();

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/70' : (isAfternoon ? 'text-[#3B2200]/70' : 'opacity-60');

    // Calculate display values
    const displayTemp = convert(temp);

    return (
        <StaggerContainer className={`flex flex-col gap-4 h-full ${textColor}`}>
            {/* 1. Average Temperature */}
            <FadeInItem className="flex-1 min-h-[140px]">
                <GlassCard title="Average Temperature" icon={Thermometer} className="h-full" onClick={() => onDetailClick('average')}>
                    <div className="flex flex-col items-center justify-center h-full pb-2 pointer-events-none">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`text-5xl font-light tracking-tight ${textColor}`}
                        >
                            {displayTemp}
                        </motion.span>
                        <p className={`text-base font-medium opacity-60 mt-0`}>°{unit}</p>
                        <p className={`text-xs font-medium mt-2 ${subTextColor}`}>{getTempDesc(temp, unit)}</p>
                    </div>
                </GlassCard>
            </FadeInItem>

            {/* 2. Air Quality */}
            <FadeInItem className="flex-1 min-h-[140px]">
                <GlassCard title="Air Quality" icon={Activity} className="h-full" onClick={() => onDetailClick('airQuality')}>
                    <div className="flex flex-col items-center justify-center h-full pb-2 pointer-events-none">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`text-5xl font-light tracking-tight ${textColor}`}
                        >
                            {airQuality}
                        </motion.span>
                        <p className={`text-base font-medium opacity-60 mt-0`}>AQI</p>
                        <p className={`text-xs font-medium mt-2 ${subTextColor} text-center max-w-[120px]`}>{getAQIDesc(airQuality)}</p>
                    </div>
                </GlassCard>
            </FadeInItem>

            {/* 3. Cloud Cover */}
            <FadeInItem className="flex-1 min-h-[140px]">
                <GlassCard title="Cloud Cover" icon={CloudIcon} className="h-full" onClick={() => onDetailClick('clouds')}>
                    <div className="flex flex-col items-center justify-center h-full pb-2 pointer-events-none">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`text-5xl font-light tracking-tight ${textColor}`}
                        >
                            {clouds}
                        </motion.span>
                        <p className={`text-base font-medium opacity-60 mt-0`}>%</p>
                        <p className={`text-xs font-medium mt-2 ${subTextColor}`}>{getCloudDesc(clouds)}</p>
                    </div>
                </GlassCard>
            </FadeInItem>
        </StaggerContainer>
    );
}
