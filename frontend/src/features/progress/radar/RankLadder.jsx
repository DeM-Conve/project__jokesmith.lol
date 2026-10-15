import { Group, Paper, Progress, Stack, Text, Title } from '@mantine/core'
import { Mic } from 'lucide-react'

/** The career ladder, from open mic to headliner, with the current rung lit. */
export default function RankLadder({ rank, ladder, totalXp }) {
  const toNext = rank.nextMinXp == null ? null : rank.nextMinXp - totalXp
  const pct = rank.nextMinXp == null ? 100 : ((totalXp - rank.minXp) / (rank.nextMinXp - rank.minXp)) * 100
  return (
    <Paper p="lg" radius="lg" h="100%" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)">
        Rank {rank.index + 1} of {rank.ranks}
      </Text>
      <Title order={2} fz="2xl" c="var(--accent)" mb="2xs">
        {rank.title}
      </Title>
      <Progress value={pct} size="md" mb="4xs" aria-label="Progress to next rank" />
      <Text fz="xs" c="dimmed" mb="md">
        {toNext == null ? "You're top of the bill." : `${toNext.toLocaleString()} XP to ${rank.nextTitle}`}
      </Text>
      <Stack gap={4} component="ol" p={0} m={0} style={{ listStyle: 'none' }}>
        {[...ladder].reverse().map((step) => {
          const i = ladder.indexOf(step)
          const current = i === rank.index
          const reached = i <= rank.index
          return (
            <Group key={step.title} component="li" gap="xs" wrap="nowrap" aria-current={current ? 'step' : undefined}>
              <Mic size={14} color={current ? 'var(--accent)' : reached ? 'var(--text-muted)' : 'var(--text-faint)'} />
              <Text fz="sm" fw={current ? 700 : 500} c={current ? 'var(--text)' : reached ? 'var(--text-muted)' : 'var(--text-faint)'} flex={1}>
                {step.title}
              </Text>
              <Text fz="2xs" c="var(--text-faint)">
                {step.minXp.toLocaleString()} XP
              </Text>
            </Group>
          )
        })}
      </Stack>
    </Paper>
  )
}
