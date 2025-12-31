'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import CloudBackground from '@/components/CloudBackground';
import { UnitToggle } from '@/components/UnitProvider';
import GradualBlur from '@/components/GradualBlur';

interface WeatherLayoutProps {
    children: ReactNode;
    timezone: number;
    sunrise: string;
    sunset: string;
}

export default function WeatherLayout({ children, timezone, sunrise, sunset }: WeatherLayoutProps) {
    return (
        <main className="h-screen w-full relative overflow-hidden font-sans selection:bg-blue-500/30 text-white">
            {/* Cinematic Video/Cloud Background */}
            <CloudBackground timezone={timezone} sunrise={sunrise} sunset={sunset} />

            {/* Top Left Logo */}
            <div className="absolute top-4 left-4 z-[100] group cursor-pointer animate-float-slow">
                {/* Frosted Glass Pill - Matched to Top Right */}
                <div className="hyper-glass h-[40px] px-4 flex items-center gap-3 rounded-full hover:bg-white/10 transition-all">

                    {/* Logo Circle - Crisp & Clean */}
                    <div className="relative w-6 h-6 shrink-0 overflow-hidden rounded-full">
                        <Image
                            src="/logo.png"
                            alt="WeatherX Logo"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Text */}
                    <span className="text-lg font-bold tracking-wide text-white drop-shadow-sm hidden sm:block">
                        WeatherX
                    </span>
                </div>
            </div>

            {/* Top Right Unit Toggle - Fixed Z-Index Higher than Blur */}
            <div className="absolute top-4 right-4 z-[100]">
                <div className="hyper-glass w-auto px-4 h-[40px] flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer rounded-full">
                    <UnitToggle />
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="w-full h-full overflow-y-auto no-scrollbar relative">
                <div className="max-w-[1400px] mx-auto z-10 relative flex flex-col p-6 min-h-screen gap-6 pb-32">
                    {children}
                </div>

                <GradualBlur
                    target="parent"
                    position="bottom"
                    height="2.5rem"
                    strength={1.5}
                    divCount={4}
                    curve="bezier"
                    exponential={true}
                    opacity={0.9}
                    style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
                />
            </div>
        </main>
    );
}
