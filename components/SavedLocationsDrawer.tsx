'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTimeTheme } from '@/components/ui/TimeTheme';
import { getSavedLocations, removeLocation } from '@/lib/locationCookie';

interface SavedLocationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SavedLocationsDrawer({ isOpen, onClose }: SavedLocationsDrawerProps) {
    const [locations, setLocations] = useState<string[]>([]);
    const router = useRouter();
    const { isMorning, isAfternoon, isNight } = useTimeTheme();

    // Theme Colors
    const drawerBg = isNight ? 'bg-black/60 border-white/10' : 'bg-white/60 border-white/40';
    const textColor = isNight ? 'text-white' : 'text-[#1A2B44]';
    const itemHover = isNight ? 'hover:bg-white/10' : 'hover:bg-black/5';

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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed top-0 left-0 h-full w-[320px] max-w-[85vw] z-[101] backdrop-blur-xl border-r shadow-2xl ${drawerBg} flex flex-col`}
                    >
                        {/* Header */}
                        <div className={`p-6 flex items-center justify-between border-b ${isNight ? 'border-white/10' : 'border-black/5'}`}>
                            <h2 className={`text-xl font-semibold ${textColor}`}>Saved Locations</h2>
                            <button onClick={onClose} className={`p-2 rounded-full transition-colors ${itemHover} ${textColor}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                            {locations.length === 0 ? (
                                <div className={`text-center py-10 opacity-60 ${textColor}`}>
                                    <p>No saved locations.</p>
                                    <p className="text-sm mt-1">Star a city to save it!</p>
                                </div>
                            ) : (
                                locations.map((city) => (
                                    <div
                                        key={city}
                                        onClick={() => handleSelect(city)}
                                        className={`group relative p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${itemHover} ${isNight ? 'bg-white/5' : 'bg-white/40'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className={`w-4 h-4 opacity-50 ${textColor}`} />
                                            <span className={`font-medium ${textColor}`}>{city}</span>
                                        </div>

                                        <button
                                            onClick={(e) => handleDelete(e, city)}
                                            className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-500 ${textColor}`}
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
