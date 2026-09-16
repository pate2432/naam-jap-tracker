export default function RecordsTable({ entries, profiles }) {
  const counts = profiles.map((profile) => {
    const entry = entries.find((item) => item.user_id === profile.id)
    return entry ? entry.count : 0
  })
  const lead = Math.max(0, ...counts)

  return (
    <div className="records-grid">
      {profiles.map((profile) => {
        const entry = entries.find((item) => item.user_id === profile.id)
        const value = entry ? entry.count : null
        const isLead = value !== null && value === lead && lead > 0
        return (
          <div
            className={`records-item${isLead ? ' lead' : ''}`}
            key={profile.id}
          >
            <span className="avatar" aria-hidden="true">
              {(profile.display_name || '?').slice(0, 1)}
            </span>
            <span className="records-name">{profile.display_name}</span>
            <span className="records-count">{value === null ? '—' : value}</span>
            <span className="records-label">jap</span>
          </div>
        )
      })}
    </div>
  )
}
