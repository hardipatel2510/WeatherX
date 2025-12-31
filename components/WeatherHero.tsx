import { useState, useEffect } from 'react';
import { useUnit } from '@/components/UnitProvider';
import { useTimeTheme } from '@/components/ui/TimeTheme';
import { Star } from 'lucide-react';
import { saveLocation, removeLocation, isSaved } from '@/lib/locationCookie';

interface HeroProps {
    city: string;
    temp: number;
    condition: string;
    high: number;
    low: number;
}

export default function WeatherHero({ city, temp, condition, high, low }: HeroProps) {
    const { convert } = useUnit();
    const { isMorning, isAfternoon, isNight } = useTimeTheme();
    const [saved, setSaved] = useState(false);

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/80' : (isAfternoon ? 'text-[#3B2200]/80' : 'text-white/80');

    // Button Hover/Active styles
    const btnHover = isNight ? 'hover:bg-white/10' : 'hover:bg-black/5';

    useEffect(() => {
        setSaved(isSaved(city));
    }, [city]);

    const toggleSave = () => {
        if (saved) {
            removeLocation(city);
            setSaved(false);
        } else {
            saveLocation(city);
            setSaved(true);
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center py-2 z-10 relative ${textColor}`}>

            {/* City & Star */}
            <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-normal tracking-wide drop-shadow-md`}>{city}</h2>
                <button
                    onClick={toggleSave}
                    className={`p-1.5 rounded-full transition-all ${btnHover} active:scale-90`}
                    title={saved ? "Remove from favorites" : "Save to favorites"}
                >
                    <Star
                        className={`w-5 h-5 transition-colors ${saved ? 'fill-yellow-400 text-yellow-400' : 'opacity-50 hover:opacity-100'}`}
                    />
                </button>
            </div>

            <div className="flex items-center justify-center">
                <h1 className={`text-[64px] md:text-8xl font-thin tracking-tighter drop-shadow-lg ml-4`}>
                    {convert(temp)}°
                </h1>
            </div>
            <p className={`text-lg md:text-xl font-medium opacity-90 capitalize drop-shadow-md text-center`}>{condition}</p>
            <div className={`flex gap-4 text-sm md:text-base font-medium opacity-80 mt-0.5 ${subTextColor}`}>
                <span>H:{convert(high)}°</span>
                <span>L:{convert(low)}°</span>
            </div>
        </div>
    );
}
