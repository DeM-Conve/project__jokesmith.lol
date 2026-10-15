import { Group, Paper, Progress, RingProgress, SimpleGrid, Stack, Text } from '@mantine/core'
import { Flame, Trophy } from 'lucide-react'

export function streakLine({ current, activeToday, best }) {
  if (current === 0) return best > 0 ? `Your best was ${best} days. Today is day one of the next one.` : 'One rep today starts your streak.'
  if (!activeToday) return `${current} ${current === 1 ? 'day' : 'days'} and counting. One rep before midnight keeps it alive.`
  if (current >= best && current > 1) return 'Your longest streak yet. Keep it rolling.'
  return 'Today counts. The streak is safe until tomorrow.'
}

function goalLine(xp, goal) {
  if (xp >= goal) return 'Daily goal smashed.'
  if (xp === 0) return 'Your first rep is the hardest. It gets easy after that.'
  return `${goal - xp} XP to today's goal.`
}

function Card({ children }) {
  return (
    <Paper p="lg" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {children}
    </Paper>
  )
}

/** Streak, today's XP vs goal, and rank: the three numbers that keep you coming back. */
export default function TodayStats({ today }) {
  const { streak, todayXp, dailyGoal, totalXp, rank } = today
  const pct = Math.min(100, (todayXp / dailyGoal) * 100)
  const toNext = rank.nextMinXp == null ? null : rank.nextMinXp - totalXp
  const rankPct = rank.nextMinXp == null ? 100 : ((totalXp - rank.minXp) / (rank.nextMinXp - rank.minXp)) * 100

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
      <Card>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <Flame size={28} color={streak.activeToday ? 'var(--accent)' : 'var(--text-faint)'} fill={streak.activeToday ? 'var(--accent)' : 'none'} />
          <Stack gap={2}>
            <Text ff="var(--font-display)" fw={800} fz="3xl" lh={1}>
              {streak.current}
              <Text span fz="md" fw={500} c="dimmed" ff="var(--mantine-font-family)">
                {' '}day streak
              </Text>
            </Text>
            <Text fz="sm" c="dimmed">
              {streakLine(streak)}
            </Text>
          </Stack>
        </Group>
      </Card>

      <Card>
        <Group gap="md" wrap="nowrap">
          <RingProgress
            size={76}
            thickness={8}
            roundCaps
            sections={[{ value: pct, color: 'amber' }]}
            rootColor="var(--surface-3)"
            label={
              <Text ta="center" fz="xs" fw={700}>
                {Math.round(pct)}%
              </Text>
            }
          />
          <Stack gap={2}>
            <Text ff="var(--font-display)" fw={800} fz="2xl" lh={1}>
              {todayXp}
              <Text span fz="md" fw={500} c="dimmed" ff="var(--mantine-font-family)">
                {' '}/ {dailyGoal} XP today
              </Text>
            </Text>
            <Text fz="sm" c="dimmed">
              {goalLine(todayXp, dailyGoal)}
            </Text>
          </Stack>
        </Group>
      </Card>

      <Card>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <Trophy size={26} color="var(--accent)" />
          <Stack gap={4} flex={1}>
            <Text ff="var(--font-display)" fw={700} fz="lg" lh={1.1}>
              {rank.title}
            </Text>
            <Progress value={rankPct} size="sm" aria-label="Progress to next rank" />
            <Text fz="xs" c="dimmed">
              {toNext == null ? 'Top of the bill. Nowhere left to climb but higher.' : `${toNext} XP to ${rank.nextTitle}`}
            </Text>
          </Stack>
        </Group>
      </Card>
    </SimpleGrid>
  )
}
