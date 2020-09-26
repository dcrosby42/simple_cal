function isToday(d) {
    return luxon.DateTime.local().toISODate() === d.toISODate()
}

function isThisWeek(d) {
    return luxon.DateTime.local().weekNumber === d.weekNumber
}
function isSaturday(d) {
    return d.weekday === 6
}
function isSunday(d) {
    return d.weekday === 7
}
function isWeekend(d) {
    return isSaturday(d) || isSunday(d)
}

export { isToday, isThisWeek, isSaturday, isSunday, isWeekend }