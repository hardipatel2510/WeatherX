'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { useTimeTheme } from '@/components/ui/TimeTheme';
import { getCityFromCoords } from '@/app/actions';

interface SearchBarProps {
    defaultValue?: string;
}

export default function SearchBar({ defaultValue = '' }: SearchBarProps) {
    const [query, setQuery] = useState(defaultValue);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const currentUnit = searchParams.get('unit') || 'imperial';
    const { isMorning, isAfternoon } = useTimeTheme();

    const isDay = isMorning || isAfternoon;

    // Text and Icon Colors
    const textColor = isMorning ? 'text-[#1A2B44]' : (isAfternoon ? 'text-[#3B2200]' : 'text-white');
    const placeholderColor = isMorning ? 'placeholder:text-[#1A2B44]/60' : (isAfternoon ? 'placeholder:text-[#3B2200]/60' : 'placeholder:text-white/60');
    const iconColor = isMorning ? 'text-[#1A2B44]/60' : (isAfternoon ? 'text-[#3B2200]/60' : 'text-white/60');
    const buttonHover = isMorning ? 'hover:text-[#1A2B44]' : (isAfternoon ? 'hover:text-[#3B2200]' : 'hover:text-white');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setLoading(true);
            router.push(`/?city=${encodeURIComponent(query.trim())}&unit=${currentUnit}`);
            setTimeout(() => setLoading(false), 2000);
        }
    };

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const cityName = await getCityFromCoords(latitude, longitude);

                        if (cityName) {
                            setQuery(cityName);
                            router.push(`/?city=${encodeURIComponent(cityName)}&unit=${currentUnit}`);
                        } else {
                            console.error("City not found for these coordinates.");
                        }
                    } catch (error) {
                        console.error("Geolocation error", error);
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error("Geolocation error", error);
                    setLoading(false);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="relative w-full flex items-center gap-3">
            {/* Compartment 1: Search Bar */}
            <form onSubmit={handleSubmit} className="flex-1 relative">
                <div className={`hyper-glass flex items-center px-4 h-[50px] transition-all hover:bg-white/10 rounded-full w-full ${isDay ? 'bg-white/40 border-white/40' : ''}`}>
                    <Search className={`w-5 h-5 mr-3 shrink-0 ${iconColor}`} />
                    <Input
                        type="text"
                        placeholder="Search for a city..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={`bg-transparent !border-none !shadow-none !ring-0 !outline-none text-lg h-full px-0 w-full ${textColor} ${placeholderColor}`}
                        disabled={loading}
                    />
                </div>
            </form>

            {/* Compartment 2: Location Button */}
            <div className={`hyper-glass w-[50px] h-[50px] flex items-center justify-center transition-all hover:bg-white/10 rounded-full shrink-0 ${isDay ? 'bg-white/40 border-white/40' : ''}`}>
                <Button
                    onClick={handleLocationClick}
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-full h-full hover:bg-transparent ${textColor} opacity-70 ${buttonHover}`}
                    title="Use Current Location"
                    type="button"
                >
                    <MapPin className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
