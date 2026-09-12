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

  const tallest = Math.max(
    1,
    ...trendSeries.flatMap((month) =>
      profiles.map((profile) => month.totals[profile.id] || 0),
    ),
  )

  return (
    <div className="monthly-panel">
      <p className="muted">Trends for {monthKey.replace('-', ' ')}</p>
      <div className="monthly-grid">
        {profiles.map((profile) => {
          const trend = getTrend(profile.id)
          return (
            <div className="monthly-card" key={profile.id}>
              <span className="monthly-title">{profile.display_name}</span>
              <span className="monthly-value">
                {(currentTotals[profile.id] || 0).toLocaleString()}
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
              {profiles.map((profile, index) => (
                <span
                  key={profile.id}
                  className={`trend-bar tone-${index % 3}`}
                  style={{
                    height: `${Math.max(
                      4,
                      ((month.totals[profile.id] || 0) / tallest) * 100,
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
