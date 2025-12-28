'use client';

import React from 'react';
import { getMoonPhase } from '@/utils/moonPhase';
import { Card } from '@/components/ui/card';
import { Wind, Sun, Eye, Droplets, Sunset as SunsetIcon, Moon, Gauge, Activity, ArrowUp, ArrowDown, Cloud as CloudIcon } from 'lucide-react';
import { useUnit } from '@/components/UnitProvider';
import { useTimeTheme } from '@/components/ui/TimeTheme';

interface WeatherDetailsProps {
    data: {
        windSpeed: number;
        windDeg?: number; // Optional fall back
        humidity: number;
        uvIndex: number;
        visibility: number;
        pressure: number;
        sunrise: string;
        sunset: string;
        city: string;
        feelsLike: number;
        moonPhase?: number;
        airQuality: number;
        clouds: number;
        temp: number;
    };
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

function getPhasePath(phase: number) {
    // Generate an SVG path for the moon phase
    // Phase 0..1
    // 0 = New (Dark), 0.5 = Full (Lit), 1 = New

    // We want the WHITE part of the mask (what is visible)
    // If we assume the image is the lit surface.

    // Actually, simpler logic:
    // M 50 0 A 50 50 0 1 1 50 100 ...

    // Let's use a robust approximation:
    // A circle is two arcs.
    // The terminator is an elliptical arc.

    const r = 50;
    const cx = 50;
    const cy = 50;

    // This is complex to write raw path for all phases correctly in one go without a library.
    // Let's return a circle for full, and specific shapes for others.
    // Actually, the previous 'ellipse' mask approach was cleaner for code generation. 
    // Let's revert the 'getPhasePath' usage and inline the ellipse logic which works well for visual approximation.

    return ""; // Unused, we will inline logic in the next edit to fix it.
}

// Better yet, let's just make the mask simple again in the JSX.
// M 50,0 A 50,50 0 1 1 50,100  -> Right semi-circle
// A rx,50 0 0 1 50,0          -> Terminator arc


const DetailCard = ({ title, icon: Icon, children, isMorning, isAfternoon, onClick, className }: { title: string, icon: React.ElementType, children: React.ReactNode, isMorning: boolean, isAfternoon: boolean, onClick?: () => void, className?: string }) => {
    // const { isMorning, isAfternoon } = useTimeTheme(); // Use props instead

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/70' : (isAfternoon ? 'text-[#3B2200]/70' : 'text-slate-200');
    const iconColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-slate-200');

    const isDay = isMorning || isAfternoon;
    const dayBorderStyles = isDay ? '!border-black/15 !shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]' : '';

    return (
        <Card onClick={onClick} className={`liquid-glass p-3 flex flex-col justify-between border-0 group hover:bg-white/20 transition-colors h-[170px] relative overflow-hidden ${textColor} ${dayBorderStyles} ${className}`}>
            <div className="flex items-center gap-2 opacity-80 z-10">
                <Icon className={`w-4 h-4 uppercase ${iconColor}`} />
                <span className={`text-xs font-semibold tracking-wider uppercase truncate ${subTextColor}`}>{title}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center w-full relative text-center z-10 mt-1">
                {children}
            </div>
        </Card>
    );
};

export default function WeatherDetails({ data }: WeatherDetailsProps) {
    const { convert } = useUnit();
    // const { isMorning, isAfternoon } = useTimeTheme(); // Replaced by local logic as requested
    const [mounted, setMounted] = React.useState(false);
    const [showSunrise, setShowSunrise] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Time Logic (Local Source of Truth)
    const nowLocal = new Date();
    const hour = nowLocal.getHours();
    const isMorning = hour >= 6 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 18;
    const isNight = hour >= 18 || hour < 6;

    // Color Logic
    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/70' : (isAfternoon ? 'text-[#3B2200]/70' : 'text-slate-300');
    // Graphs/Strokes
    const graphStroke = isMorning ? '#1A2B44' : (isAfternoon ? '#3B2200' : 'rgba(255,255,255,0.4)');
    const dividerColor = (isMorning || isAfternoon) ? 'bg-black/15' : 'bg-white/30';
    const compBorder = (isMorning || isAfternoon) ? 'border-black/10 bg-black/5' : 'border-white/20 bg-white/5';

    // Sunrise Specifics
    const sunriseColor = isMorning ? '#FF9F43' : (isAfternoon ? '#E67E22' : 'white'); // Orange, Dark Orange, White
    const sunFill = isMorning ? '#FF9F43' : (isAfternoon ? '#E67E22' : '#FDB813'); // Sun itself

    // Moon Phase Logic (SVG Renderer)
    // Moon Phase Logic (Enhanced Realistic Rendering)
    // approach: "Shadow Plane Masking"
    // 1. Draw a white circle (Full Moon) in the mask.
    // 2. Draw a BLACK shape representing the shadow.
    // 3. Blur the black shape to create the penumbra.
    // 4. Clip the final result to the moon circle to force a hard limb.

    const currentMoonPhase = data.moonPhase ?? 0; // 0..1
    const phaseDesc = getMoonPhaseDescription(currentMoonPhase);

    // Moon Visual Constants
    const moonRadius = 40;
    const cx = 50;
    const cy = 50;

    const rx = moonRadius * Math.cos(2 * Math.PI * currentMoonPhase);
    const isWaxing = currentMoonPhase <= 0.5;

    let shadowPath = "";
    // We trace the terminator from Bottom to Top.
    // Sweep logic matches standard Arc behavior for Bottom->Top traversal.
    const sweep = isWaxing ? (rx > 0 ? 1 : 0) : (rx < 0 ? 1 : 0);

    // Terminator Arc (Bottom -> Top)
    const termArc = `A ${Math.abs(rx)} ${moonRadius} 0 0 ${sweep} ${cx} ${cy - moonRadius}`;

    if (isWaxing) {
        // Waxing: Lit Right, Shadow Left.
        // Shadow Shape: Bottom -> Terminator(Top) -> FarTopLeft -> FarBottomLeft -> Bottom
        shadowPath = `M ${cx} ${cy + moonRadius} ${termArc} L 0 0 L 0 100 Z`;
    } else {
        // Waning: Lit Left, Shadow Right.
        // Shadow Shape: Bottom -> Terminator(Top) -> FarTopRight -> FarBottomRight -> Bottom
        shadowPath = `M ${cx} ${cy + moonRadius} ${termArc} L 100 0 L 100 100 Z`;
    }

    // Wind Direction Logic
    const windDeg = data.windDeg ?? 0;

    // Sun Cycle Logic (Real-Time)
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Helper to get City's Local Time
    const getCityLocalTime = (offsetSeconds: number) => {
        const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
        return new Date(utc + (offsetSeconds * 1000));
    };

    const cityTime = getCityLocalTime(data.timezone ?? 0);

    const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);

        // Use cityTime as base to match the day
        const d = new Date(cityTime);
        d.setHours(period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours));
        d.setMinutes(minutes);
        d.setSeconds(0);
        return d;
    };

    // Fallback if parsing fails or invalid format
    let sunriseTime = new Date(cityTime); sunriseTime.setHours(6, 0, 0);
    let sunsetTime = new Date(cityTime); sunsetTime.setHours(18, 0, 0);

    try {
        if (data.sunrise) sunriseTime = parseTime(data.sunrise);
        if (data.sunset) sunsetTime = parseTime(data.sunset);
    } catch (e) {
        // use defaults
    }

    const totalDaylight = sunsetTime.getTime() - sunriseTime.getTime();

    // Calculate Progress (0 to 1) based on real city time
    // If before sunrise, 0. If after sunset, 1.
    const progress = Math.max(0, Math.min(1, (cityTime.getTime() - sunriseTime.getTime()) / totalDaylight));

    const t = progress;
    // Quadratic Bezier Curve: P0(20,80) -> P1(100,10) -> P2(180,80)
    const bx = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 100 + t * t * 180;
    const by = (1 - t) * (1 - t) * 80 + 2 * (1 - t) * t * 10 + t * t * 80;

    // Feels Like Logic
    const diff = data.feelsLike - data.temp;
    let feelsLikeDesc = "Similar to actual temperature";
    if (diff > 1) feelsLikeDesc = "Feels warmer";
    if (diff < -1) feelsLikeDesc = "Feels cooler";

    // UV Level
    const getUVLabel = (uv: number) => {
        if (uv <= 2) return 'Low';
        if (uv <= 5) return 'Moderate';
        if (uv <= 7) return 'High';
        if (uv <= 10) return 'Very High';
        return 'Extreme';
    };

    // Pressure Logic (Physics Correct)
    // Real atmospheric pressure range: 980 (Low) -> 1013 (Normal) -> 1050 (High)
    const minPressure = 980;
    const maxPressure = 1050;
    const fallbackPressure = 1013;

    const currentPressure = (!data.pressure || isNaN(data.pressure)) ? fallbackPressure : data.pressure;

    // Clamp pressure so it never breaks the gauge
    const clampedPressure = Math.min(maxPressure, Math.max(minPressure, currentPressure));

    // Convert to 0 -> 1 range
    const pressPercentage = (clampedPressure - minPressure) / (maxPressure - minPressure);

    // Convert to gauge angle (-90° left -> +90° right)
    const pressAngle = -90 + (pressPercentage * 180);

    return (
        <div className="grid grid-cols-2 gap-3 w-full h-full">

            {/* 1. UV Index */}
            <DetailCard title="UV Index" icon={Sun} isMorning={isMorning} isAfternoon={isAfternoon}>
                <div className="relative flex flex-col items-center w-full">
                    <span className="text-5xl font-light tracking-tighter drop-shadow-md">{Math.round(data.uvIndex)}</span>
                    <span className={`text-lg font-medium mt-1 ${isMorning ? 'text-[#334155]' : (isAfternoon ? 'text-[#3B2200]' : 'text-slate-100')}`}>{getUVLabel(data.uvIndex)}</span>
                    {/* Simple heavy bar */}
                    <div className={`w-full max-w-[100px] h-2 rounded-full mt-4 overflow-hidden border ${isMorning || isAfternoon ? 'bg-black/10 border-black/10' : 'bg-white/20 border-white/10'}`}>
                        <div className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 shadow-[0_0_10px_rgba(255,255,255,0.4)]" style={{ width: `${Math.min((data.uvIndex / 11) * 100, 100)}%` }} />
                    </div>
                </div>
            </DetailCard>

            {/* 2. Wind (Compass Instrument) */}
            <DetailCard title="Wind" icon={Wind} isMorning={isMorning} isAfternoon={isAfternoon}>
                <div className="relative w-32 h-32 flex items-center justify-center mt-1 shrink-0 bg-transparent rounded-full aspect-square">
                    {/* Compass Rose */}
                    <div className={`absolute inset-0 rounded-full border backdrop-blur-sm shadow-inner ${compBorder}`} />

                    {/* Tick Marks */}
                    {[0, 90, 180, 270].map(deg => (
                        <div key={deg} className="absolute inset-0 flex justify-center p-1" style={{ transform: `rotate(${deg}deg)` }}>
                            <div className={`w-0.5 h-2 shadow-[0_0_2px_white]`} style={{ backgroundColor: graphStroke }} />
                        </div>
                    ))}
                    {[45, 135, 225, 315].map(deg => (
                        <div key={deg} className="absolute inset-0 flex justify-center p-1" style={{ transform: `rotate(${deg}deg)` }}>
                            <div className={`w-0.5 h-1.5`} style={{ backgroundColor: graphStroke, opacity: 0.6 }} />
                        </div>
                    ))}

                    {/* Labels */}
                    <span className={`absolute top-2.5 text-[9px] font-bold drop-shadow-sm ${textColor}`}>N</span>
                    <span className={`absolute bottom-2.5 text-[9px] font-bold drop-shadow-sm ${textColor}`}>S</span>
                    <span className={`absolute left-2.5 text-[9px] font-bold drop-shadow-sm ${textColor}`}>W</span>
                    <span className={`absolute right-2.5 text-[9px] font-bold drop-shadow-sm ${textColor}`}>E</span>

                    {/* Rotating Needle */}
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out" style={{ transform: `rotate(${windDeg}deg)` }}>
                        <div className="w-1.5 h-14 bg-gradient-to-t from-white/0 via-white to-white rounded-full relative shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {/* Arrowhead */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white" />
                        </div>
                    </div>

                    {/* Center Readout */}
                    <div className={`absolute flex flex-col items-center justify-center backdrop-blur-xl rounded-full w-14 h-14 border shadow-xl z-20 ${isMorning || isAfternoon ? 'bg-white/60 border-black/10' : 'bg-black/60 border-white/20'}`}>
                        <span className={`text-xl font-bold leading-none ${textColor}`}>{Math.round(data.windSpeed)}</span>
                        <span className={`text-[8px] uppercase font-medium mt-0.5 ${subTextColor}`}>mph</span>
                    </div>
                </div>
            </DetailCard>

            {/* 3. Moon Phase (Real Photo Texture + Animated Mask) */}
            <DetailCard title="Moon Phase" icon={Moon} isMorning={isMorning} isAfternoon={isAfternoon}>
                <div className="flex flex-col items-center justify-center pb-1">
                    <div className="relative w-24 h-24 filter drop-shadow-2xl">
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                            <defs>
                                <filter id="termBlur" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <mask id="moonMask">
                                    <rect x="-50" y="-50" width="200" height="200" fill="white" />
                                    <path d={shadowPath} fill="black" filter="url(#termBlur)" />
                                </mask>
                                <clipPath id="circleClip">
                                    <circle cx="50" cy="50" r={moonRadius} />
                                </clipPath>
                            </defs>

                            {/* 1. Base: Black Background (The Dark Side) */}
                            <circle cx="50" cy="50" r={moonRadius} fill="#050505" />

                            {/* 2. Texture: Masked by Phase */}
                            <g mask="url(#moonMask)">
                                <image
                                    href="/moon_texture.png"
                                    x="0" y="0" width="100" height="100"
                                    clipPath="url(#circleClip)"
                                    className="brightness-125 contrast-110"
                                    style={{ transformOrigin: 'center', transform: 'scale(1.02)' }}
                                />
                            </g>

                            {/* 3. Rim Light (Edge Definition) */}
                            <circle cx="50" cy="50" r={moonRadius} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" opacity="0.6" />
                            {/* Inner shadow simulation */}
                            <circle cx="50" cy="50" r={moonRadius} fill="none" stroke="black" strokeWidth="2" opacity="0.3" style={{ mixBlendMode: 'overlay' }} />
                        </svg>
                    </div>
                    {/* Typography: Bold White Apple Style */}
                    <div className="flex flex-col items-center mt-0">
                        <span className={`text-[17px] font-semibold tracking-wide text-white drop-shadow-md`}>
                            {phaseDesc}
                        </span>
                        <span className={`text-[11px] font-medium opacity-60 uppercase tracking-wider ${textColor}`}>
                            Illumination: {Math.round((1 - Math.abs(currentMoonPhase - 0.5) * 2) * 100)}%
                        </span>
                    </div>
                </div>
            </DetailCard>

            {/* 4. Humidity */}
            <DetailCard title="Humidity" icon={Droplets} isMorning={isMorning} isAfternoon={isAfternoon}>
                <div className="flex flex-col items-center pb-2">
                    <span className="text-4xl font-light tracking-tight text-white">{data.humidity}%</span>
                    <span className="text-xs font-medium opacity-70 mt-2">Dew Point: {convert(data.feelsLike - 2)}°</span>
                </div>
            </DetailCard>

            {/* 5. Visibility */}
            <DetailCard title="Visibility" icon={Eye} isMorning={isMorning} isAfternoon={isAfternoon}>
                <div className="flex flex-col items-center pb-2">
                    <span className="text-4xl font-light tracking-tight text-white">{data.visibility} <span className="text-lg font-medium opacity-60">km</span></span>
                    <span className="text-xs font-medium opacity-70 mt-2">Clear View</span>
                </div>
            </DetailCard>

            {/* 6. Pressure (Analog Barometer - Physics Correct) */}
            <DetailCard title="Pressure" icon={Gauge} isMorning={isMorning} isAfternoon={isAfternoon}>
                <div className="relative w-full h-full flex flex-row items-center justify-between px-1">
                    {/* 1. Gauge Container (Left Side) */}
                    <div className="relative w-[65%] h-full flex items-end justify-center pb-1">
                        <svg viewBox="0 0 160 100" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="pressureColorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />    {/* Blue */}
                                    <stop offset="25%" stopColor="#10b981" />   {/* Green */}
                                    <stop offset="50%" stopColor="#facc15" />   {/* Yellow */}
                                    <stop offset="75%" stopColor="#f97316" />   {/* Orange */}
                                    <stop offset="100%" stopColor="#ef4444" />  {/* Red */}
                                </linearGradient>
                            </defs>

                            {/* Ticks */}
                            <path
                                d="M 15 85 A 65 65 0 0 1 145 85"
                                fill="none"
                                stroke={isMorning || isAfternoon ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}
                                strokeWidth="10"
                                strokeLinecap="butt"
                                strokeDasharray="2 3"
                            />

                            {/* Colored Arc */}
                            <path
                                d="M 15 85 A 65 65 0 0 1 145 85"
                                fill="none"
                                stroke="url(#pressureColorGrad)"
                                strokeWidth="10"
                                strokeLinecap="butt"
                                strokeDasharray="2 3"
                            />

                            {/* Needle */}
                            <g style={{ transform: `rotate(${pressAngle}deg)`, transformOrigin: '80px 85px' }} className="transition-transform duration-1000 ease-out">
                                <line x1="80" y1="85" x2="80" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="80" cy="85" r="4" fill="white" />
                            </g>
                        </svg>

                        {/* Labels on Gauge */}
                        <div className="absolute bottom-1 w-full flex justify-between px-1">
                            <span className={`text-[9px] font-bold opacity-60 ${textColor}`}>Low</span>
                            <span className={`text-[9px] font-bold opacity-60 ${textColor}`}>High</span>
                        </div>
                    </div>

                    {/* 2. Value on Right Side */}
                    <div className="flex-1 flex flex-col items-end justify-center pr-2">
                        <span className={`text-3xl font-bold leading-none tracking-tight ${textColor}`}>{Math.round(currentPressure)}</span>
                        <span className={`text-[10px] font-bold opacity-60 uppercase mt-0.5 ${textColor}`}>mbar</span>
                    </div>
                </div>
            </DetailCard>


            {/* 7. Sunrise (Instrument) - Interactive */}
            <DetailCard
                title="Sunrise"
                icon={SunsetIcon}
                isMorning={isMorning}
                isAfternoon={isAfternoon}
                onClick={() => setShowSunrise(true)}
                className="cursor-pointer"
            >
                <div className="relative w-full h-full flex flex-col justify-end pb-1 pointer-events-none">
                    {/* Visual Arc Graph */}
                    <div className="relative w-full h-16 mb-2">
                        {/* Horizon Line */}
                        <div className={`absolute bottom-1 left-0 right-0 h-px ${dividerColor}`} />

                        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                            <defs>
                                <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="6" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Path */}
                            <path d="M 20 80 Q 100 10 180 80" fill="none" stroke={sunriseColor} strokeWidth="3" strokeDasharray="4 4" opacity="0.6" />

                            {/* Moving Sun (visible only if daytime) */}
                            {progress >= 0 && progress <= 1 && (() => {
                                // Determine Sun Color based on progress
                                let sunColor = "#FDB813"; // Morning default
                                if (progress > 0.3 && progress < 0.7) sunColor = "#FF8C00"; // Afternoon
                                if (progress >= 0.7) sunColor = "#FF5E3A"; // Evening

                                return (
                                    <g transform={`translate(${bx}, ${by})`}>
                                        {/* Glow Layer */}
                                        <circle r="14" fill={sunColor} opacity="0.4" filter="url(#sunGlow)" />

                                        {/* Rays */}
                                        {[0, 45, 90, 135, 180, 225, 270, 315].map(d => (
                                            <line
                                                key={d}
                                                x1="0" y1="-9" x2="0" y2="-12"
                                                stroke={sunColor}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                transform={`rotate(${d})`}
                                            />
                                        ))}

                                        {/* Main Sun Disk */}
                                        <circle r="6" fill={sunColor} stroke="white" strokeWidth="1.5" />
                                    </g>
                                );
                            })()}

                            {/* Sunrise/Sunset Markers */}
                            <circle cx="20" cy="80" r="3" fill={sunriseColor} />
                            <circle cx="180" cy="80" r="3" fill={sunriseColor} />
                        </svg>
                    </div>

                    <div className="flex justify-between items-end px-2">
                        <div className="flex flex-col">
                            <span className={`text-[9px] uppercase font-bold mb-0.5 ${subTextColor}`}>Sunrise</span>
                            <span className={`text-lg font-semibold tracking-wide leading-none ${textColor}`}>{data.sunrise}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`text-[9px] uppercase font-bold mb-0.5 ${subTextColor}`}>Sunset</span>
                            <span className={`text-lg font-medium leading-none ${textColor}`}>{data.sunset}</span>
                        </div>
                    </div>
                </div>
            </DetailCard>

            {/* 8. Feels Like */}
            <DetailCard title="Feels Like" icon={Activity} isMorning={isMorning} isAfternoon={isAfternoon}>
                <div className="flex flex-col items-center justify-center h-full pb-2">
                    <span className={`text-5xl font-light tracking-tighter drop-shadow-md ${textColor}`}>{convert(Math.round(data.feelsLike))}°</span>
                    <span className="text-xs font-medium opacity-70 mt-2">{feelsLikeDesc}</span>
                </div>
            </DetailCard>

            {/* Sunrise Detail Side Panel */}
            {showSunrise && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowSunrise(false)}
                    />

                    {/* Right-Side Panel */}
                    <div className={`relative w-full max-w-md h-full bg-white/30 backdrop-blur-2xl border-l border-white/20 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col p-6 overflow-y-auto ${textColor}`}>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-lg font-semibold flex items-center gap-2">
                                <SunsetIcon className="w-5 h-5" /> Sunrise & Sunset
                            </span>
                            <button
                                onClick={() => setShowSunrise(false)}
                                className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Large Sunrise Time */}
                        <div className="flex flex-col items-center mb-8">
                            <span className="text-6xl font-light tracking-tight">{data.sunrise}</span>
                            <span className="text-sm font-medium opacity-60 mt-2 uppercase tracking-wide">Sunrise Today</span>
                        </div>

                        {/* Sun Arc Graph */}
                        <div className="relative w-full h-40 mb-10">
                            {/* Horizon Line */}
                            <div className={`absolute bottom-4 left-0 right-0 h-px ${dividerColor}`} />

                            <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="arcGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FDB813" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#FDB813" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Daylight Arc Path */}
                                <path d="M 30 130 Q 150 10 270 130" fill="url(#arcGradient)" stroke="#FDB813" strokeWidth="3" strokeDasharray="4 4" opacity="0.6" />

                                {/* Moving Sun */}
                                {progress >= 0 && progress <= 1 && (() => {
                                    // Bezier for 300x150 canvas
                                    // P0=(30,130), P1=(150,10), P2=(270,130)
                                    const gx = (1 - progress) * (1 - progress) * 30 + 2 * (1 - progress) * progress * 150 + progress * progress * 270;
                                    const gy = (1 - progress) * (1 - progress) * 130 + 2 * (1 - progress) * progress * 10 + progress * progress * 130;

                                    let sunColor = isMorning ? "#FDB813" : (isAfternoon ? "#FF8C00" : "#FF5E3A");

                                    return (
                                        <g transform={`translate(${gx}, ${gy})`}>
                                            <circle r="22" fill={sunColor} opacity="0.3" filter="url(#sunGlow)" />
                                            <circle r="10" fill={sunColor} stroke="white" strokeWidth="2.5" />
                                            {/* Vertical drop line to timeline */}
                                            <line x1="0" y1="10" x2="0" y2={130 - gy} stroke={sunColor} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                                        </g>
                                    );
                                })()}

                                {/* Labels */}
                                <text x="30" y="145" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">Sunrise</text>
                                <text x="270" y="145" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">Sunset</text>
                            </svg>
                        </div>

                        {/* Detailed Data List */}
                        <div className="space-y-6">
                            {/* First Light */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-sm font-medium opacity-70">First Light</span>
                                <span className="text-lg font-semibold">
                                    {/* Mock: Sunrise - 30 mins */}
                                    {(() => {
                                        const d = new Date(sunriseTime);
                                        d.setMinutes(d.getMinutes() - 30);
                                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    })()}
                                </span>
                            </div>

                            {/* Sunrise */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-sm font-medium opacity-70">Sunrise</span>
                                <span className="text-lg font-semibold">{data.sunrise}</span>
                            </div>

                            {/* Sunset */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-sm font-medium opacity-70">Sunset</span>
                                <span className="text-lg font-semibold">{data.sunset}</span>
                            </div>

                            {/* Last Light */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-sm font-medium opacity-70">Last Light</span>
                                <span className="text-lg font-semibold">
                                    {/* Mock: Sunset + 30 mins */}
                                    {(() => {
                                        const d = new Date(sunsetTime);
                                        d.setMinutes(d.getMinutes() + 30);
                                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    })()}
                                </span>
                            </div>

                            {/* Total Daylight */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-sm font-medium opacity-70">Total Daylight</span>
                                <span className="text-lg font-semibold">{Math.floor(totalDaylight / (1000 * 60 * 60))}h {Math.floor((totalDaylight / (1000 * 60)) % 60)}m</span>
                            </div>

                            {/* Averages (Mock) */}
                            <div className="pt-4">
                                <h4 className="text-xs font-bold uppercase opacity-50 mb-3">Averages</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm opacity-70">Longest Day</span>
                                    <span className="text-sm font-medium">13h 45m</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm opacity-70">Shortest Day</span>
                                    <span className="text-sm font-medium">10h 15m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
