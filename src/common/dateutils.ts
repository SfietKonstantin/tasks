export const getDateLabel = (date: Date) => {
    return "" + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
}

export const getDateDiff = (first: Date, second: Date) => {
    const MS_PER_DAY = 1000 * 60 * 60 * 24

    // Discard the time and time-zone information.
    const utcFirst = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())
    const utcSecond = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate())

    return Math.floor((utcSecond - utcFirst) / MS_PER_DAY)
}

export const addDays = (date: Date, days: number) => {
    let returned = new Date(date.getTime())
    returned.setDate(returned.getDate() + days)
    return returned
}
