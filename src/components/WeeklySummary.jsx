import { formatDisplayDate, getLocalTimeZone } from '../lib/date'

export default function WeeklySummary({ summary, profiles }) {
  const tz = getLocalTimeZone()

  return (
    <div className="panel weekly-panel">
      <div className="panel-header">
        <h3>Weekly summary</h3>
        <p className="muted">Last 7 days, side by side.</p>
      </div>
      <div className="weekly-table">
        {summary.map((day) => (
          <div className="weekly-row" key={day.localDate}>
            <span className="weekly-date">
              {formatDisplayDate(new Date(`${day.localDate}T00:00:00`), tz)}
            </span>
            <div className="weekly-values">
              {profiles.map((profile) => (
                <div key={profile.id} className="weekly-pill">
                  <span>{profile.display_name}</span>
                  <strong>{day.byUser[profile.id] || 0}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
