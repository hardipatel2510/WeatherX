"use client";

import React from 'react';
import {
    X, Wind, Droplets, Sun, Eye, Gauge, Cloud, Activity,
    Sunrise as SunriseIcon, Moon, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherData } from '@/lib/weather';
import { useUnit } from '@/components/UnitProvider';
import { MoonPhaseVisual } from './MoonPhaseVisual';
import SunCycle from './SunCycle';
import { getMoonTimes } from '@/utils/astronomy';
import { getMoonTimeline } from '@/lib/moonTimeline';

// Types of details
export type DetailType = 'uv' | 'wind' | 'moon' | 'humidity' | 'visibility' | 'pressure' | 'clouds' | 'sunrise' | 'feelsLike' | 'airQuality' | 'average';

// ... (props interface remains same)
interface WeatherDetailPanelProps {
    type: DetailType;
    data: WeatherData;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

// --- 1. Helper Functions ---
const parseTimeStr = (timeStr: string | undefined): number | null => {
    if (!timeStr) return null;
    const [t, period] = timeStr.split(' ');
    if (!t || !period) return null;
    const [h, m] = t.split(':').map(Number);
    let hours = h;
    if (period === 'PM' && h !== 12) hours += 12;
    if (period === 'AM' && h === 12) hours = 0;
    return hours * 60 + m;
};

const getCityTimeMins = (timezone: number) => {
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utcMs + (timezone * 1000));
    return (cityTime.getHours() * 60) + cityTime.getMinutes();
};

import { useTimeTheme } from '@/components/ui/TimeTheme';

export function WeatherDetailPanel({ type, data, onClose, onNext, onPrev }: WeatherDetailPanelProps) {
    const { unit } = useUnit();
    const { isMorning, isAfternoon } = useTimeTheme();
    const currentMins = getCityTimeMins(data.timezone);
    const currentUv = data.uvIndex;

    // State for accurate moon times REMOVED
    // Fetch Moon Times on Mount REMOVED

    // Dynamic BG
    React.useEffect(() => {
        const rise = parseTimeStr(data.sunrise) ?? 360;
        const set = parseTimeStr(data.sunset) ?? 1080;
        let grad = 'linear-gradient(to top, #0f2027, #2c5364)';
        if (currentMins >= rise - 60 && currentMins < rise) grad = 'linear-gradient(to top, #f83600, #f9d423)';
        else if (currentMins >= rise && currentMins < rise + 60) grad = 'linear-gradient(to top, #f83600, #f9d423)';
        else if (currentMins >= rise + 60 && currentMins < set - 60) grad = 'linear-gradient(to top, #2980b9, #ffffff)';
        else if (currentMins >= set - 60 && currentMins < set + 60) grad = 'linear-gradient(to top, #ff512f, #dd2476)';
        document.documentElement.style.setProperty('--bg-gradient', grad);
    }, [currentMins, data.sunrise, data.sunset]);

    const cardStyle = {
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '24px',
        color: 'white',
        overflow: 'hidden',
        position: 'relative' as const
    };

    const renderContent = () => {
        switch (type) {
            case 'uv':
                // ... (existing implementation)
                const uv = Math.round(data.uvIndex);
                let uvLabel =
                    uv <= 2 ? "Low – Safe to stay outside" :
                        uv <= 5 ? "Moderate – Wear sunglasses" :
                            uv <= 7 ? "High – Use sunscreen" :
                                uv <= 10 ? "Very High – Avoid long sun exposure" :
                                    "Extreme – Stay indoors";
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="text-7xl font-thin"
                        >
                            {uv}
                        </motion.span>
                        <p className="opacity-80 mt-2">UV Index</p>
                        <p className="text-sm opacity-70 mt-3 text-center">{uvLabel}</p>
                    </div>
                );

            case 'airQuality': {
                const aqi = data.airQuality;
                let label = "";
                let msg = "";
                if (aqi <= 1) { label = "Good"; msg = "Air quality is considered satisfactory, and air pollution poses little or no risk."; }
                else if (aqi === 2) { label = "Fair"; msg = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern."; }
                else if (aqi === 3) { label = "Moderate"; msg = "Members of sensitive groups may experience health effects. The general public is not likely to be affected."; }
                else if (aqi === 4) { label = "Poor"; msg = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."; }
                else { label = "Very Poor"; msg = "Health warnings of emergency conditions. The entire population is more likely to be affected."; }

                // User asked for specific ranges if value is 0-500. 
                // However, OpenWeatherMap returns 1-5 index. 
                // If the user INTENDS raw AQI, we might need a different API field?
                // lib/weather.ts shows `pollutionData?.list?.[0]?.main?.aqi` which works on 1-5 scale for OWM.
                // But user provided "0-50" logic. This suggests US AQI?
                // I'll stick to OWM 1-5 scale mapping to user's text intents as best as possible or default to OWM descriptions.
                // User said: "AQI <= 50 -> Good". This implies 0-500 scale.
                // Assuming OWM returns 1-5, I should map 1->Good, 2->Fair (treated as Moderate), 3->Moderate (treated as Sensitive), 4->Poor (Unhealthy), 5->Very Poor (Hazardous).

                let userLabel = "Good";
                let userMsg = "Safe to breathe.";
                if (aqi === 1) { userLabel = "Good – safe to breathe"; userMsg = "Air quality is satisfactory."; }
                else if (aqi === 2) { userLabel = "Moderate – acceptable air"; userMsg = "Good for most, sensitive groups should be aware."; }
                else if (aqi === 3) { userLabel = "Unhealthy for Sensitive"; userMsg = "Sensitive groups should limit outdoor activity."; }
                else if (aqi === 4) { userLabel = "Unhealthy air"; userMsg = "Everyone may begin to experience health effects."; }
                else { userLabel = "Hazardous"; userMsg = "Health warnings of emergency conditions."; }

                return (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <motion.span
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="text-8xl font-thin tracking-tighter"
                        >
                            {aqi}
                        </motion.span>
                        <p className="text-lg font-medium mt-2 opacity-90">{userLabel}</p>
                        <p className="text-sm opacity-70 mt-4 max-w-xs">{userMsg}</p>
                    </div>
                );
            }

            case 'clouds': {
                const c = data.clouds;
                let desc = "Clear";
                if (c <= 20) desc = "Clear skies";
                else if (c <= 50) desc = "Partly Cloudy"; // User said 21-50 -> Partly, wait user said 21-40 Light, 41-70 Partly
                else if (c <= 80) desc = "Mostly Cloudy";
                else desc = "Overcast";

                // Adjusting to match user request strictly:
                // 0–20 → "Clear skies"
                // 21–50 → "Partly Cloudy" (User said 21-50 in prompt step 2 case clouds?)
                // Actually prompt says: 
                // 0–20 → Clear
                // 21–50 → Partly Cloudy
                // 51–80 → Mostly Cloudy
                // 81–100 → Overcast

                if (c <= 20) desc = "Clear";
                else if (c <= 50) desc = "Partly Cloudy";
                else if (c <= 80) desc = "Mostly Cloudy";
                else desc = "Overcast";

                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="text-8xl font-thin tracking-tighter"
                        >
                            {c}%
                        </motion.span>
                        <p className="text-xl font-medium mt-2 opacity-90">{desc}</p>
                    </div>
                );
            }

            case 'average': {
                const avg = Math.round((data.high + data.low) / 2);
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="text-8xl font-thin tracking-tighter"
                        >
                            {avg}°
                        </motion.span>
                        <p className="text-lg opacity-80 mt-2">Daily average temperature</p>
                    </div>
                );
            }

            // ... cases for moon, sunrise, wind, humidity, pressure, visibility, feelsLike ...
            case 'moon': {
                return (
                    <MoonDetailContent data={data} currentMins={currentMins} />
                );
            }

            case 'sunrise':
                return (
                    <SunCycle
                        sunrise={data.sunrise}
                        sunset={data.sunset}
                        timezone={data.timezone}
                    />
                );

            case 'wind': {
                const speed = Math.round(data.windSpeed);
                let feeling =
                    speed < 5 ? "Calm air" :
                        speed < 15 ? "Light breeze" :
                            speed < 30 ? "Windy" :
                                "Strong winds";
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 150 }}
                            className="text-7xl font-thin"
                        >
                            {speed}
                        </motion.span>
                        <p className="opacity-80 mt-2">km/h Wind</p>
                        <p className="text-sm opacity-70 mt-3">{feeling}</p>
                    </div>
                );
            }

            case 'humidity': {
                const h = data.humidity;
                let comfort = h < 30
                    ? "Dry air — may cause dry skin and throat"
                    : h < 50
                        ? "Comfortable humidity level"
                        : h < 70
                            ? "Slightly humid — air feels heavier"
                            : "High humidity — sticky and uncomfortable";
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="text-7xl font-thin"
                        >
                            {h}%
                        </motion.span>
                        <p className="text-center opacity-80 mt-2">Humidity</p>
                        <p className="text-sm mt-3 opacity-70 text-center max-w-xs">{comfort}</p>
                    </div>
                );
            }
            case 'pressure': {
                const p = Math.round(data.pressure);
                let trend =
                    p < 1000 ? "Low pressure – Stormy" :
                        p < 1020 ? "Normal pressure" :
                            "High pressure – Clear skies";
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="text-7xl font-thin"
                        >
                            {p}
                        </motion.span>
                        <p className="opacity-80 mt-2">hPa Pressure</p>
                        <p className="text-sm opacity-70 mt-3">{trend}</p>
                    </div>
                );
            }
            case 'visibility': {
                const v = Math.round(data.visibility);
                let label =
                    v > 10 ? "Clear view" :
                        v > 5 ? "Moderate visibility" :
                            "Poor visibility";
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 180 }}
                            className="text-7xl font-thin"
                        >
                            {v}
                        </motion.span>
                        <p className="opacity-80 mt-2">km Visibility</p>
                        <p className="text-sm opacity-70 mt-3">{label}</p>
                    </div>
                );
            }
            case 'feelsLike': {
                const actual = data.temp;
                const feels = data.feelsLike;
                const diff = Math.round(feels - actual);
                const reason = diff > 2
                    ? "Feels hotter due to heat index (humidity)"
                    : diff < -2
                        ? "Feels colder due to wind chill"
                        : "Feels close to the actual temperature";
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="text-7xl font-thin"
                        >
                            {Math.round(feels)}°
                        </motion.span>
                        <p className="text-center opacity-80 mt-2">Feels Like</p>
                        <p className="text-sm mt-3 opacity-70 text-center max-w-xs">{reason}</p>
                        <p className="text-xs opacity-50 mt-1">Actual: {Math.round(actual)}°</p>
                    </div>
                );
            }

            default:
                return <div className="flex items-center justify-center h-full opacity-50"><Info className="w-12 h-12" /></div>;
        }
    };

    // ... (rest of wrapper remains same)
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 350, damping: 25 }} className={`relative w-full max-w-md h-[80vh] flex flex-col p-6 shadow-2xl ${isMorning || isAfternoon ? 'text-black' : 'text-white'}`} style={cardStyle}>
                    <div className="flex items-center justify-between mb-6 shrink-0 z-20">
                        <span className="text-lg font-semibold flex items-center gap-2 capitalize">{type === 'average' ? 'Temperature' : type} Details</span>
                        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><X className="w-5 h-5" /></button>
                    </div>
                    <motion.div className="flex-1 relative z-10 overflow-hidden">{renderContent()}</motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

}

function MoonDetailContent({ data, currentMins }: { data: WeatherData; currentMins: number }) {
    // 1. Timeline Logic
    const timeline = React.useMemo(() => getMoonTimeline(data.lat, data.lon), [data.lat, data.lon]);
    const [selectedIdx, setSelectedIdx] = React.useState(0);
    const currentSelection = timeline[selectedIdx];

    // 2. Computed Props for Big Moon
    const phase = currentSelection.phase;
    // Illumination
    const illum = 1 - Math.abs((phase - 0.5) * 2);
    const percent = Math.round(illum * 100);

    let pName = 'New Moon';
    if (phase > 0 && phase < 0.25) pName = 'Waxing Crescent';
    else if (phase === 0.25) pName = 'First Quarter';
    else if (phase > 0.25 && phase < 0.5) pName = 'Waxing Gibbous';
    else if (phase === 0.5) pName = 'Full Moon';
    else if (phase > 0.5 && phase < 0.75) pName = 'Waning Gibbous';
    else if (phase === 0.75) pName = 'Last Quarter';
    else if (phase > 0.75 && phase < 1) pName = 'Waning Crescent';

    const { moonrise, moonset } = getMoonTimes(data.lat, data.lon, currentSelection.date);

    const formatTime = (t: number | null) =>
        t ? new Date(t * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--";

    const displayRise = formatTime(moonrise);
    const displaySet = formatTime(moonset);

    const mRise = parseTimeStr(displayRise);
    const mSet = parseTimeStr(displaySet);

    let isMoonUp = true;
    if (selectedIdx === 0 && mRise !== null && mSet !== null) {
        if (mRise < mSet) isMoonUp = currentMins >= mRise && currentMins <= mSet;
        else isMoonUp = currentMins >= mRise || currentMins <= mSet;
    } else {
        isMoonUp = true;
    }

    return (
        <div className="h-full flex flex-col overflow-y-auto overscroll-contain">
            <div className="flex flex-col items-center justify-center shrink-0 min-h-[350px] relative">
                <MoonPhaseVisual phase={phase} lat={data.lat} isUp={isMoonUp} className="w-56 h-56" />

                <h2 className="text-3xl font-light mt-8 text-center">{pName}</h2>
                <p className="text-sm opacity-60 mt-2">Illumination {percent}%</p>
                {selectedIdx === 0 && !isMoonUp && <span className="mt-2 text-xs font-bold border border-white/20 px-2 py-1 rounded">Below Horizon</span>}
            </div>

            <div className="relative w-full mt-6">
                <div className="w-full grid grid-cols-7 gap-0 justify-items-center items-center pointer-events-auto select-none">
                    {timeline.map((m, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedIdx(i)}
                            className="flex flex-col items-center justify-center cursor-pointer w-[44px] min-w-[44px]
                                        transition-transform duration-300 ease-out hover:-translate-y-2"
                        >
                            <div className="day w-[36px] h-[36px] flex items-center justify-center relative shrink-0">
                                <div
                                    className={`moon w-full h-full rounded-full overflow-hidden relative bg-black box-border transition-all duration-300
                                                ${i === selectedIdx
                                            ? "ring-2 ring-white scale-110 shadow-[0_0_14px_rgba(255,255,255,0.8)]"
                                            : "opacity-70 hover:opacity-100 hover:scale-105"}`}
                                >
                                    <div
                                        className="absolute inset-0 bg-white"
                                        style={{
                                            clipPath: `circle(${m.fraction * 50}% at ${m.waxing ? "70%" : "30%"
                                                } 50%)`
                                        }}
                                    />
                                </div>
                            </div>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-white opacity-90 mt-2 whitespace-nowrap">
                                {m.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 mb-8">
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center backdrop-blur-md transition-all">
                        <span className="text-xs uppercase opacity-50 mb-1">{selectedIdx === 0 ? "Moonrise" : "Rise"}</span>
                        <span className="text-lg">{displayRise}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center backdrop-blur-md">
                        <span className="text-xs uppercase opacity-50 mb-1">Moonset</span>
                        <span className="text-lg">{displaySet}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center backdrop-blur-md">
                        <span className="text-xs uppercase opacity-50 mb-1">Next Full</span>
                        <span className="text-lg">{Math.round((0.5 - phase + (phase > 0.5 ? 1 : 0)) * 29.5)} Days</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center backdrop-blur-md">
                        <span className="text-xs uppercase opacity-50 mb-1">Distance</span>
                        <span className="text-lg">384,400 km</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
