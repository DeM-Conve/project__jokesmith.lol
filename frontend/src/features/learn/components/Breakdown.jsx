import { Button, Group, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import JokeLines from './JokeLines.jsx'
import Stage, { Eyebrow } from './Stage.jsx'
import classes from '../learn.module.css'

/**
 * A worked example: the joke first, then its parts revealed one step at a time,
 * so the reader can guess each step before seeing it.
 */
export default function Breakdown({ example, index, total }) {
  const [shown, setShown] = useState(0)
  const steps = example.steps
  return (
    <Stage>
      <Stack gap="lg">
        <Group justify="space-between">
          <Eyebrow>
            Worked example {index + 1} of {total}
          </Eyebrow>
          <Text fz="xs" c="dimmed">
            {shown}/{steps.length} steps
          </Text>
        </Group>
        <JokeLines setup={example.setup} punchline={example.punchline} punchWord={shown >= steps.length ? example.punchWord : null} />
        {shown > 0 && (
          <Stack gap={0} className={classes.steps}>
            {steps.slice(0, shown).map((s) => (
              <div key={s.label} className={classes.step}>
                <Text fz="2xs" fw={600} tt="uppercase" lts={1} c="var(--accent)">
                  {s.label}
                </Text>
                <Text fz="md">{s.text}</Text>
              </div>
            ))}
          </Stack>
        )}
        {shown < steps.length && (
          <Group gap="xs">
            <Button variant="default" onClick={() => setShown(shown + 1)}>
              {shown === 0 ? `Guess first, then show: ${steps[0].label.toLowerCase()}` : `Next: ${steps[shown].label.toLowerCase()}`}
            </Button>
            <Button variant="subtle" color="gray" onClick={() => setShown(steps.length)}>
              Show all
            </Button>
          </Group>
        )}
      </Stack>
    </Stage>
  )
}
