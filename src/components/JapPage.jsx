import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefs } from '../prefs/usePrefs'

const MALA = 108
const SAVE_WAIT_MS = 800

const BEADS = Array.from({ length: MALA }, (_, index) => {
  const angle = (index / MALA) * Math.PI * 2 - Math.PI / 2
  return {
    index,
    cx: 50 + Math.cos(angle) * 46.4,
    cy: 50 + Math.sin(angle) * 46.4,
  }
})

const malaProgress = (count) => {
  const leftover = count % MALA
  return leftover === 0 && count > 0 ? MALA : leftover
}

function MalaRing({ count, className }) {
  const filled = malaProgress(count)

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      {BEADS.map((bead) => {
        const isFilled = bead.index < filled
        const isCurrent = bead.index === filled - 1
        const isGuru = bead.index === 0
        return (
          <circle
            key={bead.index}
            className={
              isFilled
                ? isCurrent
                  ? 'jap-bead is-current'
                  : 'jap-bead is-filled'
                : 'jap-bead'
            }
            cx={bead.cx}
            cy={bead.cy}
            r={isGuru ? 1.45 : isCurrent ? 1.2 : 0.82}
          />
        )
      })}
    </svg>
  )
}

export default function JapPage({
  todayCount = 0,
  onCommit,
  onLeave,
  leaveLabel = 'Back',
}) {
  const { theme, setTheme } = usePrefs()
  const startRef = useRef(todayCount)
  const tapsRef = useRef(0)
  const [taps, setTaps] = useState(0)
  const [ripples, setRipples] = useState([])
  const [pulse, setPulse] = useState(0)
  const [malaFlash, setMalaFlash] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [error, setError] = useState('')

  const liveCount = startRef.current + taps
  const leftover = liveCount % MALA
  const malas = Math.floor(liveCount / MALA)

  useEffect(() => {
    startRef.current = todayCount
    tapsRef.current = 0
    setTaps(0)
    setRipples([])
    setPulse(0)
    setMalaFlash(false)
    setSaveState('idle')
    setError('')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
    // Capture today's saved count only when this page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commit = useCallback(
    async (count) => {
      if (!onCommit) return false
      setSaveState('saving')
      const ok = await onCommit(count)
      setSaveState(ok ? 'saved' : 'error')
      if (!ok) setError('Could not offer this sitting. Try again in a moment.')
      else setError('')
      return ok
    },
    [onCommit],
  )

  useEffect(() => {
    if (taps === 0) return undefined
    const timer = window.setTimeout(() => {
      commit(startRef.current + taps)
    }, SAVE_WAIT_MS)
    return () => window.clearTimeout(timer)
  }, [taps, commit])

  const offerOne = useCallback((clientX, clientY) => {
    const nextTaps = tapsRef.current + 1
    tapsRef.current = nextTaps
    const nextCount = startRef.current + nextTaps
    setTaps(nextTaps)
    setPulse((value) => value + 1)
    setSaveState('idle')

    if (clientX != null && clientY != null) {
      const id = `${Date.now()}-${nextTaps}`
      setRipples((prev) => [...prev.slice(-6), { id, x: clientX, y: clientY }])
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
      }, 700)
    }

    if (nextCount % MALA === 0) {
      setMalaFlash(true)
      window.setTimeout(() => setMalaFlash(false), 1400)
      if (navigator.vibrate) navigator.vibrate([12, 30, 18])
    } else if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [])

  const undoOne = () => {
    if (tapsRef.current === 0) return
    tapsRef.current -= 1
    setTaps(tapsRef.current)
    setSaveState('idle')
  }

  const leave = useCallback(() => {
    const count = startRef.current + tapsRef.current
    if (tapsRef.current > 0) commit(count)
    onLeave()
  }, [commit, onLeave])

  useEffect(() => {
    const onKey = (event) => {
      if (event.code === 'Escape') {
        event.preventDefault()
        leave()
        return
      }
      if (event.repeat) return
      if (event.code !== 'Space' && event.code !== 'Enter') return
      if (event.target.closest('button, input, textarea')) return
      event.preventDefault()
      offerOne()
    }

    const flush = () => {
      if (tapsRef.current > 0) commit(startRef.current + tapsRef.current)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [leave, offerOne, commit])

  const handleSurface = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (event.target.closest('button')) return
    event.preventDefault()
    offerOne(event.clientX, event.clientY)
  }

  return (
    <div
      className={`jap-page${malaFlash ? ' mala-complete' : ''}`}
      onPointerDown={handleSurface}
    >
      <div className="jap-chrome">
        <button className="icon-btn" type="button" onClick={leave}>
          {leaveLabel}
        </button>
        <p className="jap-save" aria-live="polite">
          {error
            ? error
            : saveState === 'saving'
              ? 'Offering...'
              : saveState === 'saved'
                ? 'Offered to today'
                : taps > 0
                  ? 'This sitting is being kept'
                  : 'Tap राधा to begin'}
        </p>
        <div className="jap-chrome-actions">
          <button
            className="icon-btn"
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            className="icon-btn"
            type="button"
            onClick={undoOne}
            disabled={taps === 0}
          >
            Undo
          </button>
        </div>
      </div>

      <div className="jap-stage">
        <div className="jap-orb">
          <MalaRing count={liveCount} className="jap-mala" />
          <p key={pulse} className="jap-name jap-name-pulse" lang="sa">
            राधा
          </p>
        </div>
      </div>

      <div className="jap-meter">
        <div>
          <span className="eyebrow">This sitting</span>
          <strong>{taps.toLocaleString()}</strong>
        </div>
        <div>
          <span className="eyebrow">Today</span>
          <strong>{liveCount.toLocaleString()}</strong>
        </div>
        <div>
          <span className="eyebrow">Mala</span>
          <strong>
            {malas} · {leftover}/108
          </strong>
        </div>
      </div>

      <p className="jap-hint">
        <span className="jap-hint-phone">Tap anywhere</span>
        <span className="jap-hint-desk">Click anywhere or press space</span>
      </p>

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="jap-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </div>
  )
}
