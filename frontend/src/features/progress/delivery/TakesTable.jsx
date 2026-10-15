import { ActionIcon, Badge, Paper, Table, Text, Title } from '@mantine/core'
import { Eye } from 'lucide-react'

const yesNo = (v) => (v == null ? '–' : v ? 'Yes' : 'No')

/** Compare this session's takes side by side; pick one to inspect and replay. */
export default function TakesTable({ takes, selected, onSelect }) {
  const scored = takes.filter((t) => !t.analysis.silent)
  const best = scored.length > 1 ? scored.reduce((a, b) => (b.analysis.metrics.score > a.analysis.metrics.score ? b : a)) : null
  return (
    <Paper p="lg" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Title order={2} mb="4xs">
        This session's takes
      </Title>
      <Text fz="sm" c="dimmed" mb="sm">
        Same joke, different takes: watch the pause and the pace change as you warm up.
      </Text>
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="xs" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Take</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Pause</Table.Th>
              <Table.Th>Pace</Table.Th>
              <Table.Th>Fillers</Table.Th>
              <Table.Th>Punch last</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[...takes].reverse().map((t) => {
              const m = t.analysis.metrics
              return (
                <Table.Tr key={t.number} bg={t.number === selected ? 'var(--surface-2)' : undefined}>
                  <Table.Td>
                    <Text fz="sm" fw={600}>
                      #{t.number}{' '}
                      {best?.number === t.number && (
                        <Badge size="xs" variant="light" ml="4xs">
                          best
                        </Badge>
                      )}
                    </Text>
                    <Text fz="xs" c="dimmed" lineClamp={1} maw={200}>
                      {t.jokeText}
                    </Text>
                  </Table.Td>
                  <Table.Td>{t.analysis.silent ? '–' : m.score}</Table.Td>
                  <Table.Td>{(m.prePunchPauseMs / 1000).toFixed(2)}s</Table.Td>
                  <Table.Td>{Math.round(m.wordsPerMinute)} wpm</Table.Td>
                  <Table.Td>{t.analysis.estimatedWords ? '–' : m.fillerCount}</Table.Td>
                  <Table.Td>{yesNo(m.punchLast)}</Table.Td>
                  <Table.Td>
                    <ActionIcon variant="subtle" color="gray" aria-label={`Show take ${t.number}`} onClick={() => onSelect(t.number)}>
                      <Eye size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  )
}
