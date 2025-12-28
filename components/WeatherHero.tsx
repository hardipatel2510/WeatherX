'use client';

import { useUnit } from '@/components/UnitProvider';
import { useTimeTheme } from '@/components/ui/TimeTheme';

interface HeroProps {
    city: string;
    temp: number;
    condition: string;
    high: number;
    low: number;
}

export default function WeatherHero({ city, temp, condition, high, low }: HeroProps) {
    const { convert } = useUnit();
    const { isMorning, isAfternoon } = useTimeTheme();

    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/80' : (isAfternoon ? 'text-[#3B2200]/80' : 'text-white/80');

    return (
        <div className={`flex flex-col items-center justify-center py-2 z-10 relative ${textColor}`}>
            <h2 className={`text-2xl font-normal tracking-wide drop-shadow-md`}>{city}</h2>
            <div className="flex items-start justify-center">
                <h1 className={`text-8xl font-thin tracking-tighter drop-shadow-lg ml-4`}>
                    {convert(temp)}°
                </h1>
            </div>
            <p className={`text-lg font-medium opacity-90 capitalize drop-shadow-md`}>{condition}</p>
            <div className={`flex gap-4 text-base font-medium opacity-80 mt-0.5 ${subTextColor}`}>
                <span>H:{convert(high)}°</span>
                <span>L:{convert(low)}°</span>
            </div>
        </div>
    );
}
