import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Calendar, X } from 'lucide-react';
import { useUnit } from '@/components/UnitProvider';
import { useTimeTheme } from '@/components/ui/TimeTheme';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface DailyForecast {
    day: string;
    min: number;
    max: number;
    icon: string;
    condition: string;
    moonrise?: number;
    moonset?: number;
    feelsLike: number;
    uvIndex: number;
    windSpeed: number;
    humidity: number;
    pop: number;
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
    const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

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

    const fiveDayData = data.slice(0, 5);

    // Weekly summary
    const generateWeeklyInsight = () => {
        const avgMax = fiveDayData.reduce((acc, curr) => acc + curr.max, 0) / 5;
        const rainDay = fiveDayData.find(d => d.icon.includes('rain'));
        const cloudDay = fiveDayData.find(d => d.icon.includes('cloud'));

        let insight = "Stable conditions expected this week.";
        if (rainDay) insight = `Expect rain on ${rainDay.day}, otherwise conditions remain stable.`;
        else if (avgMax > 25) insight = "Warm and pleasant week ahead, perfect for outdoor activities.";
        else if (avgMax < 10) insight = "Chilly week ahead, bundle up!";
        else if (cloudDay) insight = "Cloud cover increases slightly mid-week, but no major disruptions.";
        return insight;
    };

    // Daily summary
    const generateDailyInsight = (day: DailyForecast) => {
        let insight = `Expect a high of ${convert(day.max)}° and ${day.condition.toLowerCase()} skies.`;
        if (day.pop > 30) insight += ` There is a ${day.pop}% chance of precipitation.`;
        else if (day.uvIndex > 6) insight += " Ideally, wear sun protection during midday.";
        else if (day.windSpeed > 15) insight += " It might feel breezy, especially in the afternoon.";
        return insight;
    };

    return (
        <>
            <motion.div
                className="h-full rounded-[28px]"
                whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow: isDay ? "0 20px 40px -10px rgba(0,0,0,0.15)" : "0 20px 40px -10px rgba(0,0,0,0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
            >
                <Card
                    className={`liquid-glass w-full h-full p-6 flex flex-col border border-white/20 relative overflow-hidden ${textColor} ${morningCardStyles} cursor-pointer group hover:bg-white/20 transition-colors`}
                >
                    {/* Subtle background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center gap-2 opacity-80 mb-5 pl-1">
                        <Calendar className={`w-4 h-4 ${iconColor}`} />
                        <span className={`text-xs font-semibold uppercase tracking-widest drop-shadow-sm ${subTextColor}`}>5-Day Forecast</span>
                    </div>

                    <div className="flex flex-col flex-1 justify-between gap-1 pointer-events-none">
                        {fiveDayData.map((item, index) => { // Show first 5
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
                                                className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-orange-500 shadow-[0_0_12px_rgba(253,186,116,0.6)]"
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
            </motion.div>

            {/* Expanded Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); setSelectedDay(null); }}
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className={`relative w-[85vw] max-w-5xl max-h-[85vh] backdrop-blur-[30px] flex flex-col p-8 overflow-hidden rounded-[24px] shadow-2xl ${textColor}`}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6 shrink-0 border-b border-white/10 pb-4">
                                <span className="text-2xl font-bold flex items-center gap-3 capitalize tracking-tight drop-shadow-sm">
                                    <div className="p-2 rounded-xl bg-white/10 border border-white/20 shadow-inner">
                                        <Calendar className={`w-6 h-6 ${iconColor}`} />
                                    </div>
                                    5-Day Forecast
                                </span>
                                <button
                                    onClick={() => { setIsOpen(false); setSelectedDay(null); }}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-start gap-8 h-full min-h-0">
                                {/* Left Column: List */}
                                <motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className={`flex flex-col gap-2 overflow-y-auto ${selectedDay ? 'w-2/5 pr-4 border-r border-white/10' : 'w-full'}`}
                                >
                                    <LayoutGroup>
                                        {fiveDayData.map((item, index) => {
                                            const isToday = index === 0;
                                            const isSelected = selectedDay === item;
                                            const leftPct = ((item.min - globalMin) / totalRange) * 100;
                                            const widthPct = ((item.max - item.min) / totalRange) * 100;
                                            let dotLeftPct = 0;
                                            if (isToday && currentTemp !== undefined) {
                                                dotLeftPct = ((currentTemp - item.min) / (item.max - item.min)) * 100;
                                                dotLeftPct = Math.max(0, Math.min(100, dotLeftPct));
                                            }

                                            return (
                                                <motion.div
                                                    key={index}
                                                    layout
                                                    onClick={() => setSelectedDay(item)}
                                                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                                    className={`grid items-center gap-4 py-4 px-4 rounded-xl cursor-pointer transition-colors group ${isSelected ? 'bg-white/10 shadow-inner ring-1 ring-white/20' : 'hover:bg-white/5'} ${selectedDay ? 'grid-cols-[4rem_1fr]' : 'grid-cols-[6rem_4rem_1fr]'}`}
                                                >
                                                    <span className={`${selectedDay ? 'text-lg' : 'text-xl'} font-medium tracking-wide drop-shadow-sm`}>{isToday ? 'Today' : item.day.slice(0, 3)}</span>

                                                    <AnimatePresence mode='popLayout'>
                                                        {!selectedDay && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.5, width: 0 }}
                                                                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                                                                exit={{ opacity: 0, scale: 0.5, width: 0 }}
                                                                className="flex justify-center drop-shadow-md origin-center"
                                                            >
                                                                {getIcon(item.icon)}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="flex items-center gap-3 w-full">
                                                        <span className={`text-right font-medium tabular-nums drop-shadow-sm ${selectedDay ? 'text-base w-6' : 'text-xl w-10 opacity-90'}`}>{convert(item.min)}°</span>
                                                        <div className={`flex-1 rounded-full relative overflow-hidden bg-black/5 shadow-inner backdrop-blur-sm ${selectedDay ? 'h-2' : 'h-3.5'}`}>
                                                            <motion.div
                                                                initial={{ width: 0, opacity: 0 }}
                                                                animate={{ width: `${Math.max(widthPct, 5)}%`, opacity: 1 }}
                                                                transition={{ duration: 1, delay: 0.1 * index, ease: "easeOut" }}
                                                                className={`absolute top-0 bottom-0 rounded-full shadow-sm opacity-90 ${isSelected ? 'bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 brightness-110' : 'bg-gradient-to-r from-blue-300 via-green-300 via-yellow-300 to-orange-400'}`}
                                                                style={{ left: `${leftPct}%` }}
                                                            >
                                                                {isToday && currentTemp !== undefined && (
                                                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-[3px] border-white/80 shadow-md z-10" style={{ left: `${dotLeftPct}%`, transform: `translate(-50%, -50%)` }} />
                                                                )}
                                                            </motion.div>
                                                        </div>
                                                        <span className={`text-right font-bold tabular-nums drop-shadow-md ${selectedDay ? 'text-base w-6' : 'text-xl w-10'}`}>{convert(item.max)}°</span>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}

                                    </LayoutGroup>

                                    <AnimatePresence>
                                        {!selectedDay && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm flex items-start gap-4 hover:bg-white/10 transition-colors overflow-hidden"
                                            >
                                                <div className="p-3 bg-blue-500/20 rounded-full shadow-inner shrink-0 border border-blue-400/30">
                                                    <Cloud className="w-5 h-5 text-blue-100" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200/90 mb-1 drop-shadow-sm">Weekly Summary</h4>
                                                    <p className={`text-lg font-medium leading-relaxed ${textColor} drop-shadow-sm opacity-90`}>
                                                        {generateWeeklyInsight()}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Right Column: Details */}
                                <AnimatePresence mode="wait">
                                    {selectedDay && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="w-3/5 flex flex-col h-full pl-2"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-4 bg-white/10 rounded-2xl shadow-inner border border-white/20">
                                                        {getIcon(selectedDay.icon)}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-3xl font-bold drop-shadow-md">{selectedDay.day}</h2>
                                                        <p className="text-lg opacity-80 font-medium capitalize">{selectedDay.condition || 'Clear'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDay(null)}
                                                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
                                                >
                                                    Close Details
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                                                    <span className="text-sm opacity-70 font-medium uppercase tracking-wider">High / Low</span>
                                                    <span className="text-2xl font-bold drop-shadow-sm">{convert(selectedDay.max)}° / {convert(selectedDay.min)}°</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                                                    <span className="text-sm opacity-70 font-medium uppercase tracking-wider">Feels Like</span>
                                                    <span className="text-2xl font-bold drop-shadow-sm">{convert(selectedDay.feelsLike || selectedDay.max)}°</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                                                    <span className="text-sm opacity-70 font-medium uppercase tracking-wider">Wind</span>
                                                    <span className="text-2xl font-bold drop-shadow-sm">{Math.round(selectedDay.windSpeed || 0)} <span className="text-base font-normal opacity-70">{useUnit().unit === 'F' ? 'mph' : 'km/h'}</span></span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                                                    <span className="text-sm opacity-70 font-medium uppercase tracking-wider">Rain Chance</span>
                                                    <span className="text-2xl font-bold drop-shadow-sm">{selectedDay.pop || 0}%</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                                                    <span className="text-sm opacity-70 font-medium uppercase tracking-wider">Humidity</span>
                                                    <span className="text-2xl font-bold drop-shadow-sm">{selectedDay.humidity || 0}%</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                                                    <span className="text-sm opacity-70 font-medium uppercase tracking-wider">UV Index</span>
                                                    <span className="text-2xl font-bold drop-shadow-sm">{Math.round(selectedDay.uvIndex || 0)}</span>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 mt-auto">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200/90 mb-2 drop-shadow-sm">Daily Insight</h4>
                                                <p className="text-lg font-medium leading-relaxed opacity-90">
                                                    {generateDailyInsight(selectedDay)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div >
                )
                }
            </AnimatePresence >
        </>
    );
}
