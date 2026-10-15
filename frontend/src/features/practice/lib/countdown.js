import { useCallback, useEffect, useRef, useState } from 'react'

/** "4:07" for 247_000 ms; rounds up so the clock never shows 0:00 while time remains. */
export function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Milliseconds left until `deadline` (epoch ms), never negative. */
export function remainingMs(deadline, now) {
  return Math.max(0, deadline - now)
}

/**
 * A drift-free countdown: it stores the deadline, not a ticking counter, so a
 * throttled background tab still ends on time. `onExpire` fires once at zero.
 */
export function useCountdown(durationMs, { onExpire, tickMs = 200 } = {}) {
  const [deadline, setDeadline] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const expireRef = useRef(onExpire)
  const firedRef = useRef(false)

  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (deadline == null) return undefined
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= deadline && !firedRef.current) {
        firedRef.current = true
        clearInterval(id)
        setDeadline(null)
        expireRef.current?.()
      }
    }, tickMs)
    return () => clearInterval(id)
  }, [deadline, tickMs])

  const start = useCallback(() => {
    const t = Date.now()
    firedRef.current = false
    setNow(t)
    setDeadline(t + durationMs)
  }, [durationMs])

  const stop = useCallback(() => setDeadline(null), [])

  const running = deadline != null
  const remaining = running ? remainingMs(deadline, now) : durationMs
  return {
    running,
    remaining,
    elapsed: durationMs - remaining,
    fraction: durationMs > 0 ? remaining / durationMs : 0,
    start,
    stop,
  }
}
