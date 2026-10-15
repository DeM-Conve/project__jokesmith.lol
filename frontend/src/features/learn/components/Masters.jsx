import { Anchor, Group, List, SimpleGrid, Stack, Text } from '@mantine/core'
import { Check, Play } from 'lucide-react'
import { Eyebrow } from './Stage.jsx'
import classes from '../learn.module.css'

/**
 * "Watch the masters": official clips of working comedians, each with a line or two
 * quoted and what to notice for this lesson's skill.
 */
export default function Masters({ masters }) {
  if (!masters?.length) return null
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {masters.map((m) => (
        <Stack key={m.url} gap="sm" className={classes.gridCard} data-testid="master">
          <Stack gap="4xs">
            <Eyebrow c="var(--text-muted)">{m.comedian}</Eyebrow>
            <Text ff="var(--font-display)" fw={700} fz="lg" lh={1.25}>
              {m.title}
            </Text>
            {m.channel && (
              <Text fz="xs" c="var(--text-faint)">
                Official clip · {m.channel}
              </Text>
            )}
          </Stack>
          {m.lines?.map((line) => (
            <Stack key={line.text} gap="4xs">
              <Text className={classes.jokePunch} fz="md">
                “{line.text}”
              </Text>
              {line.translation && (
                <Text fz="sm" c="dimmed" fs="italic">
                  “{line.translation}”
                </Text>
              )}
            </Stack>
          ))}
          <List size="sm" spacing="4xs" icon={<Check size={14} color="var(--accent)" />}>
            {m.notice.map((n) => (
              <List.Item key={n}>{n}</List.Item>
            ))}
          </List>
          <Anchor href={m.url} target="_blank" rel="noopener noreferrer" c="var(--accent)" fz="sm" mt="auto">
            <Group gap="4xs" component="span">
              <Play size={14} /> Watch: {m.title}
            </Group>
          </Anchor>
        </Stack>
      ))}
    </SimpleGrid>
  )
}
