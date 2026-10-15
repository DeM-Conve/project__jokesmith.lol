import { Text } from '@mantine/core'
import { useState } from 'react'

const RINGS = [25, 50, 75, 100]

/** Point on axis i of n at radius r (0 = centre), first axis straight up. */
export function polar(i, n, r, cx, cy) {
  const a = (Math.PI * 2 * i) / n - Math.PI / 2
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
}

/**
 * Spider chart of skill levels (0..100). skills: [{ key, label, level, xp, reps }].
 * Hand-drawn SVG: concentric rings, one amber polygon, a hover readout per axis.
 */
export default function RadarChart({ skills, size = 360 }) {
  const [hover, setHover] = useState(null)
  const n = skills.length
  const pad = 110
  const cx = size / 2 + pad
  const cy = size / 2 + 24
  const R = size / 2 - 8
  const w = size + pad * 2
  const h = size + 48
  const shape = skills.map((s, i) => polar(i, n, (Math.max(s.level, 2) / 100) * R, cx, cy))
  const active = hover == null ? null : skills[hover]

  return (
    <div>
      <Text fz="sm" c={active ? 'var(--text)' : 'dimmed'} ta="center" mih={20} aria-live="polite">
        {active ? `${active.label}: level ${active.level} · ${active.xp} XP · ${active.reps} reps` : 'Hover a skill for details'}
      </Text>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Skill radar" style={{ display: 'block', maxWidth: w, margin: '0 auto' }}>
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={skills.map((_, i) => polar(i, n, (ring / 100) * R, cx, cy).join(',')).join(' ')}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}
        {skills.map((s, i) => {
          const [x, y] = polar(i, n, R, cx, cy)
          return <line key={s.key} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />
        })}
        <text x={cx + 4} y={cy - R / 2 - 2} fill="var(--text-faint)" fontSize={10}>50</text>
        <text x={cx + 4} y={cy - R - 2} fill="var(--text-faint)" fontSize={10}>100</text>

        <polygon
          points={shape.map((p) => p.join(',')).join(' ')}
          fill="var(--accent-soft)"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ transition: 'all 600ms ease' }}
        />

        {skills.map((s, i) => {
          const [px, py] = shape[i]
          const [lx, ly] = polar(i, n, R + 18, cx, cy)
          const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end'
          const on = hover === i
          return (
            <g
              key={s.key}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              style={{ cursor: 'default', outline: 'none' }}
            >
              <title>{`${s.label}: level ${s.level}`}</title>
              <circle cx={px} cy={py} r={on ? 6 : 4} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
              <circle cx={px} cy={py} r={14} fill="transparent" />
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill={on ? 'var(--text)' : 'var(--text-muted)'}
                fontSize={13}
                fontWeight={on ? 600 : 500}
              >
                {s.short ?? s.label}
                <tspan fill="var(--text-faint)" fontWeight={500}>{` ${s.level}`}</tspan>
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
