'use client';

import { Button } from '@/components/ui/button';
import { useUnit } from './UnitProvider';

export default function UnitToggle() {
    const { unit, toggleUnit } = useUnit();

    return (
        <Button
            variant="ghost"
            onClick={toggleUnit}
            className={`
        rounded-full w-10 h-10 p-0 text-lg font-medium transition-all
        glass text-white hover:bg-white/20 hover:text-white
      `}
        >
            °{unit}
        </Button>
    );
}
