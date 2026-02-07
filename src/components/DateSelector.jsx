import { formatDisplayDate, getLocalTimeZone } from '../lib/date'

export default function DateSelector({ selectedDate, onChange }) {
  const tz = getLocalTimeZone()

  return (
    <div className="date-selector">
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
