import { useCallback, useEffect, useState } from 'react'
import { getLocalTimeZone, getTodayLocalDate } from '../lib/date'
import { readLocalJap, writeLocalJap } from '../lib/japStore'
import { supabase } from '../lib/supabase'

const displayNameFor = (session) => {
  const labels = (import.meta.env.VITE_USER_LABELS || '')
    .split(',')
    .reduce((acc, item) => {
      const [email, name] = item.split(':').map((part) => part.trim())
      if (email && name) acc[email.toLowerCase()] = name
      return acc
    }, {})
  return (
    labels[session.user.email?.toLowerCase()] ||
    session.user.user_metadata?.display_name ||
    'Kirtida'
  )
}

export function useTodayJap(session) {
  const tz = getLocalTimeZone()
  const today = getTodayLocalDate(tz)
  const userId = session?.user?.id
  const [count, setCount] = useState(() => readLocalJap(userId, today))
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const persist = useCallback(
    async (nextCount) => {
      if (!userId || !supabase) return false
      writeLocalJap(userId, today, nextCount)
      setCount(nextCount)
      setError('')

      await supabase.from('profiles').upsert({
        id: userId,
        email: session.user.email,
        display_name: displayNameFor(session),
      })

      const { data: existing, error: findError } = await supabase
        .from('jap_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('local_date', today)
        .maybeSingle()

      if (findError) {
        setError(findError.message)
        return false
      }

      const saveError = existing?.id
        ? (
            await supabase
              .from('jap_entries')
              .update({
                count: nextCount,
                local_tz: tz,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)
          ).error
        : (
            await supabase.from('jap_entries').insert({
              user_id: userId,
              local_date: today,
              local_tz: tz,
              count: nextCount,
            })
          ).error

      if (saveError) {
        setError(saveError.message)
        return false
      }

      return true
    },
    [session, today, tz, userId],
  )

  useEffect(() => {
    if (!userId || !supabase) {
      setReady(true)
      return undefined
    }

    let cancelled = false

    const hydrate = async () => {
      const local = readLocalJap(userId, today)

      await supabase.from('profiles').upsert({
        id: userId,
        email: session.user.email,
        display_name: displayNameFor(session),
      })

      const { data, error: loadError } = await supabase
        .from('jap_entries')
        .select('count')
        .eq('user_id', userId)
        .eq('local_date', today)
        .maybeSingle()

      if (cancelled) return
      if (loadError) setError(loadError.message)

      const server = data?.count ?? 0
      const next = Math.max(server, local)
      writeLocalJap(userId, today, next)
      setCount(next)
      setReady(true)

      if (local > server) persist(local)
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [persist, session, today, userId])

  return { count, ready, error, save: persist }
}
