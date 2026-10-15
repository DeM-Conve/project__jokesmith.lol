import {
  ActionIcon, Alert, Badge, Box, Button, Drawer, Group, Kbd, Progress, ScrollArea, SegmentedControl, Skeleton, Stack,
  Text, TextInput, ThemeIcon, Title, UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Archive, Check, Crown, Flame, Sparkles, Users, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import {
  usePickBestMutation, useRiffArchiveQuery, useRiffDayQuery, useRiffPicksQuery, useSubmitRiffMutation,
} from './api.js'
import { Eyebrow, SetupLine, Stage } from './components/Stage.jsx'
import Timer from './components/Timer.jsx'
import { useCountdown } from './lib/countdown.js'
import { localIsoDate, nudgeFor, RIFF_GOAL, riffXp } from './lib/riff.js'
import classes from './practice.module.css'

const SKILL_LABEL = { REAL_TIME_WIT: 'Real-time wit', HEIGHTENING: 'Heightening' }

function prettyDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

/** The live, timed riff: type a punchline, Enter, again, until the clock runs out. */
export function RiffSession({ setup, durationMs, onFinish, onCancel, submitting }) {
  const [lines, setLines] = useState([])
  const [draft, setDraft] = useState('')
  const linesRef = useRef(lines)
  linesRef.current = lines
  const inputRef = useRef(null)

  const finish = useCallback(
    (elapsedMs) => onFinish(linesRef.current, Math.round(elapsedMs / 1000)),
    [onFinish],
  )
  const clock = useCountdown(durationMs, { onExpire: () => finish(durationMs) })
  const { start } = clock

  useEffect(() => {
    start()
    inputRef.current?.focus()
  }, [start])

  const add = () => {
    const text = draft.trim()
    if (!text) return
    setLines((l) => [...l, text])
    setDraft('')
  }

  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if ((e.metaKey || e.ctrlKey) && (lines.length > 0 || draft.trim())) {
      const all = draft.trim() ? [...lines, draft.trim()] : lines
      linesRef.current = all
      clock.stop()
      finish(clock.elapsed)
      return
    }
    add()
  }

  const done = () => {
    if (draft.trim()) linesRef.current = [...lines, draft.trim()]
    clock.stop()
    finish(clock.elapsed)
  }

  const count = lines.length
  return (
    <Stack gap="lg">
      <Stage>
        <Group justify="space-between" align="center" wrap="nowrap" gap="xl">
          <Stack gap="2xs" flex={1}>
            <Eyebrow>The setup</Eyebrow>
            <SetupLine fz="2xl">{setup}</SetupLine>
          </Stack>
          <Timer remaining={clock.remaining} fraction={clock.fraction} />
        </Group>
      </Stage>

      <Group justify="space-between" align="flex-end" wrap="nowrap">
        <Stack gap="4xs" flex={1}>
          <Text key={count} className={classes.popIn} fz="lg" fw={600} c={count === 3 ? 'var(--accent)' : 'var(--text)'}>
            {nudgeFor(count)}
          </Text>
          <Progress
            value={Math.min(100, (count / RIFF_GOAL) * 100)}
            color={count >= RIFF_GOAL ? 'var(--good)' : 'amber'}
            size="sm"
            radius="xl"
            aria-label="Progress to goal"
          />
        </Stack>
        <Stack gap={0} align="flex-end" miw={96}>
          <Text key={count} className={classes.bump} ff="var(--font-display)" fw={800} fz="4xl" lh={1} data-testid="riff-count">
            {count}
          </Text>
          <Text fz="xs" c="dimmed">
            of {RIFF_GOAL} punchlines
          </Text>
        </Stack>
      </Group>

      <TextInput
        ref={inputRef}
        size="xl"
        radius="md"
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        placeholder={count === 0 ? 'Your first punchline…' : 'Next one…'}
        aria-label="Punchline"
        maxLength={500}
        rightSection={<Kbd size="xs">Enter</Kbd>}
        rightSectionWidth={72}
        styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 600 } }}
      />

      <Group justify="space-between">
        <Text fz="xs" c="var(--text-faint)">
          <Kbd size="xs">Enter</Kbd> adds · <Kbd size="xs">Ctrl</Kbd>+<Kbd size="xs">Enter</Kbd> finishes
        </Text>
        <Group gap="2xs">
          <Button variant="subtle" color="gray" onClick={onCancel}>
            Bail
          </Button>
          <Button onClick={done} loading={submitting} disabled={count === 0 && !draft.trim()}>
            I&apos;m done
          </Button>
        </Group>
      </Group>

      <Stack gap="2xs">
        {[...lines].reverse().map((text, i) => {
          const n = count - i
          return (
            <Group key={n} className={classes.popIn} gap="sm" wrap="nowrap" p="sm" bg="var(--surface)" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--border)' }}>
              <Text ff="var(--font-display)" fw={800} c={n > 3 ? 'var(--accent)' : 'var(--text-faint)'} w={28}>
                {n}
              </Text>
              <Text flex={1} fz="md">
                {text}
              </Text>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={`Remove punchline ${n}`}
                onClick={() => setLines((l) => l.filter((_, j) => j !== n - 1))}
              >
                <X size={14} />
              </ActionIcon>
            </Group>
          )
        })}
      </Stack>
    </Stack>
  )
}

function PeerPicks({ date }) {
  const { data, isLoading } = useRiffPicksQuery(date)
  if (isLoading) return <Skeleton h={120} radius="md" />
  const others = (data ?? []).filter((p) => !p.mine)
  return (
    <Stack gap="sm">
      <Group gap="2xs">
        <Users size={16} color="var(--accent)" />
        <Title order={2}>The room&apos;s best tonight</Title>
      </Group>
      {others.length === 0 ? (
        <Text c="dimmed">You&apos;re first on stage. Come back later to see what everyone else picked.</Text>
      ) : (
        others.map((p, i) => (
          <Box key={`${p.handle}-${i}`} className={classes.popIn} p="md" bg="var(--surface)" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--border)' }}>
            <Text fz="lg" fw={600} ff="var(--font-display)">
              {p.punchline}
            </Text>
            <Text fz="xs" c="dimmed" mt="4xs">
              {p.handle}
            </Text>
          </Box>
        ))
      )}
    </Stack>
  )
}

/** After a riff: pick your best, compare with model punchlines, see everyone's picks. */
export function RiffResults({ day, lastResult }) {
  const pick = usePickBestMutation(day.date)
  const picked = day.bestJokeId != null
  return (
    <Stack gap="xl">
      {lastResult && (
        <Alert color="amber" variant="light" icon={<Flame size={18} />} className={classes.popIn}>
          <Text fw={600}>
            {lastResult.saved} punchlines · +{lastResult.xp} xp · {SKILL_LABEL[lastResult.skill] ?? lastResult.skill}
          </Text>
          <Text fz="sm" c="dimmed">
            {lastResult.saved >= RIFF_GOAL
              ? 'You pushed past the obvious. Look at your last few: that is where the good ones live.'
              : `Next time push for ${RIFF_GOAL}. The best jokes usually show up after number seven.`}
          </Text>
        </Alert>
      )}

      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={2}>{picked ? 'Your best' : 'Pick your best one'}</Title>
          <Text fz="xs" c="dimmed">
            {day.punchlines.length} written · {day.sessions} {day.sessions === 1 ? 'riff' : 'riffs'}
          </Text>
        </Group>
        {!picked && (
          <Text c="dimmed" fz="sm">
            Read them back like a stranger would. Which one would actually get a laugh?
          </Text>
        )}
        <Stack gap="2xs" role="radiogroup" aria-label="Your punchlines">
          {day.punchlines.map((p, i) => {
            const active = p.id === day.bestJokeId
            return (
              <UnstyledButton
                key={p.id}
                className={classes.choice}
                data-active={active}
                role="radio"
                aria-checked={active}
                onClick={() => pick.mutate(p.id)}
                disabled={pick.isPending}
                p="sm"
              >
                <Group gap="sm" wrap="nowrap">
                  <Text ff="var(--font-display)" fw={800} c={i >= 3 ? 'var(--accent)' : 'var(--text-faint)'} w={28}>
                    {i + 1}
                  </Text>
                  <Text flex={1}>{p.text}</Text>
                  {active && (
                    <ThemeIcon size="sm" radius="xl" variant="filled">
                      <Crown size={12} />
                    </ThemeIcon>
                  )}
                </Group>
              </UnstyledButton>
            )
          })}
        </Stack>
      </Stack>

      {day.modelPunchlines?.length > 0 && (
        <Stack gap="sm">
          <Group gap="2xs">
            <Sparkles size={16} color="var(--accent)" />
            <Title order={2}>How a pro went past the obvious</Title>
          </Group>
          {day.modelPunchlines.map((m) => (
            <Text key={m} pl="md" fz="md" style={{ borderLeft: '2px solid var(--accent)' }}>
              {m}
            </Text>
          ))}
        </Stack>
      )}

      {picked ? (
        <PeerPicks date={day.date} />
      ) : (
        <Text c="var(--text-faint)" fz="sm">
          <Users size={14} style={{ verticalAlign: 'middle' }} /> Pick your best to see everyone else&apos;s.
        </Text>
      )}
    </Stack>
  )
}

function ArchiveDrawer({ opened, onClose, today, onPick }) {
  const { data, isLoading } = useRiffArchiveQuery(today, opened)
  return (
    <Drawer opened={opened} onClose={onClose} title="Riff archive" position="right" size="md">
      <Text fz="sm" c="dimmed" mb="md">
        Missed a day? Every past setup is still open for a riff.
      </Text>
      {isLoading ? (
        <Skeleton h={200} />
      ) : (
        <ScrollArea.Autosize mah="calc(100vh - 140px)">
          <Stack gap="2xs">
            {(data ?? []).map((d) => (
              <UnstyledButton key={d.date} className={classes.choice} p="sm" onClick={() => onPick(d.date)}>
                <Group justify="space-between" wrap="nowrap" mb="4xs">
                  <Text fz="xs" c="dimmed">
                    #{d.number} · {prettyDate(d.date)}
                  </Text>
                  {d.riffed && (
                    <Badge size="xs" variant="light" leftSection={<Check size={10} />}>
                      riffed
                    </Badge>
                  )}
                </Group>
                <Text fz="sm" fw={500}>
                  {d.setup}
                </Text>
              </UnstyledButton>
            ))}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Drawer>
  )
}

const DURATIONS = [
  { value: '3', label: '3 min' },
  { value: '5', label: '5 min' },
  { value: '10', label: '10 min' },
]

export default function DailyRiffPage() {
  const [params, setParams] = useSearchParams()
  const today = localIsoDate()
  const date = params.get('date') || today
  const isToday = date === today
  const { data: day, isLoading, isError } = useRiffDayQuery(date)
  const submit = useSubmitRiffMutation(date)
  const [phase, setPhase] = useState({ date, name: 'ready' })
  const [minutes, setMinutes] = useState('5')
  const [lastResult, setLastResult] = useState(null)
  const [emptyFinish, setEmptyFinish] = useState(false)
  const [archiveOpen, archive] = useDisclosure(false)

  // A different day resets the screen (derived instead of an effect).
  const riffing = phase.date === date && phase.name === 'riffing'
  const shownResult = lastResult?.day.date === date ? lastResult : null

  const begin = useCallback(() => {
    setEmptyFinish(false)
    setPhase({ date, name: 'riffing' })
  }, [date])

  // Enter on the start screen begins the riff (keyboard-first).
  useEffect(() => {
    if (riffing || !day) return undefined
    const onKey = (e) => {
      if (e.key === 'Enter' && !e.repeat && e.target === document.body) begin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [riffing, day, begin])

  const finish = useCallback(
    (punchlines, secondsUsed) => {
      setPhase({ date, name: 'ready' })
      if (punchlines.length === 0) {
        setEmptyFinish(true)
        return
      }
      submit.mutate(
        { punchlines, secondsUsed },
        {
          onSuccess: (res) => {
            setLastResult(res)
            notifications.show({
              title: `+${res.xp} xp`,
              message: `${res.saved} punchlines in the bank.`,
              color: 'amber',
            })
          },
          onError: () =>
            notifications.show({ title: 'Couldn’t save that riff', message: 'Check your connection and try again.', color: 'red' }),
        },
      )
    },
    [date, submit],
  )

  const pickDay = (d) => {
    archive.close()
    setParams(d === today ? {} : { date: d })
  }

  const headerActions = (
    <>
      {!isToday && (
        <Button variant="subtle" color="gray" onClick={() => setParams({})}>
          Back to today
        </Button>
      )}
      <Button variant="default" leftSection={<Archive size={16} />} onClick={archive.open}>
        Archive
      </Button>
    </>
  )

  return (
    <>
      <PageHeader
        eyebrow="Real-time wit · Heightening"
        title="Daily Riff"
        description="One setup, the same for everyone today. Write punchline after punchline against the clock: the first three are obvious, numbers seven to ten are where the good ones hide."
        actions={headerActions}
      />
      <ArchiveDrawer opened={archiveOpen} onClose={archive.close} today={today} onPick={pickDay} />

      {isLoading && <Skeleton h={220} radius="lg" />}
      {isError && (
        <Alert color="red" variant="light">
          No riff for that day. <Button variant="subtle" color="gray" size="compact-sm" onClick={() => setParams({})}>Go to today</Button>
        </Alert>
      )}

      {day && riffing && (
        <RiffSession
          key={date}
          setup={day.setup}
          durationMs={Number(minutes) * 60_000}
          onFinish={finish}
          onCancel={() => setPhase({ date, name: 'ready' })}
          submitting={submit.isPending}
        />
      )}

      {day && !riffing && (
        <Stack gap="xl" maw={880}>
          <Stage>
            <Stack gap="md">
              <Group justify="space-between">
                <Eyebrow c="var(--accent)">
                  Riff #{day.number} · {isToday ? 'Today' : prettyDate(day.date)}
                </Eyebrow>
                {day.sessions > 0 && (
                  <Badge variant="light" leftSection={<Check size={12} />}>
                    riffed
                  </Badge>
                )}
              </Group>
              <SetupLine fz={{ base: '2xl', sm: '4xl' }}>{day.setup}</SetupLine>
              <Group justify="space-between" align="center" mt="sm">
                <Group gap="sm">
                  <SegmentedControl
                    data={DURATIONS}
                    value={minutes}
                    onChange={setMinutes}
                    aria-label="Riff length"
                    size="sm"
                  />
                  <Text fz="xs" c="dimmed">
                    Goal: {RIFF_GOAL} punchlines · up to {riffXp(RIFF_GOAL)} xp
                  </Text>
                </Group>
                <Button size="md" leftSection={<Flame size={18} />} onClick={begin} rightSection={<Kbd size="xs">Enter</Kbd>}>
                  {day.sessions > 0 ? 'Riff again' : 'Start riffing'}
                </Button>
              </Group>
            </Stack>
          </Stage>

          {emptyFinish && (
            <Alert color="gray" variant="light" withCloseButton onClose={() => setEmptyFinish(false)}>
              Time&apos;s up and the page is empty. A bad punchline still counts: next time type the first thing you think.
            </Alert>
          )}

          {day.sessions > 0 ? (
            <RiffResults day={day} lastResult={shownResult} />
          ) : (
            <Stack gap="2xs">
              <Title order={2}>How it works</Title>
              <Text c="dimmed">1. Hit start. The clock runs, the setup stays on screen.</Text>
              <Text c="dimmed">2. Type a punchline, press Enter, type the next. Don&apos;t edit, don&apos;t judge.</Text>
              <Text c="dimmed">3. When time&apos;s up, crown your best one and see what everyone else picked.</Text>
            </Stack>
          )}
        </Stack>
      )}
    </>
  )
}
