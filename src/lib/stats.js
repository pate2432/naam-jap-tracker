import { getMonthKey, getMonthKeys, getWeekDates, getYearKey } from './date'

export const sumByUser = (entries) =>
  entries.reduce((acc, entry) => {
    acc[entry.user_id] = (acc[entry.user_id] || 0) + entry.count
    return acc
  }, {})

export const getWeeklySummary = (entries, tz) => {
  const weekDates = getWeekDates(tz)
  const weekly = weekDates.map((localDate) => ({
    localDate,
    byUser: {},
  }))

  entries.forEach((entry) => {
    const index = weekDates.indexOf(entry.local_date)
    if (index >= 0) {
      weekly[index].byUser[entry.user_id] =
        (weekly[index].byUser[entry.user_id] || 0) + entry.count
    }
  })

  return weekly
}

export const getMonthlySummary = (entries, tz) => {
  const currentMonth = getMonthKey(new Date(), tz)
  const prevMonth = getMonthKey(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    tz,
  )

  const currentTotals = {}
  const prevTotals = {}

  entries.forEach((entry) => {
    if (entry.local_date.startsWith(currentMonth)) {
      currentTotals[entry.user_id] =
        (currentTotals[entry.user_id] || 0) + entry.count
    }
    if (entry.local_date.startsWith(prevMonth)) {
      prevTotals[entry.user_id] = (prevTotals[entry.user_id] || 0) + entry.count
    }
  })

  return { currentMonth, prevMonth, currentTotals, prevTotals }
}

export const getMonthlyTrendSeries = (entries, tz) => {
  const monthKeys = getMonthKeys(tz, 6)
  const series = monthKeys.map((key) => ({ key, totals: {} }))

  entries.forEach((entry) => {
    const monthKey = entry.local_date.slice(0, 7)
    const index = monthKeys.indexOf(monthKey)
    if (index >= 0) {
      series[index].totals[entry.user_id] =
        (series[index].totals[entry.user_id] || 0) + entry.count
    }
  })

  return series
}

export const getYearlyTotals = (entries, tz) => {
  const yearKey = getYearKey(new Date(), tz)
  return entries
    .filter((entry) => entry.local_date.startsWith(yearKey))
    .reduce((acc, entry) => {
      acc[entry.user_id] = (acc[entry.user_id] || 0) + entry.count
      return acc
    }, {})
}
