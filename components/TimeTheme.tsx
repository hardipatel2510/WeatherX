export const getTimeTheme = (cityTimezoneOffset: number) => {
    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000
    const localTime = new Date(utc + cityTimezoneOffset * 1000)
    const hour = localTime.getHours()

    return {
        isMorning: hour >= 6 && hour < 12,
        isAfternoon: hour >= 12 && hour < 17,
        isEvening: hour >= 17 && hour < 20,
        isNight: hour >= 20 || hour < 6
    }
}

export default getTimeTheme
