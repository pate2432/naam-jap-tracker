import {
  formatDisplayDate,
  getLocalTimeZone,
  getTodayLocalDate,
  getYesterdayLocalDate,
} from '../lib/date'

export default function DateSelector({ selectedDate, onChange }) {
  const tz = getLocalTimeZone()
  const today = getTodayLocalDate(tz)
  const yesterday = getYesterdayLocalDate(tz)

  return (
    <div className="date-selector">
      <div className="date-chips">
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
      </div>
      <label>
        Select date
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <span className="date-preview">
        {formatDisplayDate(new Date(`${selectedDate}T00:00:00`), tz)}
      </span>
    </div>
  )
}
