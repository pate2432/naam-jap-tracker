import { formatDayNumber, formatWeekdayLetter, getLocalTimeZone } from '../lib/date'

export default function WeekHeatmap({
  summary,
  selectedDate,
  onSelectDate,
}) {
  const tz = getLocalTimeZone()
  const totals = summary.map((day) =>
    Object.values(day.byUser).reduce((sum, value) => sum + value, 0),
  )
  const peak = Math.max(1, ...totals)

  return (
    <div className="heatmap" role="list">
      {summary.map((day, index) => {
        const total = totals[index]
        const intensity = total / peak
        return (
          <button
            key={day.localDate}
            type="button"
            role="listitem"
            className={`heatmap-cell${selectedDate === day.localDate ? ' selected' : ''}`}
            onClick={() => onSelectDate(day.localDate)}
            style={{ '--intensity': intensity.toFixed(3) }}
            aria-label={`${day.localDate}, ${total} jap`}
          >
            <span>{formatWeekdayLetter(day.localDate, tz)}</span>
            <strong>{formatDayNumber(day.localDate, tz)}</strong>
          </button>
        )
      })}
    </div>
  )
}
