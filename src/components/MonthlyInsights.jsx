export default function MonthlyInsights({
  monthKey,
  prevMonthKey,
  currentTotals,
  prevTotals,
  trendSeries,
  profiles,
}) {
  const getTrend = (userId) => {
    const diff = (currentTotals[userId] || 0) - (prevTotals[userId] || 0)
    if (diff > 0) return { label: `+${diff}`, direction: 'up' }
    if (diff < 0) return { label: `${diff}`, direction: 'down' }
    return { label: '0', direction: 'flat' }
  }

  return (
    <div className="panel monthly-panel">
      <div className="panel-header">
        <h3>Monthly insights</h3>
        <p className="muted">Trends for {monthKey.replace('-', ' ')}</p>
      </div>
      <div className="monthly-grid">
        {profiles.map((profile) => {
          const trend = getTrend(profile.id)
          return (
            <div className="monthly-card" key={profile.id}>
              <span className="monthly-title">{profile.display_name}</span>
              <span className="monthly-value">
                {currentTotals[profile.id] || 0}
              </span>
              <span className={`monthly-trend ${trend.direction}`}>
                {trend.label} vs {prevMonthKey.replace('-', ' ')}
              </span>
            </div>
          )
        })}
      </div>
      <div className="monthly-trend-chart">
        {trendSeries.map((month) => (
          <div className="trend-column" key={month.key}>
            <span className="trend-label">{month.key.slice(5)}</span>
            <div className="trend-bars">
              {profiles.map((profile) => (
                <span
                  key={profile.id}
                  className="trend-bar"
                  style={{
                    height: `${Math.min(
                      100,
                      (month.totals[profile.id] || 0) / 5,
                    )}%`,
                  }}
                  title={`${profile.display_name}: ${
                    month.totals[profile.id] || 0
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
