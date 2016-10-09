export function getDateLabel(date: Date) { 
    return "" + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
}

export function getDateDiff(first: Date, second: Date) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24

    // Discard the time and time-zone information.
    var utcFirst = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())
    var utcSecond = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate())

    return Math.floor((utcSecond - utcFirst) / MS_PER_DAY)
}

export function addDays(date: Date, days: number) {
    let returned = new Date(date.valueOf())
    returned.setDate(returned.getDate() + days)
    return returned
}