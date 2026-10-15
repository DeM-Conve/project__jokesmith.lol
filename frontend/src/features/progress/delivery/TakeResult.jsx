import { Badge, Group, Paper, RingProgress, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react'
import VolumeTimeline from '../charts/VolumeTimeline.jsx'
import { SILENT_TAKE, verdictFor } from '../data/coaching.js'
import { coachingFor } from './coachingFor.js'

const TONE = {
  good: { color: 'var(--good)', icon: CheckCircle2 },
  warn: { color: 'var(--warn)', icon: AlertTriangle },
  bad: { color: 'var(--bad)', icon: CircleAlert },
}

function Metric({ label, value, tone }) {
  return (
    <Stack gap={2} p="sm" style={{ background: 'var(--surface-2)', borderRadius: 'var(--mantine-radius-md)', borderTop: `3px solid ${TONE[tone]?.color ?? 'var(--border)'}` }}>
      <Text fz="2xs" fw={600} tt="uppercase" lts={1} c="var(--text-faint)">
        {label}
      </Text>
      <Text ff="var(--font-display)" fw={800} fz="xl" lh={1.1}>
        {value}
      </Text>
    </Stack>
  )
}

/** One analysed take: verdict, metrics, timeline with the pre-punch pause, playback and coaching. */
export default function TakeResult({ take }) {
  const { analysis, number, audioUrl, transcript, saved } = take
  const { metrics } = analysis

  if (analysis.silent) {
    return (
      <Paper p="lg" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Title order={2}>{SILENT_TAKE.title}</Title>
        <Text c="dimmed" mt="4xs">
          {SILENT_TAKE.body}
        </Text>
      </Paper>
    )
  }

  const notes = coachingFor(analysis, number)
  const verdict = verdictFor(metrics.score)
  const tones = Object.fromEntries(notes.map((n) => [n.key, n.tone]))
  const [first, ...rest] = notes

  return (
    <Paper p="lg" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Stack gap="lg">
        <Group gap="lg" wrap="nowrap" align="center">
          <RingProgress
            size={110}
            thickness={10}
            roundCaps
            rootColor="var(--surface-3)"
            sections={[{ value: metrics.score, color: 'amber' }]}
            label={
              <Stack gap={0} align="center">
                <Text ff="var(--font-display)" fw={800} fz="2xl" lh={1}>
                  {metrics.score}
                </Text>
                <Text fz="2xs" c="dimmed">
                  mic score
                </Text>
              </Stack>
            }
          />
          <Stack gap={4}>
            <Group gap="xs">
              <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)">
                Take {number}
              </Text>
              {saved && (
                <Badge size="sm" variant="light">
                  +{saved.xp} XP · Delivery
                </Badge>
              )}
            </Group>
            <Title order={2} fz="2xl">
              {verdict.title}
            </Title>
            <Text c="dimmed" fz="sm" maw={520}>
              {verdict.body}
            </Text>
          </Stack>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="xs">
          <Metric label="Pause before punch" value={`${(metrics.prePunchPauseMs / 1000).toFixed(2)}s`} tone={tones.pause} />
          <Metric label="Pace" value={`${Math.round(metrics.wordsPerMinute)} wpm${analysis.estimatedWords ? '*' : ''}`} tone={tones.pace} />
          <Metric label="Fillers" value={analysis.estimatedWords ? '–' : metrics.fillerCount} tone={tones.fillers} />
          <Metric label="Ended on punch" value={metrics.punchLast == null ? '–' : metrics.punchLast ? 'Yes' : 'No'} tone={tones.punch} />
          <Metric label="Energy" value={metrics.energyVariance.toFixed(2)} tone={tones.energy} />
        </SimpleGrid>

        <VolumeTimeline samples={take.samples} segments={analysis.segments} prePunch={analysis.prePunch} durationMs={metrics.durationMs} />

        <Group gap="md" align="center" wrap="wrap">
          {/* Local blob URL: the recording never leaves this browser. */}
          <audio controls src={audioUrl} style={{ height: 36, flex: '1 1 260px' }} aria-label={`Play take ${number}`} />
          {transcript && (
            <Text fz="sm" c="dimmed" fs="italic" style={{ flex: '2 1 300px' }}>
              "{transcript}"
            </Text>
          )}
        </Group>
        {analysis.estimatedWords && (
          <Text fz="xs" c="var(--text-faint)">
            * No live transcript in this browser, so pace is estimated from the written joke.
          </Text>
        )}

        <Stack gap="xs">
          <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)">
            Coach's notes
          </Text>
          {[first, ...rest].map((n, i) => {
            const { color, icon: Icon } = TONE[n.tone]
            const top = i === 0 && n.tone !== 'good'
            return (
              <Group
                key={n.key}
                gap="sm"
                wrap="nowrap"
                align="flex-start"
                p="sm"
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  background: top ? 'var(--surface-2)' : 'transparent',
                  border: `1px solid ${top ? 'var(--border-strong)' : 'transparent'}`,
                }}
              >
                <ThemeIcon variant="transparent" size="md" style={{ color }}>
                  <Icon size={18} />
                </ThemeIcon>
                <Stack gap={2} flex={1}>
                  <Group gap="xs">
                    <Text fw={700} fz="md">
                      {n.headline}
                    </Text>
                    {top && (
                      <Badge size="xs" variant="outline" color="gray">
                        Fix this next
                      </Badge>
                    )}
                  </Group>
                  <Text fz="sm" c="dimmed">
                    {n.body}
                  </Text>
                  {n.drill && (
                    <Text fz="sm">
                      <Text span fw={600} c="var(--accent)">
                        Next take:{' '}
                      </Text>
                      {n.drill}
                    </Text>
                  )}
                </Stack>
              </Group>
            )
          })}
        </Stack>
      </Stack>
    </Paper>
  )
}
