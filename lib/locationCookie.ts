import Cookies from 'js-cookie';

const COOKIE_NAME = 'weather_x_locations';

export const getSavedLocations = (): string[] => {
    const cookie = Cookies.get(COOKIE_NAME);
    if (!cookie) return [];
    try {
        return JSON.parse(cookie);
    } catch (e) {
        return [];
    }
};

export const saveLocation = (city: string) => {
    if (!city) return;
    const locations = getSavedLocations();
    // Avoid duplicates, case insensitive check
    if (!locations.some(loc => loc.toLowerCase() === city.toLowerCase())) {
        const newLocations = [city, ...locations];
        Cookies.set(COOKIE_NAME, JSON.stringify(newLocations), { expires: 365 }); // Expires in 1 year
    }
};

export const removeLocation = (city: string) => {
    const locations = getSavedLocations();
    const newLocations = locations.filter(loc => loc.toLowerCase() !== city.toLowerCase());
    Cookies.set(COOKIE_NAME, JSON.stringify(newLocations), { expires: 365 });
};

export const isSaved = (city: string): boolean => {
    if (!city) return false;
    const locations = getSavedLocations();
    return locations.some(loc => loc.toLowerCase() === city.toLowerCase());
};
