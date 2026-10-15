import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { ArrowRight, BookOpen, Flame, Wand2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    icon: BookOpen,
    name: 'Learn',
    line: 'How a joke actually works',
    body: 'A joke is a machine: a setup builds an assumption, the punchline breaks it. Ten-minute lessons, one mechanism at a time.',
  },
  {
    icon: Flame,
    name: 'Practise',
    line: 'Short daily reps',
    body: 'A daily riff, association maps, timed banter. Funny is a muscle: little and often beats a big Sunday session.',
  },
  {
    icon: Wand2,
    name: 'Workshop',
    line: 'Make your jokes better',
    body: 'Punch up drafts, test them head-to-head in the Arena, then step up to the mic and nail the timing.',
  },
]

/** The first thing a brand-new user sees: the method in three steps, one clear way in. */
export default function OnboardingHero({ lessonRoute = '/learn' }) {
  return (
    <Paper
      p={{ base: 'lg', sm: 'xl' }}
      radius="lg"
      mb="xl"
      style={{
        background: 'radial-gradient(ellipse 70% 90% at 15% 0%, var(--accent-soft), transparent 70%), var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <Stack gap="lg">
        <Stack gap="2xs" maw={620}>
          <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--accent)">
            Welcome to the club
          </Text>
          <Title order={2} fz={{ base: '2xl', sm: '3xl' }} lh={1.1}>
            "Not funny" is just "not practised yet".
          </Title>
          <Text c="dimmed" fz="md">
            Nobody is born knowing where to put a punchline. Comedy writers use a handful of learnable tricks and a lot
            of reps. Here's how you'll get them:
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {STEPS.map(({ icon: Icon, name, line, body }, i) => (
            <Box key={name} p="md" style={{ background: 'var(--surface-2)', borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--border)' }}>
              <Group gap="xs" mb="xs" wrap="nowrap">
                <ThemeIcon variant="light" size="lg" radius="md">
                  <Icon size={18} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fz="2xs" c="var(--text-faint)" fw={600}>
                    STEP {i + 1}
                  </Text>
                  <Text ff="var(--font-display)" fw={700} fz="lg" lh={1.1}>
                    {name}
                  </Text>
                </Stack>
              </Group>
              <Text fw={600} fz="sm" mb="4xs">
                {line}
              </Text>
              <Text c="dimmed" fz="sm">
                {body}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Group gap="sm">
          <Button variant="default" component={Link} to="/riff">
            Warm up with today's riff
          </Button>
          <Button component={Link} to={lessonRoute} rightSection={<ArrowRight size={16} />} size="md">
            Start with lesson 1
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
