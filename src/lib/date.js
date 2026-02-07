import { formatInTimeZone } from 'date-fns-tz'
import { addDays, addMonths } from 'date-fns'

export const getLocalTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const formatLocalDate = (date, tz = getLocalTimeZone()) =>
  formatInTimeZone(date, tz, 'yyyy-MM-dd')

export const formatDisplayDate = (date, tz = getLocalTimeZone()) =>
  formatInTimeZone(date, tz, 'EEE, MMM d, yyyy')

export const getTodayLocalDate = (tz = getLocalTimeZone()) =>
  formatLocalDate(new Date(), tz)

export const isToday = (localDate, tz = getLocalTimeZone()) =>
  localDate === getTodayLocalDate(tz)

export const getMonthKey = (date = new Date(), tz = getLocalTimeZone()) =>
  formatInTimeZone(date, tz, 'yyyy-MM')

export const getYearKey = (date = new Date(), tz = getLocalTimeZone()) =>
  formatInTimeZone(date, tz, 'yyyy')

export const getWeekDates = (tz = getLocalTimeZone()) => {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) =>
    formatLocalDate(addDays(today, index - 6), tz),
  )
}

export const getMonthKeys = (tz = getLocalTimeZone(), count = 6) => {
  const now = new Date()
  return Array.from({ length: count }, (_, index) =>
    getMonthKey(addMonths(now, -index), tz),
  ).reverse()
}
