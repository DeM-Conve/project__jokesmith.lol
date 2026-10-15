import { COACHING, METRIC_LABELS } from '../data/coaching.js'

const ORDER = ['pause', 'pace', 'punch', 'fillers', 'energy', 'structure']
const TONE_RANK = { bad: 0, warn: 1, good: 2 }

function fill(text, vars) {
  return text?.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

function formatFillers(byWord) {
  const parts = Object.entries(byWord).map(([w, n]) => (n > 1 ? `"${w}" ×${n}` : `"${w}"`))
  return parts.join(', ')
}

/**
 * Coaching notes for an analysed take (analyseTake's result), worst first so the top
 * note is the one to fix next. variantSeed picks among phrasings (e.g. the take number).
 */
export function coachingFor(analysis, variantSeed = 0) {
  const { metrics, ratings, fillers, punch } = analysis
  const vars = {
    wpm: Math.round(metrics.wordsPerMinute),
    pause: `${(metrics.prePunchPauseMs / 1000).toFixed(2)}s`,
    fillers: formatFillers(fillers.byWord),
    punch: punch.punchWord ?? '',
    after: (punch.after ?? []).join(' '),
    tail: (analysis.written?.trailing ?? []).join(' '),
  }
  return ORDER.filter((key) => !(key === 'structure' && !punch.punchWord))
    .map((key, i) => {
      const entry = COACHING[key][ratings[key]]
      const v = entry.variants[(variantSeed + i) % entry.variants.length]
      return {
        key,
        label: METRIC_LABELS[key],
        outcome: ratings[key],
        tone: entry.tone,
        headline: fill(v.headline, vars),
        body: fill(v.body, vars),
        drill: fill(v.drill, vars),
      }
    })
    .sort((a, b) => TONE_RANK[a.tone] - TONE_RANK[b.tone])
}
