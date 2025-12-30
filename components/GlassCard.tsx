'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface GlassCardProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string; // Allow overriding height/padding if needed
    onClick?: () => void;
}

import { useTimeTheme } from '@/components/ui/TimeTheme';

export default function GlassCard({ title, icon: Icon, children, className, onClick }: GlassCardProps) {
    const { isMorning, isAfternoon } = useTimeTheme();

    // Day themes use darker borders/shadows
    const isDay = isMorning || isAfternoon;
    const dayBorderStyles = isDay ? '!border-black/15 !shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]' : '';

    // Text Colors
    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const subTextColor = isMorning ? 'text-[#1A2B44]/70' : (isAfternoon ? 'text-[#3B2200]/70' : 'text-slate-200');
    const iconColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-slate-200');

    return (
        <motion.div
            className={`h-full rounded-xl ${className || ''} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: isDay ? "0 20px 40px -10px rgba(0,0,0,0.15)" : "0 20px 40px -10px rgba(0,0,0,0.5)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Card className={`liquid-glass p-3 flex flex-col justify-between border-0 group hover:bg-white/20 transition-colors relative overflow-hidden h-full ${textColor} ${dayBorderStyles}`}>
                <div className={`flex items-center gap-2 z-10 ${isDay ? 'opacity-100' : 'opacity-80'}`}>
                    <Icon className={`w-4 h-4 uppercase ${iconColor}`} />
                    <span className={`text-xs font-semibold tracking-wider uppercase truncate ${subTextColor}`}>{title}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center w-full relative text-center z-10 mt-1">
                    {children}
                </div>
            </Card>
        </motion.div>
    );
}
