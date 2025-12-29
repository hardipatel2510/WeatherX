import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Calendar, X } from 'lucide-react';
import { useUnit } from '@/components/UnitProvider';
import { useTimeTheme } from '@/components/ui/TimeTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyForecast {
    day: string;
    min: number;
    max: number;
    icon: string;
}

interface TenDayForecastProps {
    data: DailyForecast[];
    currentTemp?: number;
}

const getIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 drop-shadow-md" };
    switch (iconName) {
        case 'sun': return <Sun {...props} className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />;
        case 'cloud': return <Cloud {...props} className="w-5 h-5 text-white/90 fill-white/20" />;
        case 'rain': return <CloudRain {...props} className="w-5 h-5 text-blue-400 fill-blue-400/20" />;
        case 'lightning': return <CloudLightning {...props} className="w-5 h-5 text-purple-400" />;
        case 'snow': return <CloudSnow {...props} className="w-5 h-5 text-white" />;
        default: return <Sun {...props} className="w-5 h-5 text-yellow-400" />;
    }
};

export default function TenDayForecast({ data, currentTemp }: TenDayForecastProps) {
    const { convert } = useUnit();
    const { isMorning, isAfternoon } = useTimeTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Calculate global min and max for the bar scaling to keep bars relative to the week's weather
    if (!data || data.length === 0) return null;
    const globalMin = Math.min(...data.map(d => d.min));
    const globalMax = Math.max(...data.map(d => d.max));
    const totalRange = globalMax - globalMin || 1;

    const isDay = isMorning || isAfternoon;
    const morningCardStyles = isDay ? '!border-black/15 !shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]' : '';
    const separatorClass = isDay ? 'border-black/10' : 'border-white/5';

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/80' : (isAfternoon ? 'text-[#3B2200]/80' : 'text-white/90');
    const iconColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white/90');
    // For graphs/bars
    const barBg = isDay ? 'bg-black/10 shadow-black/5' : 'bg-black/20 dark:shadow-black/50';

    return (
        <>
            <Card
                onClick={() => setIsOpen(true)}
                className={`liquid-glass w-full h-full p-6 shadow-2xl flex flex-col border border-white/20 relative overflow-hidden ${textColor} ${morningCardStyles} cursor-pointer hover:scale-[1.02] transition-transform active:scale-95`}
            >
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center gap-2 opacity-80 mb-5 pl-1">
                    <Calendar className={`w-4 h-4 ${iconColor}`} />
                    <span className={`text-xs font-semibold uppercase tracking-widest drop-shadow-sm ${subTextColor}`}>{data.length}-Day Forecast</span>
                </div>

                <div className="flex flex-col flex-1 justify-between gap-1 pointer-events-none">
                    {data.slice(0, 7).map((item, index) => { // Show first 7 in compact view
                        const isToday = index === 0;

                        // Bar calculations
                        const leftPct = ((item.min - globalMin) / totalRange) * 100;
                        const widthPct = ((item.max - item.min) / totalRange) * 100;

                        // Dot calculations (only for Today)
                        let dotLeftPct = 0;
                        if (isToday && currentTemp !== undefined) {
                            dotLeftPct = ((currentTemp - item.min) / (item.max - item.min)) * 100;
                            dotLeftPct = Math.max(0, Math.min(100, dotLeftPct));
                        }

                        return (
                            <div key={index} className={`grid grid-cols-[3.5rem_2.5rem_1fr] items-center gap-4 py-3 border-b last:border-0 rounded-xl px-2 -mx-2 ${separatorClass}`}>
                                {/* Day Name */}
                                <span className={`text-base tracking-wide ${isToday ? 'font-bold' : 'font-medium opacity-90'} drop-shadow-sm`}>
                                    {isToday ? 'Today' : item.day.slice(0, 3)}
                                </span>

                                {/* Icon */}
                                <div className="flex justify-center">
                                    {getIcon(item.icon)}
                                </div>

                                {/* Temp Bar Section */}
                                <div className="flex items-center gap-4 w-full">
                                    <span className={`w-8 text-right text-lg font-medium tabular-nums drop-shadow-sm ${isToday ? '' : 'opacity-70'}`}>
                                        {convert(item.min)}°
                                    </span>
                                    <div className={`flex-1 h-2.5 rounded-full relative overflow-hidden backdrop-blur-sm shadow-inner ${barBg}`}>
                                        <div
                                            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-orange-500 shadow-[0_0_12px_rgba(253,186,116,0.6)]"
                                            style={{
                                                left: `${leftPct}%`,
                                                width: `${Math.max(widthPct, 5)}%`
                                            }}
                                        >
                                            {isToday && currentTemp !== undefined && (
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] border-2 border-white z-10"
                                                    style={{ left: `${dotLeftPct}%`, transform: `translate(-50%, -50%)` }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <span className={`w-8 text-right text-lg font-bold tabular-nums drop-shadow-md`}>{convert(item.max)}°</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Expanded Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        />

                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.8 }}
                            className={`relative w-full max-w-lg max-h-[85vh] bg-white/30 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col p-6 overflow-y-auto rounded-[32px] ${textColor}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6 shrink-0">
                                <span className="text-xl font-semibold flex items-center gap-2 capitalize">
                                    <Calendar className="w-6 h-6" />
                                    10-Day Forecast
                                </span>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                {data.map((item, index) => {
                                    const isToday = index === 0;
                                    const leftPct = ((item.min - globalMin) / totalRange) * 100;
                                    const widthPct = ((item.max - item.min) / totalRange) * 100;
                                    let dotLeftPct = 0;
                                    if (isToday && currentTemp !== undefined) {
                                        dotLeftPct = ((currentTemp - item.min) / (item.max - item.min)) * 100;
                                        dotLeftPct = Math.max(0, Math.min(100, dotLeftPct));
                                    }

                                    return (
                                        <div key={index} className={`grid grid-cols-[4rem_3rem_1fr] items-center gap-4 py-4 border-b last:border-0 border-white/10`}>
                                            <span className="text-lg font-medium">{isToday ? 'Today' : item.day.slice(0, 3)}</span>
                                            <div className="flex justify-center scale-110">{getIcon(item.icon)}</div>
                                            <div className="flex items-center gap-4 w-full">
                                                <span className="w-8 text-right text-lg opacity-80">{convert(item.min)}°</span>
                                                <div className="flex-1 h-3 rounded-full relative overflow-hidden bg-black/20">
                                                    <div
                                                        className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-orange-500"
                                                        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 5)}%` }}
                                                    >
                                                        {isToday && currentTemp !== undefined && (
                                                            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-white shadow-sm" style={{ left: `${dotLeftPct}%`, transform: `translate(-50%, -50%)` }} />
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="w-8 text-right text-lg font-bold">{convert(item.max)}°</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
