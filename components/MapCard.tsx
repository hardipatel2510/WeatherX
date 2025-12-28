'use client';

import { Card } from '@/components/ui/card';
import { Map as MapIcon } from 'lucide-react';

interface MapCardProps {
    city: string;
}

export default function MapCard({ city }: MapCardProps) {
    return (
        <Card className="glass border-white/10 bg-black/20 text-white rounded-[20px] h-[180px] relative overflow-hidden group cursor-pointer p-0 shadow-lg backdrop-blur-xl">
            {/* Header Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-80 z-20">
                <MapIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Precipitation</span>
            </div>

            {/* Fake Map Background */}
            <div className="absolute inset-0 bg-[#2b2b2b] z-0">
                <div className="w-full h-full opacity-40" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #666 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-black/40 px-1.5 rounded-md backdrop-blur-md">{city}</span>
                </div>
            </div>
        </Card>
    );
}
