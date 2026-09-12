import { usePrefs } from '../prefs/usePrefs'
import PromiseVerse from './PromiseVerse'

export default function BlessingScreen() {
  const { markBlessingSeen } = usePrefs()

  return (
    <div className="blessing-screen">
      <div className="blessing-inner">
        <span className="auth-lotus blessing-lotus" aria-hidden="true" />
        <p className="eyebrow">A quiet beginning</p>
        <h1>Radhe Radhe</h1>
        <PromiseVerse />
        <button className="primary" type="button" onClick={markBlessingSeen}>
          Enter
        </button>
      </div>
    </div>
  )
}
