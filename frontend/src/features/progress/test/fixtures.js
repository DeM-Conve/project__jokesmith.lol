/**
 * Synthetic loudness track: speech at `level` inside each [start, end) span, room noise
 * elsewhere. Sampled every dt ms like the AnalyserNode loop.
 */
export function track(spans, totalMs, { dt = 50, noise = 0.004, wobble = 0 } = {}) {
  const out = []
  for (let t = 0; t < totalMs; t += dt) {
    const span = spans.find(([s, e]) => t >= s && t < e)
    const wob = wobble ? Math.sin(t / 37) * wobble : 0
    out.push({ t, level: span ? Math.max(0, span[2] + wob) : noise })
  }
  return out
}

/** A well-timed take: setup 0-2.0s, 0.7s pause, punch 2.7-3.3s. */
export const GOOD_TAKE = {
  samples: track([[0, 2000, 0.2], [2700, 3300, 0.3]], 3800, { wobble: 0.08 }),
  transcript: 'my dog is so lazy he hired a cat',
  jokeText: 'My dog is so lazy, he hired a cat.',
  durationMs: 3800,
}

export const todayNew = {
  newUser: true,
  streak: { current: 0, best: 0, activeToday: false },
  todayXp: 0,
  dailyGoal: 75,
  todayReps: 0,
  totalXp: 0,
  rank: { index: 0, title: 'Open-Mic Newbie', minXp: 0, nextTitle: 'Bringer-Show Regular', nextMinXp: 100, ranks: 9 },
  plan: [
    { kind: 'RIFF', skill: 'HEIGHTENING', title: 'Daily Riff', why: 'Today\'s prompt.', route: '/riff', done: false },
    { kind: 'DRILL', skill: 'ANATOMY', title: 'X-ray a joke', why: 'Joke anatomy is your quietest skill.', route: '/xray', done: false },
    { kind: 'LESSON', skill: 'ANATOMY', title: 'Lesson: Joke anatomy', why: 'Next up.', route: '/learn/ANATOMY', done: false },
  ],
}

export const todayRegular = {
  ...todayNew,
  newUser: false,
  streak: { current: 4, best: 6, activeToday: true },
  todayXp: 35,
  todayReps: 2,
  totalXp: 420,
  rank: { index: 2, title: 'Five-Minute Spot', minXp: 300, nextTitle: 'Guest Spot', nextMinXp: 600, ranks: 9 },
  plan: [
    { ...todayNew.plan[0], done: true },
    { kind: 'DRILL', skill: 'ECONOMY', title: 'Punch up a joke', why: 'Economy is your quietest skill.', route: '/punchup', done: false },
    { kind: 'DRILL', skill: 'FEEDBACK', title: 'Judge in the Arena', why: 'Feedback.', route: '/arena', done: false },
    { kind: 'LESSON', skill: 'FORMULAS', title: 'Lesson: Formulas', why: 'Next up.', route: '/learn/FORMULAS', done: false },
  ],
}

const SKILLS = ['ANATOMY', 'ASSOCIATION', 'FORMULAS', 'POINT_OF_VIEW', 'ECONOMY', 'HEIGHTENING', 'REAL_TIME_WIT', 'DELIVERY', 'FEEDBACK']

export function radarFixture({ empty = false } = {}) {
  const days = []
  const start = new Date(2026, 4, 25) // a Monday
  for (let i = 0; i < 144; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const reps = empty ? 0 : i % 3
    days.push({ date: iso, reps, xp: reps * 25 })
  }
  return {
    skills: SKILLS.map((skill, i) => ({ skill, xp: empty ? 0 : i * 50, reps: empty ? 0 : i * 2, level: empty ? 0 : i * 10 })),
    totalXp: empty ? 0 : 1800,
    totalReps: empty ? 0 : 72,
    jokesWritten: empty ? 0 : 31,
    rank: { index: 5, title: 'Club Regular', minXp: 1600, nextTitle: 'Road Dog', nextMinXp: 2500, ranks: 9 },
    ladder: [
      ['Open-Mic Newbie', 0], ['Bringer-Show Regular', 100], ['Five-Minute Spot', 300], ['Guest Spot', 600],
      ['Feature Act', 1000], ['Club Regular', 1600], ['Road Dog', 2500], ['Late-Night Writer', 4000], ['Headliner', 6000],
    ].map(([title, minXp]) => ({ title, minXp })),
    streak: { current: empty ? 0 : 3, best: empty ? 0 : 9, activeToday: !empty },
    days,
  }
}
