import { Alert, Anchor, Badge, Button, Group, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core'
import { ArrowLeft, ArrowRight, Check, Dumbbell, PenLine, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import { useCompleteLessonMutation, useLearnProgressQuery } from './api.js'
import Breakdown from './components/Breakdown.jsx'
import Checklist from './components/Checklist.jsx'
import Masters from './components/Masters.jsx'
import ModelAnswers from './components/ModelAnswers.jsx'
import Quiz from './components/Quiz.jsx'
import Rich from './components/Rich.jsx'
import Stage, { Eyebrow } from './components/Stage.jsx'
import { findLesson, LESSONS, nextLesson } from './content/lessons.js'
import classes from './learn.module.css'

const EYEBROWS = {
  ANATOMY: 'Anatomy',
  POINT_OF_VIEW: 'Point of view',
  ASSOCIATION: 'Association',
  FORMULAS: 'Formulas',
  ECONOMY: 'Economy',
  HEIGHTENING: 'Heightening',
  REAL_TIME_WIT: 'Real-time wit',
  DELIVERY: 'Delivery',
  FEEDBACK: 'Feedback',
}

function Section({ n, title, children }) {
  return (
    <Stack gap="md" component="section" aria-label={title}>
      <Group gap="sm" align="baseline">
        <Text ff="var(--font-display)" fw={800} fz="2xl" c="var(--accent)" lh={1}>
          {n}
        </Text>
        <Title order={2} fz="xl">
          {title}
        </Title>
      </Group>
      {children}
    </Stack>
  )
}

function YourTurn({ lesson, quiz, status }) {
  const [setup, setSetup] = useState('')
  const [punchline, setPunchline] = useState('')
  const complete = useCompleteLessonMutation(lesson.skill)
  const result = complete.data
  const next = nextLesson(lesson.skill)
  const ready = quiz && punchline.trim().length > 0

  const submit = () => {
    if (!ready || complete.isPending) return
    complete.mutate({
      quizCorrect: quiz.correct,
      quizTotal: quiz.total,
      setup: setup.trim(),
      punchline: punchline.trim(),
      formula: lesson.exercise.formula ?? null,
    })
  }

  if (result) {
    return (
      <Stack gap="lg">
        <Stage>
          <Stack gap="md">
            <Group gap="sm">
              <Badge size="lg" color="amber" leftSection={<Check size={14} />}>
                {result.firstCompletion ? `Lesson complete · +${result.xpAwarded} XP` : 'Lesson reviewed'}
              </Badge>
              <Text fz="sm" c="dimmed">
                Quiz {quiz.correct}/{quiz.total} · your joke is saved in the Bit Notebook
              </Text>
            </Group>
            <Stack gap="4xs">
              {setup.trim() && (
                <Text className={classes.jokeSetup} fz="xl">
                  {setup.trim()}
                </Text>
              )}
              <Text className={classes.jokePunch} fz="2xl">
                {punchline.trim()}
              </Text>
            </Stack>
          </Stack>
        </Stage>
        {result.checks?.length > 0 && (
          <Stack gap="sm">
            <Eyebrow>The craft checklist</Eyebrow>
            <Checklist checks={result.checks} />
          </Stack>
        )}
        <ModelAnswers answers={lesson.exercise.modelAnswers} title="Model answers" />
        <Group gap="xs">
          <Button component={Link} to={lesson.drill.to} variant="default" leftSection={<Dumbbell size={16} />}>
            Drill it: {lesson.drill.label}
          </Button>
          {next ? (
            <Button component={Link} to={`/learn/${next.slug}`} rightSection={<ArrowRight size={16} />}>
              Next: {next.title}
            </Button>
          ) : (
            <Button component={Link} to="/learn" rightSection={<ArrowRight size={16} />}>
              Back to the curriculum
            </Button>
          )}
        </Group>
      </Stack>
    )
  }

  return (
    <Stage>
      <Stack gap="md">
        <Eyebrow>Your turn · {lesson.exercise.premise}</Eyebrow>
        <Text fz="lg" fw={600} style={{ whiteSpace: 'pre-line' }}>
          {lesson.exercise.prompt}
        </Text>
        <Text fz="sm" c="dimmed">
          Hint: {lesson.exercise.hint}
        </Text>
        <TextInput
          label="Setup"
          placeholder="The part that builds the assumption"
          value={setup}
          onChange={(e) => setSetup(e.currentTarget.value)}
          size="md"
          styles={{ input: { fontFamily: 'var(--font-display)' } }}
        />
        <TextInput
          label="Punchline"
          placeholder="The turn, ending on the punch word"
          value={punchline}
          onChange={(e) => setPunchline(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          size="lg"
          styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 700 } }}
        />
        {complete.isError && (
          <Alert color="red" variant="light" icon={<TriangleAlert size={16} />}>
            Couldn't save that. Try again in a moment.
          </Alert>
        )}
        <Group justify="space-between" gap="xs">
          <Text fz="xs" c="dimmed">
            {!quiz
              ? 'Finish the quiz above first.'
              : status
                ? 'You finished this lesson before. Your best quiz score is kept.'
                : 'Finishing earns 50 XP.'}
          </Text>
          <Button onClick={submit} disabled={!ready} loading={complete.isPending} leftSection={<PenLine size={16} />}>
            Finish lesson
          </Button>
        </Group>
      </Stack>
    </Stage>
  )
}

export default function LessonPage() {
  const { skill } = useParams()
  const lesson = findLesson(skill)
  const { data: progress } = useLearnProgressQuery()
  const [quiz, setQuiz] = useState(null)

  if (!lesson) {
    return (
      <Stack gap="md">
        <PageHeader eyebrow="Learn" title="Lesson not found" description="That lesson isn't in the curriculum." />
        <Anchor component={Link} to="/learn" c="var(--accent)">
          Back to the curriculum
        </Anchor>
      </Stack>
    )
  }
  const status = progress?.lessons?.find((l) => l.skill === lesson.skill)

  return (
    <Stack gap="2xl" maw={880} key={lesson.skill}>
      <Stack gap="xs">
        <Anchor component={Link} to="/learn" c="dimmed" fz="sm">
          <Group gap="4xs" component="span">
            <ArrowLeft size={14} /> Curriculum · lesson {lesson.order} of {LESSONS.length}
          </Group>
        </Anchor>
        <PageHeader
          eyebrow={EYEBROWS[lesson.skill]}
          title={lesson.title}
          description={lesson.tagline}
          actions={
            status ? (
              <Badge color="amber" variant="light" leftSection={<Check size={12} />}>
                Completed
              </Badge>
            ) : (
              <Badge color="gray" variant="default">
                {lesson.minutes} min
              </Badge>
            )
          }
        />
      </Stack>

      <Section n="1" title="The idea">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {lesson.cards.map((card, i) => (
            <Stack key={card.title} gap="xs" className={classes.gridCard}>
              <Text fz="2xs" fw={600} c="var(--text-faint)">
                {String(i + 1).padStart(2, '0')}
              </Text>
              <Text ff="var(--font-display)" fw={700} fz="lg" lh={1.25}>
                {card.title}
              </Text>
              <Text fz="md" c="dimmed" lh={1.55}>
                <Rich>{card.body}</Rich>
              </Text>
            </Stack>
          ))}
        </SimpleGrid>
        <Text fz="xs" c="var(--text-faint)">
          Built on: {lesson.lineage}
        </Text>
      </Section>

      <Section n="2" title="Worked examples">
        <Text c="dimmed" fz="md">
          Real jokes from working comedians, taken apart. Before each step appears, guess what it'll say. Guessing
          first is what makes it stick.
        </Text>
        {lesson.examples.map((ex, i) => (
          <Breakdown key={i} example={ex} index={i} total={lesson.examples.length} />
        ))}
      </Section>

      {lesson.masters?.length > 0 && (
        <Section n="3" title="Watch the masters">
          <Text c="dimmed" fz="md">
            Official clips from working comedians. Watch for the skill this lesson trains, not just the laugh.
          </Text>
          <Masters masters={lesson.masters} />
        </Section>
      )}

      <Section n="4" title="Common mistakes">
        <Stack gap="sm">
          {lesson.mistakes.map((m) => (
            <Group key={m.mistake} gap="md" align="flex-start" wrap="nowrap" className={classes.gridCard}>
              <TriangleAlert size={18} color="var(--warn)" style={{ flexShrink: 0, marginTop: 2 }} />
              <Stack gap="4xs">
                <Text fw={600} fz="md">
                  {m.mistake}
                </Text>
                <Text fz="md" c="dimmed">
                  {m.fix}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      </Section>

      <Section n="5" title="Check yourself">
        <Stage>
          <Quiz questions={lesson.quiz} onDone={(correct, total) => setQuiz({ correct, total })} />
        </Stage>
      </Section>

      <Section n="6" title="Your turn">
        <YourTurn lesson={lesson} quiz={quiz} status={status} />
      </Section>

      <Group justify="space-between" className={classes.gridCard}>
        <Stack gap="4xs">
          <Eyebrow>Keep training</Eyebrow>
          <Text fz="md">{lesson.drill.why}</Text>
        </Stack>
        <Button component={Link} to={lesson.drill.to} variant="default" rightSection={<ArrowRight size={16} />}>
          {lesson.drill.label}
        </Button>
      </Group>
    </Stack>
  )
}
