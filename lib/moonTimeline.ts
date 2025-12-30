import SunCalc from "suncalc";

export interface MoonTimelineItem {
    date: Date;
    label: string;
    fraction: number;
    phase: number;
    waxing: boolean;
}

export function getMoonTimeline(lat: number, lon: number): MoonTimelineItem[] {
    const days: MoonTimelineItem[] = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const illum = SunCalc.getMoonIllumination(date);

        days.push({
            date,
            label: i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" }),
            fraction: illum.fraction, // how much is lit (0 -> 1)
            phase: illum.phase,       // 0 -> 1
            waxing: illum.phase < 0.5 // Standard approximation for SunCalc phase
        });
    }

    return days;
}
