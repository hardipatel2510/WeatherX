"use client";

import React, { useState } from 'react';

import {
    X, Wind, Droplets, Sun, Eye, Gauge, Cloud, Activity,
    Sunrise as SunriseIcon, Moon, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherData } from '@/lib/weather';

// Types of details we support (Extended)
export type DetailType = 'uv' | 'wind' | 'moon' | 'humidity' | 'visibility' | 'pressure' | 'clouds' | 'sunrise' | 'feelsLike' | 'aqi' | 'temp';

interface WeatherDetailPanelProps {
    type: DetailType;
    data: WeatherData;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    isMorning: boolean;
    isAfternoon: boolean;
}

// Helper to interpolate between two hourly points
const interpolate = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
};

// Formatting Helper
const formatHour = (offset: number) => {
    const now = new Date();
    now.setHours(now.getHours() + offset);
    return now.toLocaleTimeString([], { hour: 'numeric' });
};

// Generic Gauge/Graph Helpers
const getUVLevel = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'bg-green-500', advice: "No protection needed." };
    if (uv <= 5) return { label: 'Moderate', color: 'bg-yellow-500', advice: "Use sun protection." };
    if (uv <= 7) return { label: 'High', color: 'bg-orange-500', advice: "Seek shade, wear sunscreen." };
    if (uv <= 10) return { label: 'Very High', color: 'bg-red-500', advice: "Avoid midday sun." };
    return { label: 'Extreme', color: 'bg-purple-500', advice: "Stay indoors." };
};

const getAQILabel = (aqi: number) => {
    switch (aqi) {
        case 1: return { label: "Good", desc: "Air quality is satisfactory." };
        case 2: return { label: "Fair", desc: "Air quality is acceptable." };
        case 3: return { label: "Moderate", desc: "Sensitive groups may affect." };
        case 4: return { label: "Poor", desc: "Health effects possible." };
        case 5: return { label: "Very Poor", desc: "Health warnings." };
        default: return { label: "Unknown", desc: "" };
    }
};

export function WeatherDetailPanel({ type, data, onClose, onNext, onPrev, isMorning, isAfternoon }: WeatherDetailPanelProps) {
    // Timeline State: 0 (Now) to 24 (Next 24h)
    const [sliderValue, setSliderValue] = useState(0);

    // Derived Data based on Slider
    const currentHourIndex = Math.floor(sliderValue);
    const nextHourIndex = Math.min(currentHourIndex + 1, data.hourly.length - 1);
    const fraction = sliderValue - currentHourIndex;

    const currentHourData = data.hourly[currentHourIndex] || data.hourly[0];
    const nextHourData = data.hourly[nextHourIndex] || data.hourly[data.hourly.length - 1];

    // Interpolated Metrics
    const iTemp = interpolate(currentHourData?.temp ?? 0, nextHourData?.temp ?? 0, fraction);
    const iFeelsLike = interpolate(currentHourData?.feelsLike ?? 0, nextHourData?.feelsLike ?? 0, fraction);
    const iPressure = interpolate(currentHourData?.pressure ?? 1013, nextHourData?.pressure ?? 1013, fraction);
    const iWindSpeed = interpolate(currentHourData?.windSpeed ?? 0, nextHourData?.windSpeed ?? 0, fraction);
    const iWindDeg = interpolate(currentHourData?.windDeg ?? 0, nextHourData?.windDeg ?? 0, fraction);
    const iUv = interpolate(currentHourData?.uvIndex ?? 0, nextHourData?.uvIndex ?? 0, fraction);
    const iHumidity = interpolate(currentHourData?.humidity ?? 0, nextHourData?.humidity ?? 0, fraction);
    const iClouds = interpolate(currentHourData?.clouds ?? 0, nextHourData?.clouds ?? 0, fraction);


    // Theme Colors
    const textColor = isMorning || isAfternoon ? 'text-black' : 'text-white';

    // Render Content based on Type
    const renderContent = () => {
        switch (type) {
            case 'uv':
                const uvInfo = getUVLevel(iUv);
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full items-center">
                        <div className="flex flex-col items-center mb-6">
                            <span className="text-7xl font-thin">{Math.round(iUv)}</span>
                            <span className={`text-xl font-medium mt-2 px-4 py-1 rounded-full ${isMorning || isAfternoon ? 'bg-black/10' : 'bg-white/10'}`}>{uvInfo.label}</span>
                            <p className="mt-4 text-center opacity-70 max-w-xs">{uvInfo.advice}</p>
                        </div>
                        {/* Hourly UV Curve */}
                        <div className="flex-1 w-full relative min-h-[150px]">
                            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FB923C" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {(() => {
                                    const points = data.hourly.slice(0, 12).map((h, i) => {
                                        const x = (i / 11) * 300;
                                        const y = 100 - ((h.uvIndex ?? 0) / 10) * 100; // Scale 0-10
                                        return `${x},${y}`;
                                    }).join(' ');
                                    return (
                                        <>
                                            <polygon points={`0,100 ${points} 300,100`} fill="url(#uvGradient)" opacity="0.4" />
                                            <polyline points={points} fill="none" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </>
                                    );
                                })()}
                                {/* Current Time Marker */}
                                {(() => {
                                    const idx = Math.min(sliderValue, 11);
                                    const x = (idx / 11) * 300;
                                    const y = 100 - (iUv / 10) * 100;
                                    return <circle cx={x} cy={y} r="6" fill="#FB923C" stroke="white" strokeWidth="2" />;
                                })()}
                            </svg>
                        </div>
                    </motion.div>
                );

            case 'wind':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                        <span className="text-7xl font-thin mb-1">{Math.round(iWindSpeed)}<span className="text-3xl ml-2">mph</span></span>
                        <span className="text-lg opacity-70 mb-8 capitalize">{iWindSpeed > 15 ? 'Windy' : (iWindSpeed > 5 ? 'Breezy' : 'Calm')}</span>
                        {/* Compass */}
                        <div className="relative w-64 h-64 border-4 border-current opacity-80 rounded-full flex items-center justify-center mb-8">
                            {[0, 45, 90, 135, 180, 225, 270, 315].map(d => (
                                <div key={d} className="absolute w-1 h-3 bg-current" style={{ transform: `rotate(${d}deg) translateY(-120px)` }} />
                            ))}
                            <span className="absolute top-4 text-xs font-bold">N</span>
                            <span className="absolute bottom-4 text-xs font-bold">S</span>
                            <span className="absolute left-4 text-xs font-bold">W</span>
                            <span className="absolute right-4 text-xs font-bold">E</span>
                            {/* Needle */}
                            <div className="w-2 h-36 bg-red-500 rounded-full origin-center shadow-lg transition-transform duration-75 ease-linear" style={{ transform: `rotate(${iWindDeg}deg)` }}>
                                <div className="w-4 h-4 rounded-full bg-white border-2 border-red-500 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </motion.div>
                );

            case 'moon':
                // Interpolate Moon Phase (approx 1/29.5 change per day)
                const basePhase = data.moonPhase ?? 0;
                // Add tiny shift for "smooth change" effect over 24h (sliderValue)
                // 1 cycle = 29.5 days. 1 day = 1/29.5. 24h slider = +1 day roughly.
                const phaseShift = (sliderValue / 24) * (1 / 29.5);
                const phasePercent = (basePhase + phaseShift) % 1;

                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-8">
                        {/* Moon Visual */}
                        <div className="relative w-56 h-56 rounded-full bg-slate-900 overflow-hidden shadow-2xl border border-white/20">
                            <div className="absolute inset-0 bg-gray-200 opacity-90" />
                            {/* Shadow Plane Mask Logic Simplified for Panel */}
                            <div className="absolute inset-0 bg-black mix-blend-multiply transition-transform duration-300"
                                style={{
                                    transform: `translateX(${(phasePercent - 0.5) * 200}%) scale(1.1)`,
                                    filter: 'blur(8px)'
                                }}
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="text-3xl font-light">{Math.round(phasePercent * 100)}%</h3>
                            <p className="opacity-60">Illumination</p>
                            <p className="text-sm mt-4 opacity-70">Next Full Moon: {Math.round((0.5 - phasePercent + (phasePercent > 0.5 ? 1 : 0)) * 29.5)} Days</p>
                        </div>
                    </motion.div>
                );

            case 'humidity':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1">
                        <span className="text-8xl font-thin mb-4">{Math.round(iHumidity)}%</span>
                        <p className="text-xl opacity-70">Dew Point: {Math.round(iTemp - ((100 - iHumidity) / 5))}°</p>
                        <p className="text-sm opacity-50 mt-8 max-w-xs text-center">
                            {iHumidity > 60 ? "The air feels muggy." : "Comfortable humidity levels."}
                        </p>
                        <div className="w-full max-w-xs h-3 bg-white/10 rounded-full mt-12 overflow-hidden">
                            <motion.div className="h-full bg-blue-500" animate={{ width: `${iHumidity}%` }} transition={{ type: "spring", stiffness: 100 }} />
                        </div>
                    </motion.div>
                );

            case 'visibility':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1">
                        <span className="text-8xl font-thin mb-4">{data.visibility} <span className="text-3xl">km</span></span>
                        <p className="text-lg opacity-70">Fog Risk: {data.visibility < 1 ? 'High' : 'Low'}</p>
                        <p className="text-sm opacity-50 mt-8 max-w-xs text-center">
                            {data.visibility >= 10 ? "Maximum visibility. Clear conditions." : "Reduced visibility due to haze or fog."}
                        </p>
                    </motion.div>
                );

            case 'pressure':
                const pressureTrend = data.hourly[3] ? (data.hourly[3].pressure > data.pressure ? "Rising" : "Falling") : "Steady";
                // Physics-Correct Range: 980 - 1045
                const pMin = 980;
                const pMax = 1045;
                const clampedP = Math.min(pMax, Math.max(pMin, iPressure));
                const pAngle = -90 + ((clampedP - pMin) / (pMax - pMin)) * 180;

                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                        <h3 className="text-6xl font-thin mb-2">{Math.round(iPressure)}</h3>
                        <span className="text-lg opacity-60 mb-8">hPa &bull; {pressureTrend}</span>
                        {/* Barometer */}
                        <div className="relative w-60 h-60 rounded-full border-[10px] border-white/5 flex items-center justify-center shadow-inner bg-white/5">
                            <div className="absolute inset-2 rounded-full border border-dashed border-white/20 opacity-50" />
                            <div className="w-1.5 h-28 bg-red-500 origin-bottom absolute bottom-1/2 left-1/2 -translate-x-1/2 rounded-full shadow-lg transition-transform duration-75 ease-linear"
                                style={{ transform: `rotate(${pAngle}deg)` }}
                            />
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-10" />
                        </div>
                    </motion.div>
                );

            case 'sunrise':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center space-y-8">
                        <div className="text-center">
                            <span className="text-6xl font-light">{data.sunrise}</span>
                            <span className="block text-sm mt-2 opacity-60 uppercase tracking-wide">Sunrise Today</span>
                        </div>
                        {/* Mini Graph */}
                        <div className="w-full h-32 relative">
                            <svg viewBox="0 0 200 100" className="w-full h-full">
                                <path d="M 20 80 Q 100 20 180 80" fill="none" stroke="#FDB813" strokeWidth="2" strokeDasharray="4 4" />
                                <circle cx="20" cy="80" r="4" fill="#FDB813" />
                                <circle cx="180" cy="80" r="4" fill="#FDB813" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <span className="text-4xl font-light opacity-80">{data.sunset}</span>
                            <span className="block text-sm mt-2 opacity-60 uppercase tracking-wide">Sunset Today</span>
                        </div>
                    </motion.div>
                );

            case 'feelsLike':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1">
                        <span className="text-8xl font-thin mb-4">{Math.round(iFeelsLike)}°</span>
                        <p className="text-lg opacity-70 mb-8">Feels {iFeelsLike > iTemp ? 'warmer' : 'cooler'} due to wind/humidity.</p>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-8">
                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                <span className="block text-xs uppercase opacity-50">Wind</span>
                                <span className="text-xl font-medium">{Math.round(iWindSpeed)} mph</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                <span className="block text-xs uppercase opacity-50">Humidity</span>
                                <span className="text-xl font-medium">{Math.round(iHumidity)}%</span>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'clouds':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1">
                        <span className="text-8xl font-thin mb-4">{Math.round(iClouds)}%</span>
                        <p className="text-lg opacity-70">Cloud Cover</p>
                        <p className="text-sm opacity-50 mt-8 max-w-xs text-center">
                            {iClouds > 80 ? "Overcast skies." : (iClouds > 20 ? "Partly cloudy." : "Mostly clear skies.")}
                        </p>
                        <div className="mt-8 flex gap-2">
                            <Cloud className="w-12 h-12 opacity-50" />
                            <Cloud className="w-12 h-12 opacity-80" />
                            <Cloud className="w-12 h-12 opacity-30" />
                        </div>
                    </motion.div>
                );

            case 'aqi':
                const aqi = data.airQuality || 1;
                const aqiInfo = getAQILabel(aqi);
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1">
                        <span className="text-8xl font-thin mb-4">{aqi}</span>
                        <span className={`text-xl font-medium mt-2 px-6 py-1 rounded-full ${isMorning || isAfternoon ? 'bg-black/10' : 'bg-white/10'}`}>{aqiInfo.label}</span>
                        <p className="mt-8 text-center opacity-70 max-w-xs">{aqiInfo.desc}</p>
                        <div className="w-full max-w-xs h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full mt-12 relative">
                            <div className="absolute top-0 w-4 h-4 bg-white border border-black rounded-full shadow-sm -mt-1" style={{ left: `${(aqi / 5) * 100}%` }} />
                        </div>
                    </motion.div>
                );

            default:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full opacity-50">
                        <Info className="w-16 h-16 mb-4" />
                        <p>{type} Analysis</p>
                    </motion.div>
                );
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                        // Swipe left -> Next
                        if (offset.x < -50) {
                            onNext();
                        }
                        // Swipe right -> Prev
                        else if (offset.x > 50) {
                            onPrev();
                        }
                    }}
                    className={`relative w-full max-w-md h-full bg-white/30 backdrop-blur-2xl border-l border-white/20 shadow-2xl flex flex-col p-6 overflow-y-auto ${textColor}`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 shrink-0">
                        <span className="text-lg font-semibold flex items-center gap-2 capitalize">
                            {/* Icon Mapping */}
                            {type === 'uv' && <Sun className="w-5 h-5" />}
                            {type === 'wind' && <Wind className="w-5 h-5" />}
                            {type === 'pressure' && <Gauge className="w-5 h-5" />}
                            {type === 'sunrise' && <SunriseIcon className="w-5 h-5" />}
                            {type === 'moon' && <Moon className="w-5 h-5" />}
                            {type === 'humidity' && <Droplets className="w-5 h-5" />}
                            {type === 'visibility' && <Eye className="w-5 h-5" />}
                            {type === 'feelsLike' && <Activity className="w-5 h-5" />}
                            {type === 'clouds' && <Cloud className="w-5 h-5" />}
                            {type} Details
                        </span>
                        <button onClick={onClose} className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <motion.div
                        key={type} // Animate content switch
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col"
                    >
                        {renderContent()}
                    </motion.div>

                    {/* Timeline Slider (Bottom Fixed) */}
                    <div className="mt-8 pt-4 border-t border-white/10 shrink-0">
                        <div className="flex justify-between text-xs font-bold uppercase opacity-50 mb-2">
                            <span>Now</span>
                            <span>+12h</span>
                            <span>+24h</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="24"
                            step="0.1"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="text-center mt-2 text-sm font-medium opacity-60">
                            {formatHour(sliderValue)}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

