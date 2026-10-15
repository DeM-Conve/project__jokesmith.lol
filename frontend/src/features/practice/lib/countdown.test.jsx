import { act, renderHook } from '@testing-library/react'
import { formatClock, remainingMs, useCountdown } from './countdown.js'

test('formatClock rounds up and pads seconds', () => {
  expect(formatClock(300_000)).toBe('5:00')
  expect(formatClock(247_000)).toBe('4:07')
  expect(formatClock(100)).toBe('0:01')
  expect(formatClock(0)).toBe('0:00')
  expect(formatClock(-50)).toBe('0:00')
})

test('remainingMs never goes negative', () => {
  expect(remainingMs(1000, 400)).toBe(600)
  expect(remainingMs(1000, 4000)).toBe(0)
})

describe('useCountdown', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('counts down from the deadline and fires onExpire once', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown(5_000, { onExpire, tickMs: 100 }))
    expect(result.current.running).toBe(false)
    expect(result.current.remaining).toBe(5_000)

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2_000))
    expect(result.current.running).toBe(true)
    expect(result.current.remaining).toBeLessThanOrEqual(3_000)
    expect(result.current.remaining).toBeGreaterThan(2_800)
    expect(result.current.fraction).toBeCloseTo(0.6, 1)

    act(() => vi.advanceTimersByTime(3_500))
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(result.current.running).toBe(false)
    act(() => vi.advanceTimersByTime(5_000))
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  test('stop cancels without expiring', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown(1_000, { onExpire, tickMs: 100 }))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(400))
    act(() => result.current.stop())
    act(() => vi.advanceTimersByTime(2_000))
    expect(onExpire).not.toHaveBeenCalled()
    expect(result.current.running).toBe(false)
  })
})
