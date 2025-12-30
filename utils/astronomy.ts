import SunCalc from "suncalc";

export function getMoonTimes(lat: number, lon: number, date = new Date()) {
    const times = SunCalc.getMoonTimes(date, lat, lon);

    return {
        moonrise: times.rise ? times.rise.getTime() / 1000 : null,
        moonset: times.set ? times.set.getTime() / 1000 : null,
    };
}
