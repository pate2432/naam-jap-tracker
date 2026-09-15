import { useCallback, useEffect, useState } from 'react'
import { getLocalTimeZone, getTodayLocalDate } from '../lib/date'
import { supabase } from '../lib/supabase'

export function useTodayJap(session) {
  const tz = getLocalTimeZone()
  const today = getTodayLocalDate(tz)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user?.id || !supabase) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    const bootstrap = async () => {
      setLoading(true)
      const labels = (import.meta.env.VITE_USER_LABELS || '')
        .split(',')
        .reduce((acc, item) => {
          const [email, name] = item.split(':').map((part) => part.trim())
          if (email && name) acc[email.toLowerCase()] = name
          return acc
        }, {})
      const displayName =
        labels[session.user.email?.toLowerCase()] ||
        session.user.user_metadata?.display_name ||
        'Kirtida'

      await supabase.from('profiles').upsert({
        id: session.user.id,
        email: session.user.email,
        display_name: displayName,
      })

      const { data, error: loadError } = await supabase
        .from('jap_entries')
        .select('count')
        .eq('user_id', session.user.id)
        .eq('local_date', today)
        .maybeSingle()

      if (cancelled) return
      if (loadError) setError(loadError.message)
      setCount(data?.count ?? 0)
      setLoading(false)
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [session?.user?.id, session?.user?.email, session?.user?.user_metadata?.display_name, today])

  const save = useCallback(
    async (nextCount) => {
      if (!session?.user?.id || !supabase) return false
      setError('')

      const { data, error: saveError } = await supabase
        .from('jap_entries')
        .upsert(
          {
            user_id: session.user.id,
            local_date: today,
            local_tz: tz,
            count: nextCount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,local_date' },
        )
        .select('count')
        .single()

      if (saveError) {
        setError(saveError.message)
        return false
      }

      setCount(data?.count ?? nextCount)
      return true
    },
    [session?.user?.id, today, tz],
  )

  return { count, loading, error, save }
}
