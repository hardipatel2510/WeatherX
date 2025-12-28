export interface WeatherData {
    temp: number;
    feelsLike: number;
    condition: string;
    high: number;
    low: number;
    city: string;
    windSpeed: number;
    windDeg: number;
    humidity: number;
    pressure: number;
    uvIndex: number;
    moonPhase?: number; // 0..1
    visibility: number;
    airQuality: number;
    sunrise: string;
    sunset: string;
    timezone: number; // Seconds offset from UTC
    clouds: number; // Cloudiness %
    hourly: HourlyForecast[];
    daily: DailyForecast[];
}

export interface HourlyForecast {
    time: string;
    temp: number;
    icon: string;
    // Extended Metrics
    feelsLike: number;
    pressure: number;
    humidity: number;
    uvIndex: number;
    clouds: number;
    visibility: number;
    windSpeed: number;
    windDeg: number;
    pop: number;
}

export interface DailyForecast {
    day: string;
    min: number;
    max: number;
    icon: string;
}

// --- Mock Data Helpers ---
function getMoonPhase(date: Date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 3) {
        year--;
        month += 12;
    }
    const c = 365.25 * year;
    const e = 30.6 * month;
    const jd = c + e + day - 694039.09; // jd is total days elapsed
    const b = jd / 29.53058867; // divide by the moon cycle
    const phase = b - Math.floor(b);
    return phase; // 0..1
}

function getHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function getMockWeather(city: string): WeatherData {
    const seed = getHash(city.toLowerCase());
    const baseTemp = 25 + Math.floor(seededRandom(seed) * 10); // 25-35°C (Realistic Warm)

    return {
        temp: baseTemp,
        feelsLike: baseTemp + 2,
        condition: ["Clear", "Clouds", "Rain"][Math.floor(seededRandom(seed + 1) * 3)],
        high: baseTemp + 5,
        low: baseTemp - 5,
        city: city,
        windSpeed: Math.floor(seededRandom(seed + 4) * 20) + 1,
        windDeg: Math.floor(seededRandom(seed + 6) * 360),
        humidity: Math.floor(seededRandom(seed + 5) * 60) + 30,
        pressure: 1012,
        uvIndex: 5,
        visibility: 10,
        airQuality: 50,
        sunrise: "06:00 AM",
        sunset: "08:00 PM",
        timezone: -14400, // Mock EST (-4h)
        clouds: 20, // Mock clear skies
        hourly: Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            temp: baseTemp + Math.floor(seededRandom(seed + i) * 5 - 2),
            icon: seededRandom(seed + i * 10) > 0.5 ? "sun" : "cloud",
        })),
        daily: Array.from({ length: 10 }, (_, i) => ({
            day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(new Date().getDay() + i) % 7],
            min: baseTemp - 8 + Math.floor(seededRandom(seed + i * 2) * 5),
            max: baseTemp + 4 + Math.floor(seededRandom(seed + i * 3) * 5),
            icon: ["sun", "cloud", "rain"][Math.floor(seededRandom(seed + i * 20) * 3)],
        })),
    };
}

// --- API Helpers ---
function mapIcon(iconCode: string): string {
    const code = iconCode.replace('d', '').replace('n', '');
    switch (code) {
        case '01': return 'sun';
        case '02': return 'cloud';
        case '03': return 'cloud';
        case '04': return 'cloud';
        case '09': return 'rain';
        case '10': return 'rain';
        case '11': return 'lightning';
        case '13': return 'snow';
        case '50': return 'cloud'; // Mist
        default: return 'sun';
    }
}

function mapCondition(main: string): string {
    switch (main.toLowerCase()) {
        case 'clear': return 'Clear';
        case 'clouds': return 'Clouds';
        case 'drizzle': return 'Drizzle';
        case 'rain': return 'Rain';
        case 'thunderstorm': return 'Thunderstorm';
        case 'snow': return 'Snow';
        case 'mist': case 'fog': return 'Fog';
        default: return 'Clear';
    }
}

// --- Timezone Helper ---
function formatLocalTime(timestamp: number, timezoneOffset: number, options: Intl.DateTimeFormatOptions = { hour: 'numeric' }): string {
    // Construct a date that represents the local time at the target location.
    // timestamp is UTC seconds. timezoneOffset is seconds.
    // (timestamp + timezoneOffset) * 1000 gives a "shifted" UTC time.
    // If we treat this shifted time as UTC, its components (HH:MM) match the local time.
    const shiftedDate = new Date((timestamp + timezoneOffset) * 1000);

    // We get the UTC components
    const hours = shiftedDate.getUTCHours();
    const minutes = shiftedDate.getUTCMinutes();

    // Create a formatter that forces UTC, but we feed it our shifted values effectively.
    // Actually, simpler: just map the UTC parts to a string manually or use toLocaleString with 'UTC' timeZone.

    return shiftedDate.toLocaleTimeString('en-US', { ...options, timeZone: 'UTC' });
}

function getLocalDayName(timestamp: number, timezoneOffset: number): string {
    const shiftedDate = new Date((timestamp + timezoneOffset) * 1000);
    return shiftedDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export async function getCurrentWeather(city: string, unit: 'metric' | 'imperial' = 'imperial'): Promise<WeatherData> {
    const apiKey = process.env.WEATHER_API_KEY;

    // If no key, throw error
    if (!apiKey) {
        throw new Error("No API Key found. Please check your .env.local file.");
    }

    try {
        // Handle City Ambiguities (Prefer India for Gujarat cities)
        let queryCity = city;
        const lowerCity = city.toLowerCase().trim();

        if (lowerCity === 'baroda') queryCity = 'Vadodara,IN';
        else if (['ahmedabad', 'surat', 'rajkot', 'gandhinagar', 'jamnagar', 'bhavnagar'].includes(lowerCity)) {
            queryCity = `${city},IN`;
        }

        // 1. Current Weather (for City Name + Lat/Lon)
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(queryCity)}&appid=${apiKey}&units=${unit}`,
            { cache: 'no-store' }
        );

        // Check specific error codes
        if (!currentRes.ok) {
            console.warn(`OWM Current Weather Error: ${currentRes.status} ${currentRes.statusText}`);
            throw new Error(`Current weather fetch failed: ${currentRes.statusText}`);
        }

        const currentData = await currentRes.json();
        const { lat, lon } = currentData.coord;
        const timezoneOffset = currentData.timezone; // Seconds

        // 2. Forecast (5 Day / 3 Hour) - Good for consistent hourly graph if One Call is paid-only/unavailable
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`,
            { cache: 'no-store' }
        );

        // 3. One Call API (3.0 or 2.5) - For UV Index and Daily Moon Phase
        // Try 2.5 first (some keys still have access), or 3.0. Let's try 2.5 One Call as it's common for older keys, 
        // but user specifically requested "One Call". 3.0 is the standard now. 
        // Note: One Call 3.0 requires separate subscription usually.
        let oneCallData: any = null;
        try {
            // Try 3.0
            const oneCallRes = await fetch(
                `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${apiKey}&units=${unit}`,
                { cache: 'no-store' }
            );
            if (oneCallRes.ok) {
                oneCallData = await oneCallRes.json();
            } else {
                // Fallback to 2.5 if 3.0 fails (often 401)
                const oneCallRes25 = await fetch(
                    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${apiKey}&units=${unit}`,
                    { cache: 'no-store' }
                );
                if (oneCallRes25.ok) {
                    oneCallData = await oneCallRes25.json();
                }
            }
        } catch (e) {
            console.warn("One Call API fetch failed, defaulting to basic data for UV/Moon.");
        }

        // 4. Air Pollution API
        let airQuality = 1; // Default to Good
        try {
            const pollutionRes = await fetch(
                `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
                { cache: 'no-store' }
            );
            if (pollutionRes.ok) {
                const pollutionData = await pollutionRes.json();
                airQuality = pollutionData?.list?.[0]?.main?.aqi ?? 1;
            }
        } catch (e) {
            console.warn("Air Pollution API fetch failed.");
        }


        if (!forecastRes.ok) {
            console.warn(`OWM Forecast Error: ${forecastRes.status}`);
            throw new Error("Forecast fetch failed.");
        }

        const forecastData = await forecastRes.json();

        // --- Process Hourly Data ---
        // Prefer One Call (Real Hourly) -> Fallback to Forecast (3-hour steps)
        let hourly: HourlyForecast[] = [];

        if (oneCallData && oneCallData.hourly) {
            // Map One Call (48h available, take 24)
            hourly = oneCallData.hourly.slice(0, 24).map((item: any) => ({
                time: formatLocalTime(item.dt, timezoneOffset, { hour: 'numeric' }),
                temp: item.temp,
                icon: mapIcon(item.weather[0].icon),
                feelsLike: item.feels_like,
                pressure: item.pressure,
                humidity: item.humidity,
                uvIndex: item.uvi,
                clouds: item.clouds,
                visibility: item.visibility,
                windSpeed: unit === 'imperial' ? item.wind_speed : item.wind_speed * 3.6,
                windDeg: item.wind_deg,
                pop: item.pop ?? 0
            }));
        } else {
            // Map Forecast (3-hour steps)
            hourly = forecastData.list.slice(0, 9).map((item: any) => ({
                time: formatLocalTime(item.dt, timezoneOffset, { hour: 'numeric' }),
                temp: item.main.temp,
                icon: mapIcon(item.weather[0].icon),
                feelsLike: item.main.feels_like,
                pressure: item.main.pressure,
                humidity: item.main.humidity,
                uvIndex: 0, // Not available in standard forecast
                clouds: item.clouds?.all ?? 0,
                visibility: item.visibility,
                windSpeed: unit === 'imperial' ? item.wind.speed : item.wind.speed * 3.6,
                windDeg: item.wind.deg,
                pop: item.pop ?? 0
            }));
        }

        // Process Daily (Mapping 5-day forecast to daily high/lows)
        const dailyMap: { [key: string]: { min: number; max: number; icon: string } } = {};
        forecastData.list.forEach((item: { dt: number; main: { temp_min: number; temp_max: number }; weather: { icon: string }[] }) => {
            const day = getLocalDayName(item.dt, timezoneOffset);
            if (!dailyMap[day]) {
                dailyMap[day] = { min: item.main.temp_min, max: item.main.temp_max, icon: mapIcon(item.weather[0].icon) };
            } else {
                dailyMap[day].min = Math.min(dailyMap[day].min, item.main.temp_min);
                dailyMap[day].max = Math.max(dailyMap[day].max, item.main.temp_max);
            }
        });

        let daily: DailyForecast[] = Object.keys(dailyMap).map(day => ({
            day,
            min: dailyMap[day].min,
            max: dailyMap[day].max,
            icon: dailyMap[day].icon
        }));

        // NOT using mock extension anymore strictly. But forecast usually returns 5 days defined by API.
        // User asked to remove Mocks. If < 10 days, we just show what we have.

        // Ensure we slice correctly if mapped somehow brings >10
        daily = daily.slice(0, 10);

        // Extract One Call Data
        // UV Index
        const uvIndex = oneCallData?.current?.uvi ?? 0;
        // Moon Phase (daily[0] is today)
        const moonPhase = oneCallData?.daily?.[0]?.moon_phase ?? getMoonPhase(new Date()); // 0..1 (Real API or Calc Fallback)

        return {
            temp: currentData.main.temp,
            feelsLike: currentData.main.feels_like,
            condition: mapCondition(currentData.weather[0].main),
            high: daily.length > 0 ? daily[0].max : currentData.main.temp_max,
            low: daily.length > 0 ? daily[0].min : currentData.main.temp_min,
            city: currentData.name,
            windSpeed: unit === 'imperial' ? currentData.wind.speed : currentData.wind.speed * 3.6,
            windDeg: currentData.wind.deg,
            humidity: currentData.main.humidity,
            pressure: currentData.main.pressure,
            uvIndex: uvIndex, // Real UV
            moonPhase: moonPhase, // Real Moon Phase
            visibility: currentData.visibility ? parseFloat((currentData.visibility / 1000).toFixed(1)) : 10,

            sunrise: formatLocalTime(currentData.sys.sunrise, timezoneOffset, { hour: '2-digit', minute: '2-digit' }),
            sunset: formatLocalTime(currentData.sys.sunset, timezoneOffset, { hour: '2-digit', minute: '2-digit' }),
            timezone: timezoneOffset,
            clouds: currentData.clouds?.all ?? 0,
            airQuality: airQuality,
            hourly: hourly,
            daily: daily,
        };

    } catch (error) {
        console.error("OWM Fetch Critical Error:", error);
        throw error; // Re-throw to be handled by caller
    }
}

export async function getHourlyForecast() { return []; }
export async function getDailyForecast() { return []; }
