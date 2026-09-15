import { useEffect, useState } from 'react'

export default function QuickEntry({ currentEntry, isEditable, onSave }) {
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
    <section className="quick-entry reveal" style={{ '--reveal-delay': '0.06s' }}>
      <div className="quick-entry-top">
        <p className="eyebrow">Today&apos;s jap</p>
        <p className="quick-entry-mala">
          {malas} mala{malas === 1 ? '' : 's'} · {leftover} leftover
        </p>
      </div>
      <form className="quick-entry-form" onSubmit={handleSubmit}>
        <input
          className="quick-entry-input"
          type="number"
          min="0"
          inputMode="numeric"
          value={count}
          onChange={(event) => setCount(event.target.value)}
          disabled={!isEditable}
          placeholder="0"
          aria-label="Today's jap count"
        />
        <button
          className="primary quick-entry-save"
          type="submit"
          disabled={!isEditable || saving}
        >
          {justSaved ? 'Saved' : saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </section>
  )
}
