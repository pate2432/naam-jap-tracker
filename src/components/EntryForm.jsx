import { useEffect, useState } from 'react'

export default function EntryForm({
  currentEntry,
  isEditable,
  onSave,
}) {
  const [count, setCount] = useState(currentEntry?.count ?? '')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setCount(currentEntry?.count ?? '')
  }, [currentEntry?.count])

  const numericCount = Number(count || 0)
  const malas = Number.isNaN(numericCount) ? 0 : Math.floor(numericCount / 108)
  const leftover = Number.isNaN(numericCount) ? 0 : numericCount % 108

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isEditable) return
    if (Number.isNaN(numericCount) || numericCount < 0) return
    setSaving(true)
    setJustSaved(false)
    const ok = await onSave(numericCount)
    setSaving(false)
    if (ok) {
      setJustSaved(true)
      window.setTimeout(() => setJustSaved(false), 2200)
    }
  }

  return (
    <div className="entry-card">
      <h3>Your daily jap</h3>
      <p className="muted">
        You can edit up to 36 hours after the date starts.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="count-label">
          Jap count
          <input
            className="count-input"
            type="number"
            min="0"
            inputMode="numeric"
            value={count}
            onChange={(event) => setCount(event.target.value)}
            disabled={!isEditable}
            placeholder="0"
          />
        </label>
        <p className="mala-hint">
          {malas} mala{malas === 1 ? '' : 's'} · {leftover} leftover
        </p>

        <button className="primary" type="submit" disabled={!isEditable || saving}>
          {justSaved
            ? 'Saved'
            : saving
              ? 'Saving...'
              : currentEntry
                ? 'Update entry'
                : 'Save entry'}
        </button>
      </form>
    </div>
  )
}
