import { Badge, Button, Paper, Stack, Text } from '@mantine/core'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import JokeLines from './JokeLines.jsx'
import { FORMULA_LABELS } from '../lib/words.js'

/** Curated model answers, hidden until the user asks (they've already tried). */
export default function ModelAnswers({ answers, premises, title = 'How a pro might write it' }) {
  const [open, setOpen] = useState(false)
  if (!answers?.length) return null
  if (!open) {
    return (
      <Button variant="default" leftSection={<Eye size={16} />} onClick={() => setOpen(true)}>
        Reveal model answers ({answers.length})
      </Button>
    )
  }
  return (
    <Stack gap="sm">
      <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--accent)">
        {title}
      </Text>
      {answers.map((a, i) => (
        <Paper key={i} p="md" radius="md" bg="var(--surface-2)" withBorder style={{ borderColor: 'var(--border)' }}>
          <Stack gap="xs">
            {(a.formula || a.premiseId) && (
              <Badge variant="light" color="gray" size="sm">
                {[a.formula && FORMULA_LABELS[a.formula], premises?.[a.premiseId]].filter(Boolean).join(' · ')}
              </Badge>
            )}
            <JokeLines setup={a.setup} punchline={a.punchline} size="sm" />
            {a.note && (
              <Text fz="sm" c="dimmed">
                {a.note}
              </Text>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
