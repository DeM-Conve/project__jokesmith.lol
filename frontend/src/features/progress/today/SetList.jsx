import { Badge, Button, Group, Paper, Progress, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { BookOpen, Check, Dumbbell, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'

const KIND = {
  RIFF: { icon: Flame, tag: 'Opener' },
  DRILL: { icon: Dumbbell, tag: 'Drill' },
  LESSON: { icon: BookOpen, tag: 'Lesson' },
}

/**
 * Today's plan as a comic's set list: numbered, checked off as you go. The first
 * unfinished item gets the one primary button on the page (unless the page has its own).
 */
export default function SetList({ plan, newUser, primaryTaken = false }) {
  const done = plan.filter((p) => p.done).length
  const nextIndex = plan.findIndex((p) => !p.done)
  const allDone = nextIndex === -1

  return (
    <Paper p="lg" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Group justify="space-between" align="flex-end" mb="sm">
        <Stack gap={0}>
          <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)">
            {newUser ? 'Your first set' : "Tonight's set list"}
          </Text>
          <Title order={2}>{allDone ? 'Set complete. Take a bow.' : `${plan.length - done} to go`}</Title>
        </Stack>
        <Text fz="sm" c="dimmed">
          {done}/{plan.length} done
        </Text>
      </Group>
      <Progress value={(done / Math.max(1, plan.length)) * 100} size="sm" mb="md" aria-label="Plan progress" />

      <Stack gap="xs" component="ol" p={0} m={0} style={{ listStyle: 'none' }}>
        {plan.map((item, i) => {
          const { icon: Icon, tag } = KIND[item.kind] ?? KIND.DRILL
          const isNext = i === nextIndex
          return (
            <Group
              key={`${item.kind}-${item.route}`}
              component="li"
              wrap="nowrap"
              gap="md"
              p="sm"
              data-done={item.done || undefined}
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                background: isNext ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${isNext ? 'var(--border-strong)' : 'transparent'}`,
                opacity: item.done ? 0.62 : 1,
              }}
            >
              <ThemeIcon
                size={36}
                radius="xl"
                variant={item.done ? 'filled' : 'light'}
                color={item.done ? 'amber' : 'gray'}
                aria-label={item.done ? 'done' : 'to do'}
              >
                {item.done ? <Check size={18} /> : <Icon size={17} />}
              </ThemeIcon>
              <Stack gap={2} flex={1} miw={0}>
                <Group gap="2xs">
                  <Text fw={600} fz="md" td={item.done ? 'line-through' : undefined}>
                    {item.title}
                  </Text>
                  <Badge size="xs" variant="outline" color="gray" visibleFrom="xs">
                    {tag}
                  </Badge>
                </Group>
                <Text fz="sm" c="dimmed" lineClamp={2}>
                  {item.why}
                </Text>
              </Stack>
              {!item.done && (
                <Button
                  component={Link}
                  to={item.route}
                  variant={isNext && !primaryTaken ? 'filled' : 'default'}
                  size="xs"
                  style={{ flexShrink: 0 }}
                >
                  {isNext ? 'Start' : 'Go'}
                </Button>
              )}
            </Group>
          )
        })}
      </Stack>
    </Paper>
  )
}
