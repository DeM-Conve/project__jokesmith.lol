import { Group, Text } from '@mantine/core'
import { useState } from 'react'

const CELL = 13
const GAP = 3
const STEP = CELL + GAP
const LEFT = 28
const TOP = 18
const ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 0..4 intensity: none, a rep, a third of the goal, two thirds, goal hit. */
export function intensity(xp, goal = 75) {
  if (!xp) return 0
  if (xp >= goal) return 4
  if (xp >= (goal * 2) / 3) return 3
  if (xp >= goal / 3) return 2
  return 1
}

const OPACITY = [0, 0.3, 0.55, 0.8, 1]

function cellFill(level) {
  return level === 0 ? 'var(--surface-3)' : 'var(--accent)'
}

function parse(date) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function fmt(date) {
  return parse(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

/**
 * GitHub-style calendar: one column per week (Mon at top), amber intensity = XP vs the
 * daily goal. days: [{ date: 'YYYY-MM-DD', xp, reps }] oldest first, starting on a Monday.
 */
export default function StreakHeatmap({ days, goal = 75 }) {
  const [hover, setHover] = useState(null)
  const weeks = Math.ceil(days.length / 7)
  const w = LEFT + weeks * STEP
  const h = TOP + 7 * STEP
  const active = hover == null ? null : days[hover]

  const monthLabels = []
  for (let wk = 0; wk < weeks; wk++) {
    const first = days[wk * 7]
    if (!first) continue
    const d = parse(first.date)
    const prev = wk > 0 ? parse(days[(wk - 1) * 7].date) : null
    if (!prev || prev.getMonth() !== d.getMonth()) monthLabels.push({ wk, label: MONTHS[d.getMonth()] })
  }

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Practice calendar" style={{ display: 'block', maxWidth: w * 1.3 }}>
        {monthLabels.map(({ wk, label }) => (
          <text key={`${wk}${label}`} x={LEFT + wk * STEP} y={10} fill="var(--text-faint)" fontSize={10}>
            {label}
          </text>
        ))}
        {ROW_LABELS.map((l, i) => l && (
          <text key={l} x={0} y={TOP + i * STEP + CELL - 3} fill="var(--text-faint)" fontSize={10}>
            {l}
          </text>
        ))}
        {days.map((d, i) => {
          const level = intensity(d.xp, goal)
          const wk = Math.floor(i / 7)
          const row = i % 7
          return (
            <rect
              key={d.date}
              data-testid="heat-cell"
              data-level={level}
              x={LEFT + wk * STEP}
              y={TOP + row * STEP}
              width={CELL}
              height={CELL}
              rx={3}
              fill={cellFill(level)}
              fillOpacity={level === 0 ? 1 : OPACITY[level]}
              stroke={hover === i ? 'var(--text)' : 'none'}
              strokeWidth={1.5}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${fmt(d.date)}: ${d.reps} reps, ${d.xp} XP`}</title>
            </rect>
          )
        })}
      </svg>
      <Group justify="space-between" mt="2xs" gap="sm">
        <Text fz="xs" c={active ? 'var(--text)' : 'dimmed'} aria-live="polite">
          {active ? `${fmt(active.date)} · ${active.reps} ${active.reps === 1 ? 'rep' : 'reps'} · ${active.xp} XP` : 'Each square is a day. Full amber = daily goal hit.'}
        </Text>
        <Group gap="4xs" wrap="nowrap" aria-hidden>
          <Text fz="2xs" c="var(--text-faint)" mr="4xs">less</Text>
          {OPACITY.map((o, level) => (
            <svg key={o} width={CELL} height={CELL}>
              <rect width={CELL} height={CELL} rx={3} fill={cellFill(level)} fillOpacity={level === 0 ? 1 : o} />
            </svg>
          ))}
          <Text fz="2xs" c="var(--text-faint)" ml="4xs">more</Text>
        </Group>
      </Group>
    </div>
  )
}
