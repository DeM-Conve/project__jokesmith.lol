import { Box, Group, Stack, Text } from '@mantine/core'
import { ArrowRight } from 'lucide-react'
import classes from '../workshop.module.css'
import { Eyebrow } from './JokeLines.jsx'

function Lines({ lines, strike }) {
  return (
    <Stack gap="5xs">
      {lines.setup ? (
        <Text fz="sm" c="dimmed" td={strike ? 'line-through' : undefined}>
          {lines.setup}
        </Text>
      ) : null}
      <Text fz="md" fw={600} ff="var(--font-display)" c={strike ? 'dimmed' : 'var(--text)'} td={strike ? 'line-through' : undefined}>
        {lines.punchline}
      </Text>
    </Stack>
  )
}

/** A curated before → after punch-up, labelled with the fix it shows. */
export default function ExampleCard({ example, title = 'Same fix, worked example' }) {
  if (!example) return null
  return (
    <Stack gap="2xs" p="sm" className={classes.example} data-testid="example">
      <Eyebrow>{title}</Eyebrow>
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Stack gap="4xs" flex={1}>
          <Text fz="2xs" c="var(--bad)" fw={600}>
            BEFORE
          </Text>
          <Lines lines={example.before} strike />
        </Stack>
        <Box mt="lg" style={{ flexShrink: 0 }}>
          <ArrowRight size={16} color="var(--text-faint)" />
        </Box>
        <Stack gap="4xs" flex={1}>
          <Text fz="2xs" c="var(--good)" fw={600}>
            AFTER
          </Text>
          <Lines lines={example.after} />
        </Stack>
      </Group>
      <Text fz="sm" c="dimmed">
        {example.note}
      </Text>
    </Stack>
  )
}
