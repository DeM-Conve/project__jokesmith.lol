import { Paper, SimpleGrid, Stack, Text } from '@mantine/core'

function Tile({ label, value, note }) {
  return (
    <Paper p="md" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Stack gap={2}>
        <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)">
          {label}
        </Text>
        <Text ff="var(--font-display)" fw={800} fz="3xl" lh={1}>
          {value}
        </Text>
        {note && (
          <Text fz="xs" c="dimmed">
            {note}
          </Text>
        )}
      </Stack>
    </Paper>
  )
}

/** Headline numbers: XP, streak, reps, jokes written. */
export default function StatTiles({ radar }) {
  const { totalXp, streak, totalReps, jokesWritten } = radar
  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="lg">
      <Tile label="Total XP" value={totalXp.toLocaleString()} />
      <Tile label="Streak" value={`${streak.current}d`} note={`best ${streak.best} ${streak.best === 1 ? 'day' : 'days'}`} />
      <Tile label="Reps" value={totalReps.toLocaleString()} />
      <Tile label="Jokes written" value={jokesWritten.toLocaleString()} />
    </SimpleGrid>
  )
}
