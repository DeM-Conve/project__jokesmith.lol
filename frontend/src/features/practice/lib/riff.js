/** Punchlines per riff that count as pushing past the obvious. */
export const RIFF_GOAL = 10

/** Mirrors the server: 5 xp a punchline, capped at 50. */
export function riffXp(count) {
  return Math.min(50, 5 * count)
}

/** YYYY-MM-DD in the browser's own calendar (the daily riff follows your day, not UTC's). */
export function localIsoDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const TIPS = [
  'Try exaggerating: make it a thousand times worse.',
  "What's the opposite? Flip who's winning.",
  'What would your mum say about it?',
  'Take one word in the setup literally.',
  'Who else is in the room? Give them a line.',
  'Make it smaller and more specific. A brand, a number, a name.',
  'What happens next? Fast-forward a week.',
  'Answer it as the villain of the story.',
  'What would a dog / a toddler / a pirate make of it?',
  'Combine two of your earlier ones.',
]

/** The coaching line under the input after `count` punchlines. */
export function nudgeFor(count) {
  if (count === 0) return 'Start with the obvious one. Get it out of your system.'
  if (count < 3) return 'Keep going. The first three are everyone’s first three.'
  if (count === 3) return 'The obvious ones are out. Now go weird.'
  if (count >= RIFF_GOAL) return 'Past the goal. This is where the gold is. Keep digging.'
  return TIPS[(count - 4) % TIPS.length]
}
