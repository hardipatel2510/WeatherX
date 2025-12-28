'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchWeather } from './actions';
import { WeatherData } from '@/lib/weather';

import CloudBackground from '@/components/CloudBackground';
import WeatherHero from '@/components/WeatherHero';
import HourlyForecast from '@/components/HourlyForecast';
import TenDayForecast from '@/components/TenDayForecast';
import WeatherDetails from '@/components/WeatherDetails';
import SidePanel from '@/components/SidePanel';
import SearchBar from '@/components/SearchBar';
import { UnitProvider, UnitToggle } from '@/components/UnitProvider';
import { TimeThemeProvider } from '@/components/ui/TimeTheme';

export default function Home() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || 'Ahmedabad';
  const unitParam = searchParams.get('unit') === 'metric' ? 'metric' : 'imperial';

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchWeather(city, unitParam)
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch weather:", err);
        setError("Unable to load weather data. Please check API Key.");
        setLoading(false);
      });
  }, [city, unitParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-light tracking-widest uppercase opacity-70">Loading WeatherX...</p>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-4 text-center">
        <div>
          <p className="text-xl text-red-400 mb-2">Error</p>
          <p className="opacity-80">{error || "Weather data unavailable."}</p>
        </div>
      </div>
    );
  }

  return (
    <UnitProvider initialUnit={unitParam === 'metric' ? 'C' : 'F'}>
      <TimeThemeProvider timezone={weather.timezone}>
        <main className="min-h-screen relative overflow-hidden font-sans selection:bg-blue-500/30">

          {/* Cinematic Video Background */}
          <CloudBackground timezone={weather.timezone} />

          {/* Top Right Unit Toggle */}
          <div className="absolute top-4 right-4 z-50">
            <div className="hyper-glass w-[50px] h-[50px] flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer rounded-full">
              <UnitToggle />
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto z-10 relative flex flex-col p-6 h-full min-h-screen gap-6">

            {/* 1. Hero Area */}
            <div className="flex flex-col items-center gap-2 mb-4 mt-8">
              <WeatherHero
                city={weather.city}
                temp={weather.temp}
                condition={weather.condition}
                high={weather.high}
                low={weather.low}
              />
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-lg mx-auto mb-4 relative z-50">
              <SearchBar />
            </div>

            {/* 2. Top Row: Today's Forecast (Hourly) - Wide Glass Panel */}
            <div className="w-full">
              <HourlyForecast
                data={weather.hourly}
                summary={`${weather.condition} conditions expected for the rest of the day.`}
              />
            </div>

            {/* 3. Main Content: 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 pb-6">

              {/* Left Column: 3-Card Stack (Feels Like, AQI, Clouds) */}
              <div className="lg:col-span-1 h-full">
                <SidePanel
                  temp={weather.temp}
                  feelsLike={weather.temp}
                  airQuality={weather.airQuality}
                  clouds={weather.clouds}
                />
              </div>

              {/* Center Column: Grid Details (2 Cols wide) */}
              <div className="lg:col-span-2 h-full">
                <WeatherDetails
                  data={{
                    windSpeed: weather.windSpeed,
                    windDeg: weather.windDeg,
                    humidity: weather.humidity,
                    pressure: weather.pressure,
                    uvIndex: weather.uvIndex,
                    visibility: weather.visibility,
                    sunrise: weather.sunrise,
                    sunset: weather.sunset,
                    city: weather.city,
                    feelsLike: weather.feelsLike,
                    airQuality: weather.airQuality,
                    clouds: weather.clouds,
                    temp: weather.temp,
                    moonPhase: weather.moonPhase
                  }}
                />
              </div>

              {/* Right Column: 10-Day Forecast (Tall) */}
              <div className="lg:col-span-1 h-full">
                <TenDayForecast data={weather.daily} currentTemp={weather.temp} />
              </div>

            </div>

          </div>
        </main>
      </TimeThemeProvider>
    </UnitProvider>
  );
}
