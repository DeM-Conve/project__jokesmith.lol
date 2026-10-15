import { TIP_CATEGORIES, TIPS, tipForDate } from './tips.js'

test('a big, unique, categorised tip list', () => {
  expect(TIPS.length).toBeGreaterThanOrEqual(120)
  expect(new Set(TIPS.map((t) => t.text)).size).toBe(TIPS.length)
  const cats = new Set(Object.values(TIP_CATEGORIES))
  for (const t of TIPS) {
    expect(cats.has(t.category)).toBe(true)
    expect(t.text.length).toBeGreaterThan(40)
  }
  expect(TIPS.length % 37).not.toBe(0) // keeps tipForDate a full cycle
})

test('tip of the day is stable within a day and changes the next', () => {
  const morning = tipForDate(new Date(2026, 9, 15, 7))
  const night = tipForDate(new Date(2026, 9, 15, 23, 59))
  const tomorrow = tipForDate(new Date(2026, 9, 16, 0, 1))
  expect(night.text).toBe(morning.text)
  expect(tomorrow.text).not.toBe(morning.text)
})

test('every tip shows up once per cycle', () => {
  const seen = new Set()
  const d = new Date(2026, 0, 1)
  for (let i = 0; i < TIPS.length; i++) {
    seen.add(tipForDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i)).index)
  }
  expect(seen.size).toBe(TIPS.length)
})
