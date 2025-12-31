'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import CloudBackground from '@/components/CloudBackground';
import { UnitToggle } from '@/components/UnitProvider';
import GradualBlur from '@/components/GradualBlur';
import { motion, AnimatePresence } from 'framer-motion';

export function LogoPill({ isFloating = false }: { isFloating?: boolean }) {
    return (
        <motion.div
            layoutId="logo-pill"
            className="hyper-glass relative flex items-center gap-3 h-[40px] px-4 rounded-full transition-all hover:bg-white/10"
            initial={false}
            animate={{
                // Custom scaling/shadow for floating state, while inheriting core glass properties
                transform: isFloating ? 'scale(1.06)' : 'scale(1)',
                boxShadow: isFloating ? "0 20px 50px -12px rgba(0, 0, 0, 0.5)" : undefined,
            }}
            transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0,
                ease: "easeOut"
            }}
        >
            {/* Content - Clean and sharp */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="relative w-6 h-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                    <Image
                        src="/logo.png"
                        alt="WeatherX Logo"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <span className="text-lg font-bold tracking-wide text-white drop-shadow-sm hidden sm:block">
                    WeatherX
                </span>
            </div>
        </motion.div>
    );
}

interface WeatherLayoutProps {
    children: ReactNode;
    timezone: number;
    sunrise: string;
    sunset: string;
    isSavedLocationsOpen?: boolean;
}

export default function WeatherLayout({ children, timezone, sunrise, sunset, isSavedLocationsOpen = false }: WeatherLayoutProps) {
    return (
        <main className="h-screen w-full relative overflow-hidden font-sans selection:bg-blue-500/30 text-white">
            {/* Cinematic Video/Cloud Background */}
            <CloudBackground timezone={timezone} sunrise={sunrise} sunset={sunset} />

            {/* Top Left Logo - Shared Element Transition */}
            <AnimatePresence>
                {!isSavedLocationsOpen && (
                    <div className="absolute top-4 left-4 z-[100] cursor-pointer animate-float-slow">
                        <LogoPill />
                    </div>
                )}
            </AnimatePresence>

            {/* Top Right Unit Toggle - Fixed Z-Index Higher than Blur */}
            <div className="absolute top-4 right-4 z-[100]">
                <div className="hyper-glass w-auto px-4 h-[40px] flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer rounded-full">
                    <UnitToggle />
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="w-full h-full overflow-y-auto no-scrollbar relative">
                <div className="max-w-[1400px] mx-auto z-10 relative flex flex-col p-4 md:p-6 min-h-screen gap-4 md:gap-6 pb-32">
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
