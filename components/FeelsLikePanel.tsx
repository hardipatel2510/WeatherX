'use client';

import { Card } from '@/components/ui/card';

interface FeelsLikePanelProps {
    temp: number;
    feelsLike: number;
}

export default function FeelsLikePanel({ temp, feelsLike }: FeelsLikePanelProps) {
    const diff = feelsLike - temp;
    let description = "Similar to the actual temperature.";
    if (diff > 2) description = "Humidity is making it feel warmer.";
    if (diff < -2) description = "Wind factor is making it feel cooler.";

    return (
        <Card className="liquid-glass w-full h-full p-6 flex flex-col justify-between text-white border-0 relative overflow-hidden">
            {/* Soft Ambient Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex items-center gap-2 opacity-80 z-10">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/90 drop-shadow-sm">Feels Like</span>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-4 z-10 relative">
                <span className="text-7xl font-light tracking-tighter drop-shadow-md">{Math.round(feelsLike)}°</span>
            </div>

            <div className="space-y-4 z-10">
                <p className="text-sm font-medium leading-relaxed opacity-90 text-center drop-shadow-sm">
                    {description}
                </p>

                {/* Visual Scale (Light Glass Style) */}
                <div className="w-full h-2 bg-black/20 rounded-full relative overflow-hidden shadow-inner">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-300 via-white to-red-300 w-1/2 rounded-full opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 left-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] cursor-pointer hover:scale-110 transition-transform border border-white/50 ring-2 ring-white/20"
                    />
                </div>
            </div>
        </Card>
    );
}
