import { Group, Text } from '@mantine/core'

const W = 640
const H = 120
const MID = H / 2

/**
 * Loudness over time as a mirrored waveform. Speech segments are lit, the pre-punch
 * pause is highlighted as an amber band. live = recording (mic red, no analysis yet).
 * samples: [{ t, level }]; segments: [{ start, end }]; prePunch: { start, end, ms } | null.
 */
export default function VolumeTimeline({ samples, segments = [], prePunch = null, durationMs, live = false }) {
  const total = Math.max(durationMs ?? 0, samples.length ? samples[samples.length - 1].t : 0, live ? 6000 : 1)
  const x = (t) => (t / total) * W
  const peak = Math.max(0.05, ...samples.map((s) => s.level))
  const inSpeech = (t) => segments.some((g) => t >= g.start && t < g.end)
  const color = live ? 'var(--mic)' : 'var(--accent)'
  const barW = Math.max(1, W / Math.max(samples.length, 120) - 1)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" role="img"
        aria-label={live ? 'Live volume' : 'Volume timeline'} style={{ display: 'block', height: H }}>
        <rect x={0} y={0} width={W} height={H} rx={8} fill="var(--surface-2)" />
        {prePunch && (
          <g data-testid="pre-punch-band">
            <rect x={x(prePunch.start)} y={4} width={Math.max(2, x(prePunch.end) - x(prePunch.start))} height={H - 8}
              rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeDasharray="3 3" strokeWidth={1} />
          </g>
        )}
        <line x1={0} x2={W} y1={MID} y2={MID} stroke="var(--border)" strokeWidth={1} />
        {samples.map((s) => {
          const amp = Math.max(1, (s.level / peak) * (MID - 8))
          const lit = live || inSpeech(s.t)
          return (
            <rect key={s.t} x={x(s.t)} y={MID - amp} width={barW} height={amp * 2} rx={barW / 2}
              fill={lit ? color : 'var(--text-faint)'} fillOpacity={lit ? 0.9 : 0.35} />
          )
        })}
      </svg>
      <Group justify="space-between" mt="4xs">
        <Text fz="2xs" c="var(--text-faint)">0s</Text>
        {prePunch && (
          <Text fz="xs" c="var(--accent)" fw={600}>
            Pause before the punch: {(prePunch.ms / 1000).toFixed(2)}s
          </Text>
        )}
        <Text fz="2xs" c="var(--text-faint)">{(total / 1000).toFixed(1)}s</Text>
      </Group>
    </div>
  )
}
