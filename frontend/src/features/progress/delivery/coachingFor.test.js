import { GOOD_TAKE, track } from '../test/fixtures.js'
import { COACHING, VERDICTS, verdictFor } from '../data/coaching.js'
import { analyseTake } from './analysis.js'
import { coachingFor } from './coachingFor.js'

const OUTCOMES = {
  pace: ['good', 'fast', 'tooFast', 'slow', 'tooSlow', 'unknown'],
  pause: ['good', 'short', 'none', 'long', 'tooLong'],
  fillers: ['zero', 'few', 'many', 'unknown'],
  punch: ['last', 'trailing', 'missing', 'unknown'],
  energy: ['good', 'flat', 'spiky'],
  structure: ['endsOnPunch', 'buried'],
}

test('every outcome the analyser can produce has coaching copy', () => {
  for (const [metric, outcomes] of Object.entries(OUTCOMES)) {
    for (const o of outcomes) {
      const entry = COACHING[metric][o]
      expect(entry, `${metric}.${o}`).toBeDefined()
      expect(['good', 'warn', 'bad']).toContain(entry.tone)
      expect(entry.variants.length).toBeGreaterThan(0)
      for (const v of entry.variants) expect(v.headline && v.body).toBeTruthy()
    }
  }
})

test('verdicts cover every score', () => {
  for (let s = 0; s <= 100; s++) expect(verdictFor(s)).toBeDefined()
  expect(verdictFor(100)).toBe(VERDICTS[0])
})

test('notes are worst-first with placeholders filled', () => {
  const a = analyseTake({ ...GOOD_TAKE, transcript: 'um so my dog is so lazy he hired a cat yeah', jokeText: 'My dog is so lazy, he hired a cat.' })
  const notes = coachingFor(a, 0)
  expect(notes.map((n) => n.key).sort()).toEqual(['energy', 'fillers', 'pace', 'pause', 'punch', 'structure'])
  const rank = { bad: 0, warn: 1, good: 2 }
  for (let i = 1; i < notes.length; i++) expect(rank[notes[i - 1].tone]).toBeLessThanOrEqual(rank[notes[i].tone])
  const punch = notes.find((n) => n.key === 'punch')
  expect(punch.tone).toBe('bad')
  expect(punch.body).toContain('yeah')
  for (const n of notes) expect(`${n.headline} ${n.body} ${n.drill ?? ''}`).not.toMatch(/\{\w+\}/)
})

test('a buried punch word names the trailing words', () => {
  const a = analyseTake({ samples: track([[0, 1500, 0.2], [2100, 2600, 0.3]], 3000), transcript: 'i tried yoga and i hated it', jokeText: 'I tried yoga and I hated it' })
  const structure = coachingFor(a).find((n) => n.key === 'structure')
  expect(structure.outcome).toBe('buried')
  expect(structure.body).toContain('"it"')
  expect(structure.body).toContain('"hated"')
})
