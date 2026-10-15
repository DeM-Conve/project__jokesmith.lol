import { bare, tokens } from '../lib/words.js'
import { findLesson, LESSONS, nextLesson } from './lessons.js'

const SKILLS = ['ANATOMY', 'ASSOCIATION', 'FORMULAS', 'POINT_OF_VIEW', 'ECONOMY', 'HEIGHTENING', 'REAL_TIME_WIT', 'DELIVERY', 'FEEDBACK']
const ROUTES = ['/xray', '/gym', '/riff', '/associate', '/banter', '/punchup', '/arena', '/notebook', '/delivery', '/progress']

test('one lesson per skill, in order, with slugs that resolve', () => {
  expect(LESSONS.map((l) => l.skill).sort()).toEqual([...SKILLS].sort())
  expect(LESSONS[0].skill).toBe('ANATOMY')
  LESSONS.forEach((l, i) => {
    expect(l.order).toBe(i + 1)
    expect(findLesson(l.slug)).toBe(l)
    expect(findLesson(l.skill)).toBe(l)
  })
  expect(nextLesson('ANATOMY').skill).toBe('POINT_OF_VIEW')
  expect(nextLesson('FEEDBACK')).toBeUndefined()
})

test.each(LESSONS.map((l) => [l.skill, l]))('%s is a real lesson, not filler', (_, l) => {
  expect(l.cards.length).toBeGreaterThanOrEqual(4)
  expect(l.examples.length).toBeGreaterThanOrEqual(3)
  for (const ex of l.examples) {
    expect(ex.steps.length).toBeGreaterThanOrEqual(4)
    expect(bare(ex.punchline)).toContain(bare(ex.punchWord))
    // Every worked example is a real, credited joke with the page that verifies its wording.
    expect(ex.comedian?.trim()).toBeTruthy()
    expect(ex.source?.trim()).toBeTruthy()
    expect(ex.sourceUrl).toMatch(/^https:\/\//)
  }
  expect(l.masters.length).toBeGreaterThanOrEqual(2)
  expect(l.masters.length).toBeLessThanOrEqual(3)
  for (const m of l.masters) {
    expect(m.comedian?.trim()).toBeTruthy()
    expect(m.title?.trim()).toBeTruthy()
    expect(m.url).toMatch(/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//)
    expect(m.channel?.trim()).toBeTruthy()
    expect(m.lines?.length ?? 0).toBeLessThanOrEqual(2)
    expect(m.notice.length).toBeGreaterThanOrEqual(2)
    expect(m.notice.length).toBeLessThanOrEqual(3)
  }
  expect(l.mistakes.length).toBeGreaterThanOrEqual(3)
  expect(l.quiz.length).toBeGreaterThanOrEqual(3)
  for (const q of l.quiz) {
    if (q.kind === 'word') {
      const words = tokens(`${q.joke.setup} ${q.joke.punchline}`).map(bare)
      expect(words).toContain(bare(q.answer))
    } else {
      expect(q.options[q.answer]).toBeTruthy()
    }
    expect(q.explain).toBeTruthy()
  }
  expect(l.exercise.prompt).toBeTruthy()
  expect(l.exercise.modelAnswers.length).toBeGreaterThanOrEqual(1)
  expect(ROUTES).toContain(l.drill.to)
})

test('masters cover several comics, with Indian comedians across the course', () => {
  const masters = LESSONS.flatMap((l) => l.masters)
  expect(new Set(masters.map((m) => m.url)).size).toBe(masters.length)
  expect(masters.filter((m) => m.indian).length).toBeGreaterThanOrEqual(LESSONS.length)
})
