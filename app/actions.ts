'use server'

import { getCurrentWeather } from '@/lib/weather';


export async function fetchWeather(city: string, unit: 'metric' | 'imperial') {
    return await getCurrentWeather(city, unit);
}

export async function getCityFromCoords(lat: number, lon: number) {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Geocoding failed");

    const data = await res.json();
    if (data && data.length > 0) {
        return data[0].name;
    }
    return null;
}
