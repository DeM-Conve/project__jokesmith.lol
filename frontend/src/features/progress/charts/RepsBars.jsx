import { Group, Text } from '@mantine/core'
import { useState } from 'react'

function parse(date) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const short = (date) => parse(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/** Reps per day as thin amber bars, rounded at the data end, anchored to the baseline. */
export default function RepsBars({ days }) {
  const [hover, setHover] = useState(null)
  const H = 120
  const BASE = H - 2
  const BAR = 10
  const GAP = 4
  const w = days.length * (BAR + GAP)
  const max = Math.max(1, ...days.map((d) => d.reps))
  const active = hover == null ? null : days[hover]
  const ticks = [0, Math.floor(days.length / 2), days.length - 1]

  return (
    <div>
      <Text fz="xs" c={active ? 'var(--text)' : 'dimmed'} mih={18} aria-live="polite">
        {active ? `${short(active.date)} · ${active.reps} ${active.reps === 1 ? 'rep' : 'reps'} · ${active.xp} XP` : `Busiest day: ${max} reps`}
      </Text>
      <svg viewBox={`0 0 ${w} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img" aria-label="Reps per day" style={{ display: 'block' }}>
        <line x1={0} x2={w} y1={BASE + 0.5} y2={BASE + 0.5} stroke="var(--border)" strokeWidth={1} />
        {days.map((d, i) => {
          const bh = d.reps ? Math.max(4, (d.reps / max) * (BASE - 6)) : 0
          const x = i * (BAR + GAP)
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <title>{`${short(d.date)}: ${d.reps} reps`}</title>
              <rect x={x - GAP / 2} y={0} width={BAR + GAP} height={BASE} fill="transparent" />
              {bh > 0 && (
                <path
                  data-testid="rep-bar"
                  d={`M${x},${BASE} v${-(bh - 3)} q0,-3 3,-3 h${BAR - 6} q3,0 3,3 v${bh - 3} z`}
                  fill="var(--accent)"
                  fillOpacity={hover === i ? 1 : 0.8}
                />
              )}
            </g>
          )
        })}
      </svg>
      <Group justify="space-between" mt="4xs">
        {ticks.map((i) => days[i] && (
          <Text key={i} fz="2xs" c="var(--text-faint)">
            {i === days.length - 1 ? 'today' : short(days[i].date)}
          </Text>
        ))}
      </Group>
    </div>
  )
}
