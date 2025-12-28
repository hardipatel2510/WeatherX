'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sunrise } from 'lucide-react';

interface SunCycleProps {
    sunrise: string;
    sunset: string;
}

export default function SunCycle({ sunrise, sunset }: SunCycleProps) {
    return (
        <Card className="glass border-0 bg-white/10 text-white w-full max-w-3xl mx-auto mb-20">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase opacity-70 flex items-center gap-2">
                    <Sunrise className="w-4 h-4" /> Sunrise & Sunset
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative h-32 w-full flex items-end justify-between px-4">

                    {/* Path Arc */}
                    <div className="absolute inset-0 flex items-end justify-center pb-4">
                        {/* Simple SVG Arc */}
                        <svg width="100%" height="100" viewBox="0 0 200 100" preserveAspectRatio="none" className="overflow-visible">
                            <path d="M 0 100 Q 100 -50 200 100" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
                            {/* Sun Body */}
                            {/* Calculations for cx/cy would be needed for precise placement along QP path */}
                            <circle cx="100" cy="25" r="8" fill="#FDB813" className="shadow-[0_0_20px_#FDB813]" />
                        </svg>
                    </div>

                    <div className="z-10 flex flex-col items-center">
                        <span className="text-xs opacity-70">Sunrise</span>
                        <span className="text-lg font-semibold">{sunrise}</span>
                    </div>

                    <div className="z-10 flex flex-col items-center">
                        <span className="text-xs opacity-70">Sunset</span>
                        <span className="text-lg font-semibold">{sunset}</span>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
