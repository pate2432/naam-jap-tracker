import {
  getLocalTimeZone,
  getTodayLocalDate,
  getYesterdayLocalDate,
} from '../lib/date'

export default function DateSelector({ selectedDate, onChange }) {
  const tz = getLocalTimeZone()
  const today = getTodayLocalDate(tz)
  const yesterday = getYesterdayLocalDate(tz)

  return (
    <div className="date-strip">
      <button
        type="button"
        className={selectedDate === today ? 'active' : ''}
        onClick={() => onChange(today)}
      >
        Today
      </button>
      <button
        type="button"
        className={selectedDate === yesterday ? 'active' : ''}
        onClick={() => onChange(yesterday)}
      >
        Yesterday
      </button>
      <label className="date-strip-pick">
        <span className="sr-only">Date</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Date"
        />
      </label>
    </div>
  )
}
