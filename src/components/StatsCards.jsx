export default function StatsCards({ totals, profiles }) {
  const combined = Object.values(totals).reduce((sum, value) => sum + value, 0)

  return (
    <div className="stats-grid">
      {profiles.map((profile) => (
        <div className="stat-card" key={profile.id}>
          <span className="stat-title">{profile.display_name}</span>
          <span className="stat-value">{totals[profile.id] || 0}</span>
          <span className="stat-label">total jap</span>
        </div>
      ))}
      <div className="stat-card highlight">
        <span className="stat-title">Divine Together</span>
        <span className="stat-value">{combined}</span>
        <span className="stat-label">combined jap</span>
      </div>
    </div>
  )
}
