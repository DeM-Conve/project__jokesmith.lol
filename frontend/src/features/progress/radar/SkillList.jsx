import { Anchor, Group, Progress, Stack, Text } from '@mantine/core'
import { Link } from 'react-router-dom'

/** Skills by level with a link to where each one is trained. Same data as the radar, as a table-like list. */
export default function SkillList({ skills }) {
  const sorted = [...skills].sort((a, b) => b.level - a.level)
  return (
    <Stack gap="sm">
      {sorted.map((s) => (
        <Stack key={s.key} gap={4}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Anchor component={Link} to={s.route} fz="sm" fw={600} c="var(--text)" underline="hover">
              {s.label}
            </Anchor>
            <Text fz="xs" c="dimmed">
              lvl {s.level} · {s.reps} {s.reps === 1 ? 'rep' : 'reps'}
            </Text>
          </Group>
          <Progress value={s.level} size="sm" aria-label={`${s.label} level`} />
        </Stack>
      ))}
    </Stack>
  )
}
