import { formatDisplayDate, getLocalTimeZone } from '../lib/date'
import WeekHeatmap from './WeekHeatmap'

export default function WeeklySummary({
  summary,
  profiles,
  selectedDate,
  onSelectDate,
}) {
  const tz = getLocalTimeZone()
  const peak = Math.max(
    1,
    ...summary.flatMap((day) =>
      profiles.map((profile) => day.byUser[profile.id] || 0),
    ),
  )

  return (
    <div className="weekly-panel">
      <p className="muted weekly-copy">Tap a day to open it. Gold means more naam.</p>
      <WeekHeatmap
        summary={summary}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
      <div className="weekly-table">
        {summary.map((day) => (
          <div className="weekly-row" key={day.localDate}>
            <span className="weekly-date">
              {formatDisplayDate(new Date(`${day.localDate}T00:00:00`), tz)}
            </span>
            <div className="weekly-bars">
              {profiles.map((profile, index) => {
                const value = day.byUser[profile.id] || 0
                return (
                  <div key={profile.id} className="weekly-bar-wrap">
                    <div
                      className={`weekly-bar tone-${index % 3}`}
                      style={{
                        width: value === 0 ? '3px' : `${(value / peak) * 100}%`,
                      }}
                    />
                    <span>
                      {profile.display_name} · {value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
