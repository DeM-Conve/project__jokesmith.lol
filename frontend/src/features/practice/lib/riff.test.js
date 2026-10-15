import { localIsoDate, nudgeFor, RIFF_GOAL, riffXp } from './riff.js'

test('xp scales with punchlines and caps at 50', () => {
  expect(riffXp(1)).toBe(5)
  expect(riffXp(RIFF_GOAL)).toBe(50)
  expect(riffXp(25)).toBe(50)
})

test('nudges: obvious first, then go weird after three, then tips', () => {
  expect(nudgeFor(0)).toMatch(/obvious/)
  expect(nudgeFor(3)).toBe('The obvious ones are out. Now go weird.')
  expect(nudgeFor(4)).toMatch(/exaggerat/i)
  expect(nudgeFor(5)).toMatch(/opposite/i)
  expect(nudgeFor(6)).toMatch(/mum/i)
  expect(nudgeFor(RIFF_GOAL)).toMatch(/gold/)
})

test('localIsoDate uses the local calendar', () => {
  expect(localIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
})
