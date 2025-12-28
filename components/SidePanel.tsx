'use client';

import React from 'react';
import GlassCard from './GlassCard';
import { Activity, Cloud as CloudIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { useUnit } from './UnitProvider';

interface RightPanelProps {
    temp: number;
    feelsLike: number;
    airQuality: number;
    clouds: number;
}

function getAQILabel(aqi: number) {
    if (aqi === 1) return { text: 'Good', color: 'bg-green-500' };
    if (aqi === 2) return { text: 'Fair', color: 'bg-yellow-400' };
    if (aqi === 3) return { text: 'Moderate', color: 'bg-orange-400' };
    if (aqi === 4) return { text: 'Poor', color: 'bg-red-500' };
    return { text: 'Very Poor', color: 'bg-purple-500' };
}

function getCloudDesc(percent: number) {
    if (percent <= 10) return "Clear";
    if (percent <= 50) return "Scattered";
    if (percent <= 80) return "Broken";
    return "Overcast";
}

import { useTimeTheme } from '@/components/ui/TimeTheme';

export default function SidePanel({ temp, feelsLike, airQuality, clouds }: RightPanelProps) {
    const { convert } = useUnit();
    const { isMorning, isAfternoon } = useTimeTheme();

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/70' : (isAfternoon ? 'text-[#3B2200]/70' : 'opacity-60');

    return (
        <div className={`flex flex-col gap-4 h-full ${textColor}`}>
            {/* 1. Average (High/Low) */}
            <GlassCard title="Average" icon={Activity} className="flex-1 min-h-[140px]">
                <div className="flex justify-between w-full px-4 items-center h-full pb-2">
                    <div className="flex flex-col items-center">
                        <ArrowUp className="w-5 h-5 text-orange-400 mb-1 drop-shadow-sm" />
                        <span className={`text-3xl font-medium ${textColor}`}>{convert(feelsLike + 2)}°</span>
                        <span className={`text-[10px] ${subTextColor}`}>High</span>
                    </div>
                    <div className="w-px h-12 bg-white/10 mx-1" />
                    <div className="flex flex-col items-center">
                        <ArrowDown className="w-5 h-5 text-blue-400 mb-1 drop-shadow-sm" />
                        <span className={`text-3xl font-medium ${textColor}`}>{convert(feelsLike - 5)}°</span>
                        <span className={`text-[10px] ${subTextColor}`}>Low</span>
                    </div>
                </div>
            </GlassCard>

            {/* 2. Air Quality */}
            <GlassCard title="Air Quality" icon={Activity} className="flex-1 min-h-[140px]">
                <div className="flex flex-col items-center w-full pb-1">
                    <span className={`text-5xl font-light tracking-tighter drop-shadow-md ${textColor}`}>{airQuality}</span>
                    <span className={`text-lg font-medium mt-1 ${isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-slate-100')}`}>{getAQILabel(airQuality).text}</span>
                    <div className="w-full max-w-[80px] h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden border border-white/10">
                        <div className={`h-full ${getAQILabel(airQuality).color} shadow-[0_0_10px_currentColor]`} style={{ width: `${(airQuality / 5) * 100}%` }} />
                    </div>
                </div>
            </GlassCard>

            {/* 3. Cloud Cover */}
            <GlassCard title="Cloud Cover" icon={CloudIcon} className="flex-1 min-h-[140px]">
                <div className="flex flex-col items-center pb-1">
                    <span className={`text-5xl font-light tracking-tight ${textColor}`}>{clouds}%</span>
                    <span className={`text-xs font-medium mt-2 ${subTextColor}`}>{getCloudDesc(clouds)}</span>
                </div>
            </GlassCard>
        </div>
    );
}
