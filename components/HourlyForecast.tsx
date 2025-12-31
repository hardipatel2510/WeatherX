'use client';

import { Card } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Moon, Sunset } from 'lucide-react';
import { useUnit } from '@/components/UnitProvider';
import { useTimeTheme } from '@/components/ui/TimeTheme';

interface HourlyData {
    time: string;
    temp: number;
    icon: string;
}

interface HourlyForecastProps {
    data: HourlyData[];
    summary?: string;
}

const getIcon = (condition: string, isNight: boolean, isMorning: boolean) => {
    // Clean up condition text just in case
    const cond = condition.toLowerCase();

    // Mapping 'sun' to 'clear' logic from user snippet
    if (cond === "sun" || cond === "clear") {
        return isNight ? (
            <Moon className="w-5 h-5 mb-2 text-white/90" />
        ) : (
            <Sun
                className={`w-6 h-6 mb-2 text-yellow-400 ${isMorning ? "fill-yellow-300" : "fill-orange-500"}`}
            />
        );
    }

    switch (cond) {
        case "cloud":
            return (
                <Cloud
                    className={`w-6 h-6 mb-2 ${isMorning
                        ? "text-[#1A2B44] fill-slate-400/20"
                        : "text-white fill-white/10"
                        }`}
                />
            );

        case "rain":
            return (
                <CloudRain className="w-6 h-6 mb-2 text-blue-400 fill-blue-400/20" />
            );

        case "lightning":
            return <CloudLightning className="w-6 h-6 mb-2 text-purple-300" />;

        case "snow":
            return <CloudSnow className="w-6 h-6 mb-2 text-white" />;

        default:
            return (
                <Cloud className="w-6 h-6 mb-2 text-white/80 fill-white/10" />
            );
    }
};

export default function HourlyForecast({ data, summary = "Clear conditions will continue for the rest of the day." }: HourlyForecastProps) {
    const { convert } = useUnit();
    const { isMorning, isAfternoon } = useTimeTheme();

    // Ensure we fit in one row without scrolling by limiting items if necessary, 
    // but usually 6-8 items fit well on desktop. 
    // User asked for "Everything fits in one row".
    const displayData = data.slice(0, 8); // Top 8 hours

    const isDay = isMorning || isAfternoon;
    const morningCardStyles = isDay ? '!border-black/15 !shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]' : '';
    const separatorClass = isDay ? 'border-black/10' : 'border-white/20';

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/80' : (isAfternoon ? 'text-[#3B2200]/80' : 'text-white/90');
    const dividerColor = isMorning ? 'bg-[#1A2B44]/50' : (isAfternoon ? 'bg-[#3B2200]/50' : 'bg-white/50');

    return (
        <Card className={`w-full liquid-glass border-0 rounded-[24px] p-4 md:p-6 shadow-xl backdrop-blur-3xl min-h-[160px] flex flex-col justify-center ${textColor} ${morningCardStyles}`}>
            {/* Top Line Summary */}
            <div className={`flex items-center gap-1.5 opacity-70 mb-4 pb-3 border-b ${separatorClass}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${dividerColor}`} />
                <span className={`text-[10px] md:text-sm font-medium uppercase tracking-widest ${subTextColor}`}>Today&apos;s Forecast</span>
                <span className="ml-auto text-[10px] md:text-xs font-light opacity-80 truncate max-w-[150px] md:max-w-none">{summary}</span>
            </div>

            {/* Timeline Row - Horizontal Scroll on Mobile */}
            <div className="flex overflow-x-auto no-scrollbar justify-between md:justify-between items-center w-full px-2 gap-4 md:gap-0">
                {displayData.map((item, i) => {
                    // isNight Calculation:
                    // PM: >= 6 PM (except 12 PM is noon).
                    // AM: < 5 AM or 12 AM (midnight).
                    const t = parseInt(item.time);
                    const isPM = item.time.includes('PM');
                    const isNight = (isPM && t !== 12 && t >= 6) || (!isPM && (t === 12 || t < 5));

                    const isSunset = item.time === '7 PM'; // Mock sunset

                    return (
                        <div key={i} className="flex flex-col items-center gap-1 min-w-[4.5rem] md:min-w-[50px] group cursor-default shrink-0">
                            <span className="text-xs font-semibold opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">{i === 0 ? 'Now' : item.time}</span>
                            <div className="py-1 transform group-hover:-translate-y-1 transition-transform duration-300">
                                {getIcon(item.icon, isNight, isMorning)}
                            </div>
                            {isSunset ? (
                                <span className="text-xs md:text-sm font-medium text-white/90">Sunset</span>
                            ) : (
                                <span className="text-base md:text-lg font-medium tracking-tight shadow-black drop-shadow-sm group-hover:scale-110 transition-transform">
                                    {convert(item.temp)}°
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
