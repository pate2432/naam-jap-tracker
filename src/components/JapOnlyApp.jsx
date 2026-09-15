import { supabase } from '../lib/supabase'
import { useTodayJap } from '../hooks/useTodayJap'
import JapPage from './JapPage'

export default function JapOnlyApp({ session }) {
  const { count, ready, error, save } = useTodayJap(session)

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (!ready) {
    return (
      <div className="loading-state">
        <div className="lotus-loader" />
        <p>Preparing your mala...</p>
      </div>
    )
  }

  return (
    <>
      {error ? <div className="form-alert error jap-only-alert">{error}</div> : null}
      <JapPage
        todayCount={count}
        onCommit={save}
        onLeave={signOut}
        leaveLabel="Sign out"
      />
    </>
  )
}
