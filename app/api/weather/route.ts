import { NextResponse } from 'next/server';
import { getCurrentWeather } from '@/lib/weather';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Ahmedabad';
    const unitParam = searchParams.get('unit') === 'metric' ? 'metric' : 'imperial';

    try {
        const data = await getCurrentWeather(city, unitParam);

        return NextResponse.json({
            temperature: data.temp,
            feelsLike: data.temp, // Using temp as fallback as per current app logic
            uvIndex: data.uvIndex,
            wind: data.windSpeed,
            humidity: data.humidity,
            pressure: data.pressure,
            visibility: data.visibility,
            forecast: data.daily
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}
