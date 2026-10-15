import { GOOD_TAKE, track } from '../test/fixtures.js'
import {
  analyseTake, countFillers, countWords, energyVariance, frameMs, pausesBetween, prePunchPause, punchCameLast,
  punchWord, rate, sameWord, score, speechSegments, speechThreshold, tokenize, wordsPerMinute,
} from './analysis.js'

describe('text', () => {
  test('tokenize keeps apostrophes, drops punctuation, lower-cases', () => {
    expect(tokenize("I don't KNOW... it’s fine!")).toEqual(['i', "don't", 'know', "it's", 'fine'])
    expect(tokenize('')).toEqual([])
    expect(tokenize(null)).toEqual([])
    expect(countWords('  one two   three ')).toBe(3)
  })

  test('counts single and two-word fillers', () => {
    const f = countFillers('Um so like, my dog, uh, you know, is like lazy. Umm.')
    expect(f.byWord).toEqual({ um: 1, so: 1, like: 2, uh: 1, 'you know': 1, umm: 1 })
    expect(f.total).toBe(7)
    expect(countFillers('A clean line.').total).toBe(0)
  })

  test('so and like only count when used as fillers', () => {
    expect(countFillers('my dog is so lazy').total).toBe(0)
    expect(countFillers('I like cats and it looks like rain').total).toBe(0)
    expect(countFillers('so my dog is like really lazy').byWord).toEqual({ so: 1, like: 1 })
  })

  test('punch word is the last meaningful word', () => {
    expect(punchWord('My dog is so lazy, he hired a cat.')).toEqual({ word: 'cat', endsOnPunch: true, trailing: [] })
    expect(punchWord('I tried yoga and I hated it')).toEqual({ word: 'hated', endsOnPunch: false, trailing: ['it'] })
    expect(punchWord('').word).toBeNull()
  })

  test('sameWord tolerates plurals and one misheard letter', () => {
    expect(sameWord('cats', 'cat')).toBe(true)
    expect(sameWord('hated', 'hate')).toBe(true)
    expect(sameWord('toaster', 'toastar')).toBe(true)
    expect(sameWord('cat', 'car')).toBe(false) // short words must match exactly
    expect(sameWord('dog', null)).toBe(false)
  })

  test('punch came last unless something trails it', () => {
    const joke = 'My dog is so lazy, he hired a cat.'
    expect(punchCameLast('my dog is so lazy he hired a cat', joke).punchLast).toBe(true)
    expect(punchCameLast('my dog is so lazy he hired a cat um', joke).punchLast).toBe(true) // fillers ignored
    const trailing = punchCameLast('he hired a cat yeah get it', joke)
    expect(trailing.punchLast).toBe(false)
    expect(trailing.after).toEqual(['yeah', 'get', 'it'])
    expect(punchCameLast('he hired a dog', joke)).toMatchObject({ punchLast: false, missing: true })
    expect(punchCameLast('', joke).punchLast).toBeNull()
    // words the joke itself has after the punch word are fine
    expect(punchCameLast('i tried yoga and i hated it', 'I tried yoga and I hated it').punchLast).toBe(true)
  })
})

describe('audio', () => {
  test('frame duration and adaptive threshold', () => {
    const s = track([[0, 1000, 0.3]], 2000)
    expect(frameMs(s)).toBe(50)
    const th = speechThreshold(s)
    expect(th).toBeGreaterThan(0.004)
    expect(th).toBeLessThan(0.3)
    expect(speechThreshold(track([], 1000))).toBe(0.012) // pure silence: absolute floor
  })

  test('segments merge short gaps and drop blips', () => {
    const s = track([[0, 500, 0.3], [600, 1000, 0.3], [1500, 1550, 0.3], [2000, 2600, 0.3]], 3000)
    const segs = speechSegments(s)
    // the 100 ms gap merges, the 50 ms blip at 1500 is kept only if >= 60ms -> dropped
    expect(segs).toEqual([{ start: 0, end: 1000 }, { start: 2000, end: 2600 }])
    expect(pausesBetween(segs)).toEqual([{ start: 1000, end: 2000, ms: 1000 }])
    expect(speechSegments([])).toEqual([])
  })

  test('pre-punch pause is the pause just before the final stretch', () => {
    const segs = [{ start: 0, end: 800 }, { start: 2000, end: 3000 }, { start: 3300, end: 6000 }, { start: 6600, end: 7000 }]
    // 1200 ms pause is long but early; within the last 2.5 s only the 600 ms one qualifies
    expect(prePunchPause(segs)).toEqual({ start: 6000, end: 6600, ms: 600 })
    expect(prePunchPause([{ start: 0, end: 1000 }])).toBeNull()
  })

  test('energy variance: monotone is ~0, lively is higher', () => {
    const flat = track([[0, 2000, 0.2]], 2000)
    const lively = track([[0, 2000, 0.2]], 2000, { wobble: 0.1 })
    const segs = [{ start: 0, end: 2000 }]
    expect(energyVariance(flat, segs)).toBeCloseTo(0, 5)
    expect(energyVariance(lively, segs)).toBeGreaterThan(0.3)
    expect(energyVariance([], [])).toBe(0)
  })

  test('words per minute', () => {
    expect(wordsPerMinute(10, 4000)).toBe(150)
    expect(wordsPerMinute(0, 4000)).toBe(0)
    expect(wordsPerMinute(10, 0)).toBe(0)
  })
})

describe('rating and score', () => {
  const base = { wordCount: 10, wordsPerMinute: 150, prePunchPauseMs: 600, hasTranscript: true, fillerCount: 0, punchLast: true, punchMissing: false, energyVariance: 0.5, jokeEndsOnPunch: true }

  test('a textbook take maxes the score', () => {
    const r = rate(base)
    expect(r).toEqual({ pace: 'good', pause: 'good', fillers: 'zero', punch: 'last', energy: 'good', structure: 'endsOnPunch' })
    expect(score(r)).toBe(100)
  })

  test('boundaries', () => {
    expect(rate({ ...base, wordsPerMinute: 200 }).pace).toBe('tooFast')
    expect(rate({ ...base, wordsPerMinute: 170 }).pace).toBe('fast')
    expect(rate({ ...base, wordsPerMinute: 100 }).pace).toBe('slow')
    expect(rate({ ...base, wordsPerMinute: 80 }).pace).toBe('tooSlow')
    expect(rate({ ...base, wordCount: 0 }).pace).toBe('unknown')
    expect(rate({ ...base, prePunchPauseMs: 100 }).pause).toBe('none')
    expect(rate({ ...base, prePunchPauseMs: 200 }).pause).toBe('short')
    expect(rate({ ...base, prePunchPauseMs: 1500 }).pause).toBe('long')
    expect(rate({ ...base, prePunchPauseMs: 2500 }).pause).toBe('tooLong')
    expect(rate({ ...base, fillerCount: 2 }).fillers).toBe('few')
    expect(rate({ ...base, fillerCount: 5 }).fillers).toBe('many')
    expect(rate({ ...base, hasTranscript: false }).fillers).toBe('unknown')
    expect(rate({ ...base, punchLast: null }).punch).toBe('unknown')
    expect(rate({ ...base, punchLast: false }).punch).toBe('trailing')
    expect(rate({ ...base, punchLast: false, punchMissing: true }).punch).toBe('missing')
    expect(rate({ ...base, energyVariance: 0.1 }).energy).toBe('flat')
    expect(rate({ ...base, energyVariance: 1.4 }).energy).toBe('spiky')
  })

  test('rushing the punch costs the most', () => {
    const rushed = score(rate({ ...base, prePunchPauseMs: 50 }))
    const fast = score(rate({ ...base, wordsPerMinute: 170 }))
    expect(rushed).toBeLessThan(fast)
  })
})

describe('analyseTake', () => {
  test('finds the pause before the punch in a good take', () => {
    const a = analyseTake(GOOD_TAKE)
    expect(a.silent).toBe(false)
    expect(a.segments).toHaveLength(2)
    expect(a.prePunch.ms).toBe(700)
    expect(a.metrics).toMatchObject({ durationMs: 3800, speechMs: 3300, wordCount: 9, prePunchPauseMs: 700, longestPauseMs: 700, fillerCount: 0, punchLast: true })
    expect(a.metrics.wordsPerMinute).toBeCloseTo(163.6, 1)
    expect(a.metrics.energyVariance).toBeGreaterThan(0.25)
    expect(a.metrics.score).toBeGreaterThanOrEqual(85)
  })

  test('without a transcript, words are estimated from the joke', () => {
    const a = analyseTake({ ...GOOD_TAKE, transcript: '' })
    expect(a.estimatedWords).toBe(true)
    expect(a.metrics.wordCount).toBe(9)
    expect(a.metrics.punchLast).toBeNull()
    expect(a.ratings.fillers).toBe('unknown')
  })

  test('silence is flagged and scores zero', () => {
    const a = analyseTake({ samples: track([], 3000), transcript: '', jokeText: 'x', durationMs: 3000 })
    expect(a.silent).toBe(true)
    expect(a.metrics.score).toBe(0)
    expect(a.metrics.wordsPerMinute).toBe(0)
  })

  test('metrics are plain numbers ready for the API', () => {
    const { metrics } = analyseTake(GOOD_TAKE)
    for (const [k, v] of Object.entries(metrics)) {
      if (k === 'punchLast') continue
      expect(Number.isFinite(v)).toBe(true)
    }
    expect(Number.isInteger(metrics.prePunchPauseMs)).toBe(true)
  })
})
