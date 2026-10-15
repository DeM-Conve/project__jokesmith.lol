import {
  Avatar, Badge, Box, Button, Collapse, Group, Kbd, Progress, SegmentedControl, SimpleGrid, Skeleton, Stack, Text,
  TextInput, Title, UnstyledButton,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Briefcase, Coffee, Heart, MessagesSquare, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import { useBanterReplyMutation, useBanterSetupQuery, useSelfRatingMutation, useStartBanterMutation } from './api.js'
import { Eyebrow, SetupLine, Stage } from './components/Stage.jsx'
import { useCountdown } from './lib/countdown.js'
import classes from './practice.module.css'

const PERSONA_ICON = { FRIEND: Coffee, COWORKER: Briefcase, DATE: Heart }

const RATINGS = [
  { key: 'BEAT_IT', label: 'Mine was better', hotkey: '1' },
  { key: 'MATCHED', label: 'About the same', hotkey: '2' },
  { key: 'NOT_YET', label: 'Theirs wins', hotkey: '3' },
]

function Setup({ setup, onStart, starting }) {
  const [persona, setPersona] = useState('FRIEND')
  const [seconds, setSeconds] = useState('10')
  return (
    <Stack gap="lg" maw={880}>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        {setup.personas.map((p) => {
          const Icon = PERSONA_ICON[p.key] ?? MessagesSquare
          return (
            <UnstyledButton
              key={p.key}
              className={classes.choice}
              data-active={persona === p.key}
              aria-pressed={persona === p.key}
              onClick={() => setPersona(p.key)}
              p="md"
            >
              <Group gap="sm" mb="2xs">
                <Icon size={18} color={persona === p.key ? 'var(--accent)' : 'var(--text-muted)'} />
                <Text ff="var(--font-display)" fw={800} fz="lg">
                  {p.label}
                </Text>
              </Group>
              <Text fz="sm" c="dimmed">
                {p.description}
              </Text>
            </UnstyledButton>
          )
        })}
      </SimpleGrid>
      <Group justify="space-between" align="flex-end">
        <Stack gap="4xs">
          <Text fz="sm" fw={600}>
            Seconds to reply
          </Text>
          <SegmentedControl
            aria-label="Seconds to reply"
            value={seconds}
            onChange={setSeconds}
            data={setup.timers.map((t) => ({ value: String(t), label: `${t}s` }))}
          />
        </Stack>
        <Button size="md" loading={starting} onClick={() => onStart(persona, Number(seconds))}>
          Start {setup.rounds} rounds
        </Button>
      </Group>
      <Text c="dimmed" fz="sm">
        They say something. You have a few seconds to say something better than &quot;haha yeah&quot;. Then compare
        yours with a few strong replies and see which move they used.
      </Text>
    </Stack>
  )
}

function Dots({ rounds, current }) {
  return (
    <Group gap="4xs" aria-label={`Round ${current} of ${rounds.length}`}>
      {rounds.map((r) => (
        <Box
          key={r.roundNo}
          w={r.roundNo === current ? 22 : 8}
          h={8}
          style={{
            borderRadius: 999,
            transition: 'width 200ms ease',
            background: r.result ? 'var(--accent)' : r.roundNo === current ? 'var(--text)' : 'var(--surface-3)',
          }}
        />
      ))}
    </Group>
  )
}

function PersonaLine({ persona, line, big }) {
  const Icon = PERSONA_ICON[persona] ?? MessagesSquare
  return (
    <Group align="flex-end" gap="sm" wrap="nowrap">
      <Avatar radius="xl" color="amber" variant="light">
        <Icon size={18} />
      </Avatar>
      <Box className={`${classes.bubble} ${classes.popIn}`} px="lg" py="md" maw={640}>
        <SetupLine fz={big ? '2xl' : 'lg'}>{line}</SetupLine>
      </Box>
    </Group>
  )
}

/** One live round: the line, a shrinking countdown, a single input. Enter (or the clock) sends. */
export function RoundPlay({ session, round, onReply, sending }) {
  const [draft, setDraft] = useState('')
  const draftRef = useRef('')
  const sentRef = useRef(false)
  const limitMs = session.secondsLimit * 1000
  const shownAt = useRef(Date.now())

  const send = useCallback(
    (text) => {
      if (sentRef.current) return
      sentRef.current = true
      onReply(round.roundNo, text, Date.now() - shownAt.current)
    },
    [onReply, round.roundNo],
  )
  const clock = useCountdown(limitMs, { onExpire: () => send(draftRef.current), tickMs: 100 })
  const { start } = clock
  useEffect(() => {
    shownAt.current = Date.now()
    start()
  }, [start])

  const secondsLeft = Math.ceil(clock.remaining / 1000)
  const urgent = clock.fraction <= 0.34
  return (
    <Stack gap="lg" maw={760}>
      <PersonaLine persona={session.persona} line={round.line} big />
      <Group gap="md" wrap="nowrap" align="center">
        <Text
          ff="var(--font-display)"
          fw={800}
          fz="4xl"
          lh={1}
          w={64}
          ta="center"
          c={urgent ? 'var(--mic)' : 'var(--accent)'}
          className={urgent ? classes.urgent : undefined}
          aria-label={`${secondsLeft} seconds left`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {secondsLeft}
        </Text>
        <Progress
          flex={1}
          value={clock.fraction * 100}
          color={urgent ? 'var(--mic)' : 'amber'}
          size="lg"
          radius="xl"
          transitionDuration={100}
          aria-label="Time left"
        />
      </Group>
      <TextInput
        autoFocus
        size="xl"
        value={draft}
        maxLength={300}
        aria-label="Your reply"
        placeholder="Say something…"
        disabled={sending}
        onChange={(e) => {
          setDraft(e.currentTarget.value)
          draftRef.current = e.currentTarget.value
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            clock.stop()
            send(draft)
          }
        }}
        rightSection={<Kbd size="xs">Enter</Kbd>}
        rightSectionWidth={72}
        styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 600 } }}
      />
    </Stack>
  )
}

function ScoreBar({ label, value }) {
  return (
    <Stack gap="4xs">
      <Group justify="space-between">
        <Text fz="xs" c="dimmed">
          {label}
        </Text>
        <Text fz="xs" fw={700}>
          {value}/5
        </Text>
      </Group>
      <Progress value={value * 20} size="sm" radius="xl" color={value >= 4 ? 'var(--good)' : value <= 2 ? 'gray' : 'amber'} />
    </Stack>
  )
}

/** Score, one coaching tip, then the example and "did yours beat it?". */
export function Feedback({ session, round, techniques, onRate, onNext, isLast }) {
  const r = round.result
  const rated = r.selfRating != null
  const techniqueOf = (k) => techniques.find((t) => t.key === k)

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement) return
      const pick = RATINGS.find((x) => x.hotkey === e.key)
      if (pick && !rated) onRate(round.roundNo, pick.key)
      if (e.key === 'Enter' && rated) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rated, onRate, onNext, round.roundNo])

  return (
    <Stack gap="lg" maw={760}>
      <PersonaLine persona={session.persona} line={round.line} />
      <Group justify="flex-end">
        <Box className={classes.bubbleMine} px="lg" py="sm" maw={560}>
          <Text fz="lg" fw={600} ff="var(--font-display)" c={r.reply ? 'var(--text)' : 'var(--text-faint)'}>
            {r.reply || '(silence)'}
          </Text>
        </Box>
      </Group>

      <Stage p="lg">
        <Group justify="space-between" align="flex-start" mb="md">
          <Stack gap="4xs">
            <Eyebrow>The room says</Eyebrow>
            <Text className={classes.popIn} ff="var(--font-display)" fw={800} fz="3xl" lh={1} c="var(--accent)">
              {r.verdict}
            </Text>
          </Stack>
          <Group gap="4xs">
            {r.timedOut && (
              <Badge color="red" variant="light">
                too slow
              </Badge>
            )}
            {r.spotted && <Badge variant="light">{techniqueOf(r.spotted)?.label ?? r.spotted}</Badge>}
            {r.saved && (
              <Badge variant="outline" color="gray">
                saved to bank
              </Badge>
            )}
          </Group>
        </Group>
        <SimpleGrid cols={3} spacing="md" mb="md">
          <ScoreBar label="Wit" value={r.wit} />
          <ScoreBar label="Surprise" value={r.surprise} />
          <ScoreBar label="Kindness" value={r.kindness} />
        </SimpleGrid>
        <Text fz="md">{r.tip}</Text>
      </Stage>

      {r.example && (
        <Stack gap="sm">
          <Group gap="2xs">
            <Eyebrow c="var(--accent)">A strong reply · {r.example.label}</Eyebrow>
          </Group>
          <Text fz="xl" ff="var(--font-display)" fw={700} pl="md" style={{ borderLeft: '3px solid var(--accent)' }}>
            {r.example.text}
          </Text>
          <Text fz="sm" c="dimmed">
            {techniqueOf(r.example.technique)?.description}
          </Text>
          {!rated ? (
            <Stack gap="2xs">
              <Text fw={600}>Did yours beat it?</Text>
              <Group gap="2xs">
                {RATINGS.map((x) => (
                  <Button key={x.key} variant="default" onClick={() => onRate(round.roundNo, x.key)} rightSection={<Kbd size="xs">{x.hotkey}</Kbd>}>
                    {x.label}
                  </Button>
                ))}
              </Group>
            </Stack>
          ) : (
            <Text fz="sm" c="dimmed">
              You said: <b>{RATINGS.find((x) => x.key === r.selfRating)?.label}</b>
              {r.selfRating !== 'NOT_YET' && ' · it’s in your joke bank.'}
            </Text>
          )}
          <Collapse expanded={rated}>
            <Stack gap="2xs" mt="xs">
              <Text fz="2xs" tt="uppercase" lts={1.2} c="var(--text-faint)">
                Other ways in
              </Text>
              {r.moreExamples.map((x) => (
                <Group key={x.text} gap="sm" wrap="nowrap" align="flex-start">
                  <Badge variant="outline" color="gray" w={124} style={{ flexShrink: 0 }}>
                    {x.label}
                  </Badge>
                  <Text fz="sm">{x.text}</Text>
                </Group>
              ))}
            </Stack>
          </Collapse>
        </Stack>
      )}

      <Group justify="flex-end">
        <Button onClick={onNext} disabled={!rated && Boolean(r.example)} rightSection={<Kbd size="xs">Enter</Kbd>}>
          {isLast ? 'See the night' : 'Next line'}
        </Button>
      </Group>
    </Stack>
  )
}

function Summary({ session, onAgain }) {
  const answered = session.rounds.filter((r) => r.result)
  const best = [...answered].sort((a, b) => b.result.total - a.result.total)[0]
  return (
    <Stack gap="lg" maw={760}>
      <Stage>
        <Eyebrow c="var(--accent)">Set complete</Eyebrow>
        <SetupLine fz="4xl" mt="2xs">
          +{session.xp ?? 0} xp
        </SetupLine>
        <Text c="dimmed" mt="2xs">
          {answered.filter((r) => !r.result.timedOut).length} of {session.rounds.length} in time
          {best?.result.reply ? ` · best line: “${best.result.reply}”` : ''}
        </Text>
      </Stage>
      <Stack gap="2xs">
        {session.rounds.map((r) => (
          <Group key={r.roundNo} justify="space-between" wrap="nowrap" p="sm" bg="var(--surface)" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
            <Stack gap={0} flex={1}>
              <Text fz="xs" c="dimmed">
                {r.line}
              </Text>
              <Text fw={600}>{r.result?.reply || '(silence)'}</Text>
            </Stack>
            <Badge variant={r.result?.total >= 11 ? 'filled' : 'light'}>{r.result?.verdict}</Badge>
          </Group>
        ))}
      </Stack>
      <Group justify="flex-end">
        <Button leftSection={<RotateCcw size={16} />} onClick={onAgain}>
          Another set
        </Button>
      </Group>
    </Stack>
  )
}

export default function BanterPage() {
  const { data: setup, isLoading } = useBanterSetupQuery()
  const start = useStartBanterMutation()
  const [session, setSession] = useState(null)
  const [current, setCurrent] = useState(1)
  const [showSummary, setShowSummary] = useState(false)
  const reply = useBanterReplyMutation(session?.id)
  const rate = useSelfRatingMutation(session?.id)

  const begin = (persona, secondsLimit) =>
    start.mutate(
      { persona, secondsLimit },
      {
        onSuccess: (s) => {
          setSession(s)
          setCurrent(1)
          setShowSummary(false)
        },
      },
    )

  const onReply = useCallback(
    (roundNo, text, responseMs) =>
      reply.mutate(
        { roundNo, reply: text, responseMs },
        {
          onSuccess: (s) => {
            setSession(s)
            if (s.complete) notifications.show({ title: `+${s.xp} xp · Real-time wit`, message: 'Set complete.', color: 'amber' })
          },
          onError: () => notifications.show({ title: 'That reply got lost', message: 'Try the next one.', color: 'red' }),
        },
      ),
    [reply],
  )

  const onRate = useCallback((roundNo, rating) => rate.mutate({ roundNo, rating }, { onSuccess: setSession }), [rate])

  const round = session?.rounds.find((r) => r.roundNo === current)
  const isLast = session && current === session.rounds.length
  const onNext = useCallback(() => {
    if (isLast) setShowSummary(true)
    else setCurrent((c) => c + 1)
  }, [isLast])

  return (
    <>
      <PageHeader
        eyebrow="Real-time wit"
        title="Banter Simulator"
        description="Wit in the wild is fast and kind. Five lines, a few seconds each: reply before the clock does."
        actions={
          session && (
            <Button variant="default" onClick={() => setSession(null)}>
              Change partner
            </Button>
          )
        }
      />
      {isLoading && <Skeleton h={220} radius="lg" />}
      {setup && !session && <Setup setup={setup} onStart={begin} starting={start.isPending} />}
      {session && !showSummary && round && (
        <Stack gap="lg">
          <Group justify="space-between" maw={760}>
            <Title order={2}>
              Round {current} of {session.rounds.length}
            </Title>
            <Dots rounds={session.rounds} current={current} />
          </Group>
          {round.result ? (
            <Feedback
              session={session}
              round={round}
              techniques={setup?.techniques ?? []}
              onRate={onRate}
              onNext={onNext}
              isLast={isLast}
            />
          ) : (
            <RoundPlay key={`${session.id}-${current}`} session={session} round={round} onReply={onReply} sending={reply.isPending} />
          )}
        </Stack>
      )}
      {session && showSummary && <Summary session={session} onAgain={() => setSession(null)} />}
    </>
  )
}
