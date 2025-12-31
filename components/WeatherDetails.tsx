'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Wind, Sun, Eye, Droplets, Sunset as SunsetIcon, Moon, Gauge, Activity } from 'lucide-react';
import { useUnit } from '@/components/UnitProvider';
import { WeatherDetailPanel, DetailType } from './WeatherDetailPanel';
import { WeatherData } from '@/lib/weather';
import { StaggerContainer, FadeInItem } from '@/components/ui/motion-wrappers';
import { useTimeTheme } from '@/components/ui/TimeTheme';
import { MoonPhaseVisual } from './MoonPhaseVisual';

interface WeatherDetailsProps {
    data: WeatherData;
    onDetailClick: (type: DetailType) => void;
}

// Helpers
function getUVLabel(uv: number) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
}

function getMoonPhaseDescription(phase: number) {
    if (phase === 0 || phase === 1) return "New Moon";
    if (phase < 0.25) return "Waxing Crescent";
    if (phase === 0.25) return "First Quarter";
    if (phase < 0.5) return "Waxing Gibbous";
    if (phase === 0.5) return "Full Moon";
    if (phase < 0.75) return "Waning Gibbous";
    if (phase === 0.75) return "Last Quarter";
    return "Waning Crescent";
}

const DetailCard = ({ title, icon: Icon, children, isMorning, isAfternoon, onClick, className, allowOverflow = false }:
    { title: string, icon: React.ElementType, children: React.ReactNode, isMorning: boolean, isAfternoon: boolean, onClick?: () => void, className?: string, allowOverflow?: boolean }) => {

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/70' : (isAfternoon ? 'text-[#3B2200]/70' : 'text-slate-200');
    const iconColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-slate-200');

    // Explicitly define background styles to remove border artifact warnings
    const isDay = isMorning || isAfternoon;
    const dayBorderStyles = isDay ? '!border-black/15 !shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]' : '';

    return (
        <FadeInItem className={className}>
            <motion.div
                className="h-full rounded-xl"
                whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow: isDay ? "0 20px 40px -10px rgba(0,0,0,0.15)" : "0 20px 40px -10px rgba(0,0,0,0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <Card onClick={onClick} className={`liquid-glass p-3 flex flex-col justify-between border-0 group hover:bg-white/20 transition-colors h-[170px] relative ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} ${textColor} ${dayBorderStyles} h-full`}>
                    <div className="flex items-center gap-2 opacity-80 z-10">
                        <Icon className={`w-4 h-4 uppercase ${iconColor}`} />
                        <span className={`text-xs font-semibold tracking-wider uppercase truncate ${subTextColor}`}>{title}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center w-full relative text-center z-10 mt-1">
                        {children}
                    </div>
                </Card>
            </motion.div>
        </FadeInItem>
    );
};

export default function WeatherDetails({ data, onDetailClick }: WeatherDetailsProps) {
    const { convert, unit } = useUnit();
    const { isMorning, isAfternoon } = useTimeTheme();
    const [mounted, setMounted] = React.useState(false);

    // Single Source of Truth for Time
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    // Derived Time Logic using context values
    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/70' : (isAfternoon ? 'text-[#3B2200]/70' : 'text-slate-300');
    const graphStroke = isMorning ? '#1A2B44' : (isAfternoon ? '#3B2200' : 'rgba(255,255,255,0.4)');
    const dividerColor = (isMorning || isAfternoon) ? 'bg-black/15' : 'bg-white/30';
    const compBorder = (isMorning || isAfternoon) ? 'border-black/10 bg-black/5' : 'border-white/20 bg-white/5';
    const sunriseColor = isMorning ? '#FF9F43' : (isAfternoon ? '#E67E22' : 'white');

    const getCityLocalTime = (offsetSeconds: number) => {
        const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
        return new Date(utc + (offsetSeconds * 1000));
    };
    const cityTime = getCityLocalTime(data.timezone ?? 0);

    const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const d = new Date(cityTime);
        d.setHours(period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours));
        d.setMinutes(minutes);
        d.setSeconds(0);
        return d;
    };

    let sunriseTime = new Date(cityTime); sunriseTime.setHours(6, 0, 0);
    let sunsetTime = new Date(cityTime); sunsetTime.setHours(18, 0, 0);
    try {
        if (data.sunrise) sunriseTime = parseTime(data.sunrise);
        if (data.sunset) sunsetTime = parseTime(data.sunset);
    } catch { }

    const totalDaylight = sunsetTime.getTime() - sunriseTime.getTime();
    const progress = Math.max(0, Math.min(1, (cityTime.getTime() - sunriseTime.getTime()) / totalDaylight));

    const t = progress;
    const bx = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 100 + t * t * 180;
    const by = (1 - t) * (1 - t) * 80 + 2 * (1 - t) * t * 10 + t * t * 80;

    const currentMoonPhase = data.moonPhase ?? 0;
    const phaseDesc = getMoonPhaseDescription(currentMoonPhase);

    // Old manual SVG logic removed in favor of MoonPhaseVisual component

    const minPressure = 980;
    const maxPressure = 1045;
    const currentPressure = (!data.pressure || isNaN(data.pressure)) ? 1013 : data.pressure;
    const clampedPressure = Math.min(maxPressure, Math.max(minPressure, currentPressure));
    const pressPercentage = (clampedPressure - minPressure) / (maxPressure - minPressure);
    const pressAngle = -90 + (pressPercentage * 180);

    const windDeg = data.windDeg ?? 0;
    const feelsLikeDiff = data.feelsLike - data.temp;
    let feelsLikeDesc = "Similar to actual";
    if (feelsLikeDiff > 1) feelsLikeDesc = "Feels warmer";
    if (feelsLikeDiff < -1) feelsLikeDesc = "Feels cooler";

    return (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-full">

            {/* 1. UV Index */}
            <DetailCard
                title="UV Index"
                icon={Sun}
                isMorning={isMorning}
                isAfternoon={isAfternoon}
                className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                onClick={() => onDetailClick('uv')}
            >
                <div className="relative flex flex-col items-center w-full pointer-events-none">
                    <span className="text-5xl font-light tracking-tighter drop-shadow-md">{Math.round(data.uvIndex)}</span>
                    <span className={`text-lg font-medium mt-1 ${isMorning ? 'text-[#334155]' : (isAfternoon ? 'text-[#3B2200]' : 'text-slate-100')}`}>{getUVLabel(data.uvIndex)}</span>
                    <div className={`w-full max-w-[100px] h-2 rounded-full mt-4 overflow-hidden border ${isMorning || isAfternoon ? 'bg-black/10 border-black/10' : 'bg-white/20 border-white/10'}`}>
                        <div className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 shadow-[0_0_10px_rgba(255,255,255,0.4)]" style={{ width: `${Math.min((data.uvIndex / 11) * 100, 100)}%` }} />
                    </div>
                </div>
            </DetailCard>

            {/* 2. Wind */}
            <DetailCard
                title="Wind"
                icon={Wind}
                isMorning={isMorning}
                isAfternoon={isAfternoon}
                className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                onClick={() => onDetailClick('wind')}
            >
                <div className="relative w-32 h-32 flex items-center justify-center mt-1 shrink-0 bg-transparent rounded-full aspect-square pointer-events-none">
                    <div className={`absolute inset-0 rounded-full border backdrop-blur-sm shadow-inner ${compBorder}`} />
                    {/* Ticks */}
                    {[0, 90, 180, 270].map(deg => (
                        <div key={deg} className="absolute inset-0 flex justify-center p-1" style={{ transform: `rotate(${deg}deg)` }}>
                            <div className={`w-0.5 h-2 shadow-[0_0_2px_white]`} style={{ backgroundColor: graphStroke }} />
                        </div>
                    ))}
                    <span className={`absolute top-2.5 text-[9px] font-bold ${textColor}`}>N</span>
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out" style={{ transform: `rotate(${windDeg}deg)` }}>
                        <div className="w-1.5 h-14 bg-gradient-to-t from-white/0 via-white to-white rounded-full relative shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white" />
                        </div>
                    </div>
                    <div className={`absolute flex flex-col items-center justify-center backdrop-blur-xl rounded-full w-14 h-14 border shadow-xl z-20 ${isMorning || isAfternoon ? 'bg-white/60 border-black/10' : 'bg-black/60 border-white/20'}`}>
                        <span className={`text-xl font-bold leading-none ${textColor}`}>
                            {unit === 'C' ? Math.round(data.windSpeed * 3.6) : Math.round(data.windSpeed)}
                        </span>
                        <span className={`text-[8px] uppercase font-medium mt-0.5 ${subTextColor}`}>
                            {unit === 'C' ? 'km/h' : 'mph'}
                        </span>
                    </div>
                </div>
            </DetailCard>

            {/* 3. Moon Phase */}
            <DetailCard
                title="Moon Phase"
                icon={Moon}
                isMorning={isMorning}
                isAfternoon={isAfternoon}
                className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                onClick={() => onDetailClick('moon')}
            >
                <div className="flex flex-col items-center justify-center pb-1 pointer-events-none w-full h-full">
                    <div className="relative w-24 h-24 filter drop-shadow-2xl">
                        {/* New Moon Component */}
                        <MoonPhaseVisual
                            phase={currentMoonPhase}
                            lat={data.lat}
                            // For dashboard, assume visible or pass correct logic if data available. 
                            // DetailPanel handles fadeout. Dashboard card typically shows current state.
                            isUp={true}
                            className="w-full h-full"
                        />
                    </div>
                    <div className="flex flex-col items-center mt-2">
                        <span className={`text-[17px] font-semibold tracking-wide ${textColor} drop-shadow-md`}>{phaseDesc}</span>
                        <span className={`text-[11px] font-medium opacity-60 uppercase tracking-wider ${textColor}`}>
                            Illumination: {Math.round((1 - Math.abs(currentMoonPhase - 0.5) * 2) * 100)}%
                        </span>
                    </div>
                </div>
            </DetailCard>

            {/* 4. Humidity */}
            <DetailCard title="Humidity" icon={Droplets} isMorning={isMorning} isAfternoon={isAfternoon} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95" onClick={() => onDetailClick('humidity')}>
                <div className="flex flex-col items-center pb-2 pointer-events-none">
                    <span className="text-4xl font-light tracking-tight text-white">{data.humidity}%</span>
                    <span className="text-xs font-medium opacity-70 mt-2">Dew Point: {convert(data.feelsLike - 2)}°</span>
                </div>
            </DetailCard>

            {/* 5. Visibility */}
            <DetailCard title="Visibility" icon={Eye} isMorning={isMorning} isAfternoon={isAfternoon} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95" onClick={() => onDetailClick('visibility')}>
                <div className="flex flex-col items-center pb-2 pointer-events-none">
                    <span className="text-4xl font-light tracking-tight text-white">{data.visibility} <span className="text-lg font-medium opacity-60">km</span></span>
                    <span className="text-xs font-medium opacity-70 mt-2">Clear View</span>
                </div>
            </DetailCard>

            {/* 6. Pressure */}
            <DetailCard title="Pressure" icon={Gauge} isMorning={isMorning} isAfternoon={isAfternoon} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95" onClick={() => onDetailClick('pressure')}>
                <div className="relative w-full h-full flex flex-row items-center justify-between px-1 pointer-events-none">
                    <div className="relative w-[65%] h-full flex items-end justify-center pb-1">
                        <svg viewBox="0 0 160 100" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="pressureColorGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#facc15" /><stop offset="100%" stopColor="#ef4444" /></linearGradient>
                            </defs>
                            <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke={isMorning || isAfternoon ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"} strokeWidth="10" strokeLinecap="butt" strokeDasharray="2 3" />
                            <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="url(#pressureColorGrad)" strokeWidth="10" strokeLinecap="butt" strokeDasharray="2 3" />
                            <g style={{ transform: `rotate(${pressAngle}deg)`, transformOrigin: '80px 85px' }} className="transition-transform duration-1000 ease-out">
                                <line x1="80" y1="85" x2="80" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="80" cy="85" r="4" fill="white" />
                            </g>
                        </svg>
                        <div className="absolute bottom-1 w-full flex justify-between px-1"><span className={`text-[9px] font-bold opacity-60 ${textColor}`}>Low</span><span className={`text-[9px] font-bold opacity-60 ${textColor}`}>High</span></div>
                    </div>
                    <div className="flex-1 flex flex-col items-end justify-center pr-2">
                        <span className={`text-3xl font-bold leading-none tracking-tight ${textColor}`}>{Math.round(currentPressure)}</span>
                        <span className={`text-[10px] font-bold opacity-60 uppercase mt-0.5 ${textColor}`}>mbar</span>
                    </div>
                </div>
            </DetailCard>

            {/* 7. Sunrise */}
            <DetailCard title="Sunrise" icon={SunsetIcon} isMorning={isMorning} isAfternoon={isAfternoon} onClick={() => onDetailClick('sunrise')} allowOverflow={true} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                <div className="relative w-full h-full flex flex-col justify-end pb-1 pointer-events-none">
                    <div className="relative w-full h-16 mb-2">
                        <div className={`absolute bottom-1 left-0 right-0 h-px ${dividerColor}`} />
                        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                            <defs>
                                <filter id="sunGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" /></filter>
                                <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                    <stop offset="0%" stopColor="#FDB813" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#FDB813" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                            <path d="M 20 80 Q 100 10 180 80" fill="none" stroke={sunriseColor} strokeWidth="3" strokeDasharray="4 4" opacity="0.6" />
                            {progress >= 0 && progress <= 1 && (
                                <g transform={`translate(${bx}, ${by})`}>
                                    {/* Radial Shine */}
                                    <circle r="22" fill="url(#sunGradient)" opacity="0.6" />
                                    {/* Glow */}
                                    <circle r="10" fill="#FDB813" opacity="0.4" filter="url(#sunGlow)" />
                                    {/* Core */}
                                    <circle r="6" fill="#FDB813" stroke="white" strokeWidth="1.5" />
                                </g>
                            )}
                        </svg>
                    </div>
                    <div className="flex justify-between items-end px-2">
                        <div className="flex flex-col"><span className={`text-[9px] uppercase font-bold mb-0.5 ${subTextColor}`}>Sunrise</span><span className={`text-lg font-semibold tracking-wide leading-none ${textColor}`}>{data.sunrise}</span></div>
                        <div className="flex flex-col items-end"><span className={`text-[9px] uppercase font-bold mb-0.5 ${subTextColor}`}>Sunset</span><span className={`text-lg font-medium leading-none ${textColor}`}>{data.sunset}</span></div>
                    </div>
                </div>
            </DetailCard>

            {/* 8. Feels Like */}
            <DetailCard title="Feels Like" icon={Activity} isMorning={isMorning} isAfternoon={isAfternoon} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95" onClick={() => onDetailClick('feelsLike')}>
                <div className="flex flex-col items-center justify-center h-full pb-2 pointer-events-none">
                    <span className={`text-5xl font-light tracking-tighter drop-shadow-md ${textColor}`}>{convert(Math.round(data.feelsLike))}°</span>
                    <span className="text-xs font-medium opacity-70 mt-2">{feelsLikeDesc}</span>
                </div>
            </DetailCard>
        </StaggerContainer>
    );
}
