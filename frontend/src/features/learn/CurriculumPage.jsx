import { Anchor, Badge, Box, Button, Group, RingProgress, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { ArrowRight, Check, Clock, Dumbbell, ScanSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import { useLearnProgressQuery } from './api.js'
import Stage, { Eyebrow } from './components/Stage.jsx'
import { LESSONS } from './content/lessons.js'
import classes from './learn.module.css'

const ACTS = [
  { from: 1, title: 'Act one: see the machine', blurb: 'What a joke is made of, and where the raw material comes from.' },
  { from: 4, title: 'Act two: the tools', blurb: 'Formulas, cutting and building. The craft writers use daily.' },
  { from: 7, title: 'Act three: live', blurb: 'Saying it out loud, in the moment, and getting better from feedback.' },
]

function LessonRow({ lesson, status, isNext }) {
  const done = Boolean(status)
  const nodeCls = [classes.node, done && classes.nodeDone, isNext && classes.nodeNext].filter(Boolean).join(' ')
  return (
    <Box pos="relative" data-testid={`lesson-${lesson.skill}`} data-done={done}>
      <div className={nodeCls} aria-hidden>
        {done ? <Check size={16} strokeWidth={3} /> : lesson.order}
      </div>
      <Link to={`/learn/${lesson.slug}`} style={{ textDecoration: 'none', color: 'inherit' }} aria-label={`Lesson ${lesson.order}: ${lesson.title}${done ? ' (completed)' : ''}`}>
        <div className={`${classes.lessonCard} ${isNext ? classes.lessonCardNext : ''}`}>
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
            <Stack gap="4xs">
              <Group gap="xs">
                <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c={isNext ? 'var(--accent)' : 'var(--text-faint)'}>
                  Lesson {lesson.order}
                  {isNext && ' · up next'}
                </Text>
              </Group>
              <Title order={2} ff="var(--font-display)">
                {lesson.title}
              </Title>
              <Text fz="md" c="dimmed">
                {lesson.tagline}
              </Text>
            </Stack>
            <Stack gap="4xs" align="flex-end" style={{ flexShrink: 0 }}>
              {done ? (
                <Badge color="amber" variant="light" leftSection={<Check size={12} />}>
                  Quiz {status.bestQuizCorrect}/{status.quizTotal}
                </Badge>
              ) : (
                <Badge color="gray" variant="default" leftSection={<Clock size={12} />}>
                  {lesson.minutes} min
                </Badge>
              )}
            </Stack>
          </Group>
        </div>
      </Link>
    </Box>
  )
}

export default function CurriculumPage() {
  const { data: progress, isError } = useLearnProgressQuery()
  const bySkill = Object.fromEntries((progress?.lessons ?? []).map((l) => [l.skill, l]))
  const completed = LESSONS.filter((l) => bySkill[l.skill]).length
  const next = LESSONS.find((l) => !bySkill[l.skill])
  const pct = Math.round((completed / LESSONS.length) * 100)

  return (
    <Stack gap="xl" maw={880}>
      <PageHeader
        eyebrow="Learn"
        title="The curriculum"
        description="Nine short lessons that take a joke apart and teach you to build your own. Each one ends with a quick check and a joke written by you."
      />

      <Stage>
        <Group gap="xl" wrap="wrap" align="center">
          <RingProgress
            size={120}
            thickness={10}
            roundCaps
            sections={[{ value: pct, color: 'amber' }]}
            rootColor="var(--surface-3)"
            label={
              <Stack gap={0} align="center">
                <Text ff="var(--font-display)" fw={800} fz="2xl" lh={1}>
                  {completed}/{LESSONS.length}
                </Text>
                <Text fz="2xs" c="dimmed" tt="uppercase" lts={1}>
                  lessons
                </Text>
              </Stack>
            }
          />
          <Stack gap="xs" flex={1} miw={240}>
            <Eyebrow>{next ? (completed === 0 ? 'Start here' : 'Up next') : 'Curriculum complete'}</Eyebrow>
            <Text ff="var(--font-display)" fw={800} fz="2xl" lh={1.15}>
              {next ? next.title : 'You know how a joke works. Now write a hundred.'}
            </Text>
            <Text c="dimmed" fz="md">
              {next ? next.tagline : 'Keep the reps going in the Formula Gym and the Daily Riff.'}
            </Text>
            <Group gap="xs" mt="2xs">
              <Button component={Link} to="/xray" variant="default" leftSection={<ScanSearch size={16} />}>
                Joke X-Ray{progress ? ` · ${progress.xrayCount}` : ''}
              </Button>
              <Button component={Link} to="/gym" variant="default" leftSection={<Dumbbell size={16} />}>
                Formula Gym{progress ? ` · ${progress.gymReps}` : ''}
              </Button>
              {next && (
                <Button component={Link} to={`/learn/${next.slug}`} rightSection={<ArrowRight size={16} />}>
                  {completed === 0 ? 'Start lesson 1' : `Start lesson ${next.order}`}
                </Button>
              )}
            </Group>
          </Stack>
        </Group>
      </Stage>

      {isError && (
        <Text c="dimmed" fz="sm">
          Couldn't load your progress, but every lesson is still open.
        </Text>
      )}

      {ACTS.map((act) => {
        const lessons = LESSONS.filter((l) => l.order >= act.from && l.order < act.from + 3)
        return (
          <Stack key={act.title} gap="md">
            <Stack gap="5xs">
              <Text ff="var(--font-display)" fw={800} fz="xl">
                {act.title}
              </Text>
              <Text fz="sm" c="dimmed">
                {act.blurb}
              </Text>
            </Stack>
            <Stack gap="sm" className={classes.path}>
              {lessons.map((l) => (
                <LessonRow key={l.skill} lesson={l} status={bySkill[l.skill]} isNext={next?.skill === l.skill} />
              ))}
            </Stack>
          </Stack>
        )
      })}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Text fz="sm" c="dimmed">
          The course draws on established craft: Greg Dean's joke structure, Judy Carter's attitudes, Joe Toplyn's
          handles and formulas, Gene Perret's practice discipline, and improv's "yes, and". All the example jokes are
          original.
        </Text>
        <Text fz="sm" c="dimmed">
          Every finished lesson is worth 50 XP on your{' '}
          <Anchor component={Link} to="/progress" c="var(--accent)">
            Funny Radar
          </Anchor>
          . Your "your turn" jokes land in the{' '}
          <Anchor component={Link} to="/notebook" c="var(--accent)">
            Bit Notebook
          </Anchor>
          .
        </Text>
      </SimpleGrid>
    </Stack>
  )
}
