'use client';

import React, { createContext, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Unit = 'C' | 'F';

interface UnitContextType {
    unit: Unit;
    toggleUnit: () => void;
    convert: (temp: number) => number; // Kept for interface compatibility, but acts as pass-through
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children, initialUnit }: { children: React.ReactNode, initialUnit?: Unit }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Determine unit from URL or default to 'F' (Imperial)
    const currentUnitParam = searchParams.get('unit');
    const unit: Unit = currentUnitParam === 'metric' ? 'C' : 'F';

    const toggleUnit = () => {
        const newUnit = unit === 'F' ? 'metric' : 'imperial';
        const params = new URLSearchParams(searchParams.toString());
        params.set('unit', newUnit);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const convert = (temp: number) => {
        // Data is already fetched in the correct unit, so just return it.
        // Rounding ensures integers.
        return Math.round(temp);
    };

    return (
        <UnitContext.Provider value={{ unit, toggleUnit, convert }}>
            {children}
        </UnitContext.Provider>
    );
}

export function useUnit() {
    const context = useContext(UnitContext);
    if (context === undefined) {
        throw new Error('useUnit must be used within a UnitProvider');
    }
    return context;
}

export function UnitToggle() {
    const { unit, toggleUnit } = useUnit();
    return (
        <button
            onClick={toggleUnit}
            className="w-full h-full flex items-center justify-center transition-colors text-white font-bold text-xs uppercase tracking-wider hover:text-white/80"
        >
            {unit === 'F' ? 'Imperial' : 'Metric'}
        </button>
    );
}
