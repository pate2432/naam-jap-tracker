import { useEffect, useState } from 'react'

export default function EntryForm({
  selectedDate,
  currentEntry,
  isEditable,
  onSave,
}) {
  const [count, setCount] = useState(currentEntry?.count || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCount(currentEntry?.count || '')
  }, [currentEntry, selectedDate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isEditable) return
    const numericCount = Number(count || 0)
    if (Number.isNaN(numericCount) || numericCount < 0) return
    setSaving(true)
    await onSave(numericCount)
    setSaving(false)
  }

  return (
    <div className="entry-card">
      <h3>Your daily jap</h3>
      <p className="muted">
        You can edit only until 11:59 PM of the same day.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Jap count
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={count}
            onChange={(event) => setCount(event.target.value)}
            disabled={!isEditable}
            placeholder={isEditable ? 'Enter your count' : 'Editing closed'}
          />
        </label>

        <button className="primary" type="submit" disabled={!isEditable || saving}>
          {saving ? 'Saving...' : currentEntry ? 'Update entry' : 'Save entry'}
        </button>
      </form>
    </div>
  )
}
