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

import { Suspense } from 'react';

function WeatherDashboard() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || 'Ahmedabad';
  const unitParam = searchParams.get('unit') === 'metric' ? 'metric' : 'imperial';

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);

    // 10s Timeout handling
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), 10000);
    });

    Promise.race([fetchWeather(city, unitParam), timeoutPromise])
      .then((data) => {
        if (isActive) {
          if (!data) throw new Error("No data received");
          setWeather(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isActive) {
          console.error("Failed to fetch weather:", err);
          setError(err.message || "Unable to load weather data.");
          setLoading(false);
        }
      });

    return () => { isActive = false; };
  }, [city, unitParam]);

  // Default timezone to 0 if loading/error
  const timezone = weather?.timezone ?? 0;

  return (
    <UnitProvider initialUnit={unitParam === 'metric' ? 'C' : 'F'}>
      <TimeThemeProvider timezone={timezone}>
        <main className="min-h-screen relative overflow-hidden font-sans selection:bg-blue-500/30 text-white">

          {/* Cinematic Video Background */}
          {/* Always render background so it feels alive */}
          <CloudBackground timezone={timezone} />

          {/* Top Right Unit Toggle */}
          <div className="absolute top-4 right-4 z-50">
            <div className="hyper-glass w-[50px] h-[50px] flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer rounded-full">
              <UnitToggle />
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto z-10 relative flex flex-col p-6 h-full min-h-screen gap-6">

            {/* 1. Hero Area - Show Skeleton or Data */}
            <div className="flex flex-col items-center gap-2 mb-4 mt-8">
              {loading ? (
                <div className="flex flex-col items-center animate-pulse gap-2">
                  <div className="h-8 w-48 bg-white/10 rounded" />
                  <div className="h-20 w-32 bg-white/10 rounded" />
                  <div className="h-6 w-24 bg-white/10 rounded" />
                  <div className="h-4 w-40 bg-white/10 rounded" />
                </div>
              ) : weather ? (
                <WeatherHero
                  city={weather.city}
                  temp={weather.temp}
                  condition={weather.condition}
                  high={weather.high}
                  low={weather.low}
                />
              ) : null}
            </div>

            {/* Search Bar - Always Interactive */}
            <div className="w-full max-w-lg mx-auto mb-4 relative z-50">
              <SearchBar />
            </div>

            {/* ERROR TOAST (If we have data but specific search failed) */}
            {error && weather && (
              <div className="w-full max-w-lg mx-auto p-4 mb-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md text-center animate-in fade-in slide-in-from-top-4">
                <p className="text-red-200 text-sm font-medium flex items-center justify-center gap-2">
                  <span>⚠️</span> {error}
                </p>
              </div>
            )}

            {/* FULL SCREEN ERROR (Only if no data at all) */}
            {!loading && !weather && error && (
              <div className="w-full max-w-lg mx-auto p-6 rounded-2xl liquid-glass text-center mt-20">
                <p className="text-red-300 font-medium text-lg mb-2">Weather Unavailable</p>
                <p className="text-white/60 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {/* LOADING SKELETON GRID */}
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
                <div className="w-full h-32 bg-white/5 rounded-3xl lg:col-span-4" /> {/* Hourly */}
                <div className="h-96 bg-white/5 rounded-3xl lg:col-span-1" /> {/* Left Panel */}
                <div className="h-96 bg-white/5 rounded-3xl lg:col-span-2" /> {/* Main Grid */}
                <div className="h-96 bg-white/5 rounded-3xl lg:col-span-1" /> {/* 10 Day */}
              </div>
            )}

            {/* REAL CONTENT */}
            {!loading && weather && (
              <>
                {/* 2. Top Row: Today's Forecast (Hourly) */}
                <div className="w-full">
                  <HourlyForecast
                    data={weather.hourly}
                    summary={`${weather.condition} conditions expected for the rest of the day.`}
                  />
                </div>

                {/* 3. Main Content: 3-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 pb-6">

                  {/* Left Column */}
                  <div className="lg:col-span-1 h-full">
                    <SidePanel
                      temp={weather.temp}
                      feelsLike={weather.feelsLike} // Fix: passes feelsLike correctly
                      airQuality={weather.airQuality}
                      clouds={weather.clouds}
                    />
                  </div>

                  {/* Center Column */}
                  <div className="lg:col-span-2 h-full">
                    <WeatherDetails data={weather} />
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-1 h-full">
                    <TenDayForecast data={weather.daily} currentTemp={weather.temp} />
                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </TimeThemeProvider>
    </UnitProvider>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <WeatherDashboard />
    </Suspense>
  );
}
