'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MapPin, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSavedLocations, removeLocation } from '@/lib/locationCookie';
import { LogoPill } from './WeatherLayout';

interface SavedLocationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SavedLocationsDrawer({ isOpen, onClose }: SavedLocationsDrawerProps) {
    const [locations, setLocations] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setLocations(getSavedLocations());
        }
    }, [isOpen]);

    const handleSelect = (city: string) => {
        router.push(`/?city=${encodeURIComponent(city)}`);
        onClose();
    };

    const handleDelete = (e: React.MouseEvent, city: string) => {
        e.stopPropagation();
        removeLocation(city);
        setLocations(getSavedLocations());
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140]"
                    />

                    {/* Drawer Wrapper */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                        className="fixed top-0 left-0 h-full w-[340px] max-w-[85vw] z-[150] flex flex-col p-4 pointer-events-none"
                    >
                        {/* Glass Panel - The blurred part */}
                        <div
                            className="h-full w-full flex flex-col overflow-hidden relative pointer-events-auto"
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(24px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                                border: '1px solid rgba(255, 255, 255, 0.18)',
                                borderRadius: '22px',
                                boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.3)',
                                marginTop: '4px' // Slight offset to match layout top
                            }}
                        >
                            {/* Centered Logo with Sunset Glow */}
                            <div className="absolute top-[28px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                                {/* Sunset Glow Layer */}
                                <div
                                    className="absolute inset-0 -z-10 blur-[40px] opacity-40 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-full"
                                    style={{ transform: 'scale(2.5)' }}
                                />
                                <div className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                                    <LogoPill isFloating={false} />
                                </div>
                            </div>

                            {/* Close Button - Moved to corner */}
                            <div className="absolute top-4 right-4 z-30">
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Header Spacer - Moves content below logo (28px top + 40px height + extra padding) */}
                            <div className="pt-[100px] px-6 mb-4">
                                <h2 className="text-2xl font-bold tracking-tight text-white text-center">Saved Locations</h2>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 no-scrollbar">
                                {locations.length === 0 ? (
                                    <div className="text-center py-10 text-white/50">
                                        <p className="font-medium text-lg">No saved locations</p>
                                        <p className="text-sm">Star a city to save it for quick access.</p>
                                    </div>
                                ) : (
                                    locations.map((city) => (
                                        <motion.div
                                            key={city}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelect(city)}
                                            className="group relative h-[42px] px-5 flex items-center justify-between cursor-pointer rounded-full transition-all border border-white/30 bg-white/10 hover:bg-white/20"
                                            style={{
                                                backdropFilter: 'blur(8px)',
                                                WebkitBackdropFilter: 'blur(8px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 0 8px rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <MapPin className="w-4 h-4 text-white/60 shrink-0" />
                                                <span className="font-semibold text-white truncate text-base">{city}</span>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={(e) => handleDelete(e, city)}
                                                    className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <Navigation className="w-3.5 h-3.5 text-white/40" />
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {/* Placeholder for Ahmedabad if it's not in the list (as requested "for now show: Ahmedabad") */}
                                {!locations.includes('Ahmedabad') && locations.length === 0 && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group relative h-[42px] px-5 flex items-center justify-between cursor-pointer rounded-full transition-all border border-white/30 bg-white/18 hover:bg-white/25"
                                        style={{
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 0 8px rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-white/60 shrink-0" />
                                            <span className="font-semibold text-white text-base">Ahmedabad</span>
                                        </div>
                                        <Navigation className="w-3.5 h-3.5 text-white/40" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 text-center">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                                    WeatherX Premium Glass
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
