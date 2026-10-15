import { ANATOMY, ASSOCIATION, POINT_OF_VIEW } from './lessons-1.js'
import { ECONOMY, FORMULAS, HEIGHTENING } from './lessons-2.js'
import { DELIVERY, FEEDBACK, REAL_TIME_WIT } from './lessons-3.js'

/**
 * The curriculum, in learning order: first see the machine (anatomy), then find
 * something to say (point of view, association), then the tools (formulas,
 * economy, heightening), then use them live (wit, delivery), then improve (feedback).
 */
export const LESSONS = [ANATOMY, POINT_OF_VIEW, ASSOCIATION, FORMULAS, ECONOMY, HEIGHTENING, REAL_TIME_WIT, DELIVERY, FEEDBACK]
  .map((lesson, i) => ({ ...lesson, order: i + 1, slug: lesson.skill.toLowerCase().replaceAll('_', '-') }))

/** Accepts "point-of-view", "POINT_OF_VIEW" or "point_of_view". */
export function findLesson(param) {
  if (!param) return undefined
  const key = String(param).toUpperCase().replaceAll('-', '_')
  return LESSONS.find((l) => l.skill === key)
}

export function nextLesson(skill) {
  const i = LESSONS.findIndex((l) => l.skill === skill)
  return i >= 0 ? LESSONS[i + 1] : undefined
}

export const SKILL_LABELS = Object.fromEntries(LESSONS.map((l) => [l.skill, l.title]))
