import {
  Alert, Badge, Box, Button, Grid, Group, Kbd, Skeleton, Stack, Stepper, Text, Textarea, Title, UnstyledButton,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { ArrowRight, Check, HelpCircle, Lightbulb, Swords, ThumbsUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import {
  errorMessage, useMovesQuery, usePunchUpSessionQuery, useRecentPunchUpsQuery, useRewriteMutation,
  useSendPunchUpToArenaMutation, useStartPunchUpMutation,
} from './api.js'
import ExampleCard from './components/ExampleCard.jsx'
import JokeLines, { Eyebrow, Panel, Stage } from './components/JokeLines.jsx'
import classes from './workshop.module.css'

const SEVERITY = { HIGH: { color: 'red', label: 'Big' }, MEDIUM: { color: 'yellow', label: 'Worth fixing' }, LOW: { color: 'gray', label: 'Polish' } }
const FIX_LABEL = {
  SPLIT_SETUP: 'Split setup from punchline',
  CUT_FILLER: 'Cut the filler',
  END_ON_PUNCH: 'End on a strong word',
  MOVE_PUNCH_LAST: 'Move the punch word last',
  HIDE_THE_TWIST: "Don't tip the twist",
  TRIM_SETUP: 'Trim the setup',
  SHORTEN_PUNCH: 'Shorten the punchline',
  GET_SPECIFIC: 'Get specific',
  RULE_OF_THREE: 'Use the rule of three',
}

const wc = (s) => (s.match(/[\p{L}\p{N}'’-]+/gu) ?? []).length

/** Setup + punchline inputs. Ctrl/Cmd+Enter submits. */
function JokeForm({ initial, onSubmit, submitting, submitLabel, autoFocus, children }) {
  const [setup, setSetup] = useState(initial?.setup ?? '')
  const [punchline, setPunchline] = useState(initial?.punchline ?? '')
  const ready = punchline.trim().length > 0
  const submit = () => ready && onSubmit({ setup: setup.trim(), punchline: punchline.trim() })
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    }
  }
  const words = wc(setup) + wc(punchline)
  return (
    <Stack gap="sm">
      <Textarea
        label="Setup"
        description="The expectation: what the audience should assume."
        value={setup}
        onChange={(e) => setSetup(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        autosize
        minRows={2}
        maxLength={500}
        autoFocus={autoFocus}
        placeholder="I joined a gym in January."
        styles={{ input: { fontSize: 'var(--mantine-font-size-lg)' } }}
      />
      <Textarea
        label="Punchline"
        description="The turn: the surprise should land on the last word."
        value={punchline}
        onChange={(e) => setPunchline(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        autosize
        minRows={2}
        maxLength={500}
        placeholder="So far I've lost forty dollars a month."
        styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--mantine-font-size-xl)' } }}
      />
      <Group justify="space-between">
        <Text fz="xs" c="var(--text-faint)">
          {words} words · <Kbd size="xs">Ctrl</Kbd>+<Kbd size="xs">Enter</Kbd> to submit
        </Text>
        <Group gap="2xs">
          {children}
          <Button onClick={submit} loading={submitting} disabled={!ready} rightSection={<ArrowRight size={16} />}>
            {submitLabel}
          </Button>
        </Group>
      </Group>
    </Stack>
  )
}

function FlagCard({ flag, index }) {
  const sev = SEVERITY[flag.severity] ?? SEVERITY.LOW
  return (
    <Panel className={`${classes.flag} ${classes.popIn}`} data-severity={flag.severity} style={{ animationDelay: `${index * 60}ms` }}>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} fz="md">
            {flag.label}
          </Text>
          <Badge size="xs" variant="light" color={sev.color}>
            {sev.label}
          </Badge>
        </Group>
        <Text fz="sm">{flag.finding}</Text>
        <Group gap="2xs" wrap="nowrap" align="flex-start">
          <HelpCircle size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
          <Text fz="sm" fw={600} c="var(--accent)">
            {flag.question}
          </Text>
        </Group>
        <ExampleCard example={flag.example} />
      </Stack>
    </Panel>
  )
}

function Stat({ label, value, sub, tone }) {
  return (
    <Stack gap={0} miw={88}>
      <Eyebrow>{label}</Eyebrow>
      <Text ff="var(--font-display)" fw={800} fz="2xl" lh={1.1} c={tone}>
        {value}
      </Text>
      {sub ? (
        <Text fz="xs" c="dimmed">
          {sub}
        </Text>
      ) : null}
    </Stack>
  )
}

function scoreTone(score) {
  if (score >= 85) return 'var(--good)'
  if (score >= 60) return 'var(--warn)'
  return 'var(--bad)'
}

function Metrics({ m }) {
  return (
    <Group gap="xl" wrap="wrap">
      <Stat label="Economy" value={m.score} sub="out of 100" tone={scoreTone(m.score)} />
      <Stat label="Words" value={m.words} sub={`${m.setupWords} setup · ${m.punchWords} punch`} />
      <Stat
        label="Punch word"
        value={m.punchWord ? `“${m.punchWord}”` : '—'}
        sub={m.punchWord ? (m.wordsAfterPunch === 0 ? 'last word' : `${m.wordsAfterPunch} words after it`) : null}
      />
      {m.cutTarget > 0 ? <Stat label="Cut" value={`~${m.cutTarget}`} sub="words to lose" tone="var(--warn)" /> : null}
    </Group>
  )
}

function marksFor(version) {
  const m = version.analysis.metrics
  const weak = version.analysis.flags.find((f) => f.fix === 'END_ON_PUNCH')?.words ?? []
  return { filler: m.fillers, weak, punch: m.punchWord ? [m.punchWord] : [] }
}

function DiffView({ diff }) {
  return (
    <Text fz="lg" ff="var(--font-display)" fw={600} lh={1.5} data-testid="diff">
      {diff.map((t, i) => {
        const cls = t.op === 'REMOVED' ? classes.diffRemoved : t.op === 'ADDED' ? classes.diffAdded : undefined
        return (
          <span key={i}>
            <span className={cls} data-op={t.op}>
              {t.text}
            </span>{' '}
          </span>
        )
      })}
    </Text>
  )
}

function Critique({ c }) {
  const delta = c.wordsAfter - c.wordsBefore
  return (
    <Stage p="lg" className={classes.popIn} data-testid="critique">
      <Stack gap="md">
        <Group gap="2xs">
          <Lightbulb size={18} color="var(--accent)" />
          <Title order={2}>{c.verdict}</Title>
        </Group>
        <Group gap="xl" wrap="wrap">
          <Stat
            label="Words"
            value={`${c.wordsBefore} → ${c.wordsAfter}`}
            sub={delta < 0 ? `${delta} words` : delta === 0 ? 'same length' : `+${delta} words`}
            tone={delta < 0 ? 'var(--good)' : delta > 0 ? 'var(--warn)' : undefined}
          />
          <Stat
            label="Punch word position"
            value={`${c.afterPunchBefore} → ${c.afterPunchAfter}`}
            sub="words after the punch word"
            tone={c.afterPunchAfter < c.afterPunchBefore ? 'var(--good)' : undefined}
          />
          <Stat
            label="Economy"
            value={`${c.scoreBefore} → ${c.scoreAfter}`}
            tone={c.scoreAfter > c.scoreBefore ? 'var(--good)' : c.scoreAfter < c.scoreBefore ? 'var(--bad)' : undefined}
          />
        </Group>
        <Stack gap="4xs">
          <Eyebrow>What changed</Eyebrow>
          <DiffView diff={c.diff} />
        </Stack>
        <Stack gap="4xs">
          {c.notes.map((n) => (
            <Text key={n} fz="sm">
              · {n}
            </Text>
          ))}
        </Stack>
        {(c.fixed.length > 0 || c.remaining.length > 0) && (
          <Group gap="2xs">
            {c.fixed.map((f) => (
              <Badge key={f} color="green" variant="light" leftSection={<Check size={12} />}>
                {FIX_LABEL[f]}
              </Badge>
            ))}
            {c.remaining.map((f) => (
              <Badge key={f} color="gray" variant="outline">
                still open: {FIX_LABEL[f]}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Stage>
  )
}

function MovesList({ id }) {
  const { data, isLoading, error } = useMovesQuery(id, true)
  if (isLoading) return <Skeleton h={160} radius="md" />
  if (error) return <Alert color="gray">{errorMessage(error)}</Alert>
  return (
    <Stack gap="sm" data-testid="moves">
      <Eyebrow c="var(--accent)">Rewrite moves: you apply them</Eyebrow>
      {data.moves.map((m, i) => (
        <Panel key={`${m.fix}-${i}`} className={classes.popIn} style={{ animationDelay: `${i * 60}ms` }}>
          <Group align="flex-start" gap="sm" wrap="nowrap">
            <Text className={classes.rank} c="var(--accent)" fz="xl">
              {i + 1}
            </Text>
            <Stack gap="2xs" flex={1}>
              <Text fz="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
                {m.label}
              </Text>
              <Text fz="md" fw={600}>
                {m.instruction}
              </Text>
              {m.example ? <ExampleCard example={m.example} title="Like this" /> : null}
            </Stack>
          </Group>
        </Panel>
      ))}
    </Stack>
  )
}

function SessionView({ id }) {
  const { data: s, isLoading, error } = usePunchUpSessionQuery(id)
  const rewrite = useRewriteMutation(id)
  const toArena = useSendPunchUpToArenaMutation(id)
  const [showMoves, setShowMoves] = useState(false)

  if (isLoading) return <Skeleton h={320} radius="lg" />
  if (error) return <Alert color="red">{errorMessage(error, 'Session not found')}</Alert>

  const versions = s.versions
  const latest = versions[versions.length - 1]
  const a = latest.analysis
  const step = s.stage === 'DIAGNOSED' ? 1 : showMoves ? 3 : 2

  const submitRewrite = (body) =>
    rewrite.mutate(body, {
      onSuccess: (next) => {
        setShowMoves(false)
        if (next.versions.length === 2) {
          notifications.show({ color: 'amber', title: '+25 XP · Economy', message: 'First rewrite done. Now read the critique.' })
        }
      },
      onError: (e) => notifications.show({ color: 'red', message: errorMessage(e) }),
    })

  return (
    <Stack gap="xl">
      <Stepper active={step} size="sm" iconSize={28} allowNextStepsSelect={false}>
        <Stepper.Step label="Diagnose" description="Answer the questions" />
        <Stepper.Step label="Rewrite" description="Your draft, your words" />
        <Stepper.Step label="Critique" description="Before vs after" />
        <Stepper.Step label="Moves" description="Optional next steps" />
      </Stepper>

      {s.critique ? <Critique c={s.critique} /> : null}

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="lg">
            <Stage>
              <Stack gap="md">
                <Group justify="space-between">
                  <Eyebrow>
                    {versions.length === 1 ? 'Your joke' : `Draft ${latest.number}`}
                  </Eyebrow>
                  {s.latestInArena ? (
                    <Badge variant="light" leftSection={<Swords size={12} />}>
                      In the Arena
                    </Badge>
                  ) : null}
                </Group>
                <JokeLines setup={latest.setup} punchline={latest.punchline} size="lg" marks={marksFor(latest)} />
                <Metrics m={a.metrics} />
              </Stack>
            </Stage>

            <Stack gap="2xs">
              <Title order={2}>{s.stage === 'DIAGNOSED' ? 'Your turn: rewrite it' : 'Another pass?'}</Title>
              <Text c="dimmed" fz="sm">
                {s.stage === 'DIAGNOSED'
                  ? 'Answer the questions on the right by rewriting. Change one thing or all of them.'
                  : 'Fix what is still open, or try a completely different ending.'}
              </Text>
            </Stack>
            <JokeForm
              key={versions.length}
              initial={latest}
              onSubmit={submitRewrite}
              submitting={rewrite.isPending}
              submitLabel="Submit rewrite"
            />

            <Panel>
              <Stack gap="sm">
                <Group justify="space-between" wrap="wrap">
                  <Stack gap={0}>
                    <Text fw={700}>Stuck?</Text>
                    <Text fz="sm" c="dimmed">
                      {s.movesUnlocked
                        ? 'Get concrete rewrite moves for your latest draft. You still write it.'
                        : 'Rewrite moves unlock after your first rewrite. Try it yourself first.'}
                    </Text>
                  </Stack>
                  <Group gap="2xs">
                    <Button
                      variant="default"
                      leftSection={<Swords size={16} />}
                      disabled={s.latestInArena}
                      loading={toArena.isPending}
                      onClick={() =>
                        toArena.mutate(undefined, {
                          onSuccess: () => notifications.show({ color: 'amber', message: 'Sent to the Arena. Strangers will judge it.' }),
                        })
                      }
                    >
                      {s.latestInArena ? 'In the Arena' : 'Send to Arena'}
                    </Button>
                    <Button variant="default" disabled={!s.movesUnlocked || showMoves} onClick={() => setShowMoves(true)}>
                      Show me rewrite moves
                    </Button>
                  </Group>
                </Group>
                {showMoves ? <MovesList id={id} /> : null}
              </Stack>
            </Panel>

            {versions.length > 1 ? (
              <Stack gap="2xs">
                <Eyebrow>Drafts</Eyebrow>
                {versions.map((v) => (
                  <Group key={v.jokeId} gap="sm" wrap="nowrap" align="flex-start">
                    <Badge variant="outline" color="gray" w={56}>
                      v{v.number}
                    </Badge>
                    <Text fz="sm" flex={1} c={v === latest ? 'var(--text)' : 'dimmed'}>
                      {v.setup} <b>{v.punchline}</b>
                    </Text>
                    <Text fz="sm" fw={700} c={scoreTone(v.analysis.metrics.score)}>
                      {v.analysis.metrics.score}
                    </Text>
                  </Group>
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={2}>The coach&apos;s questions</Title>
              <Badge variant="light" color={a.flags.length ? 'yellow' : 'green'}>
                {a.flags.length ? `${a.flags.length} to look at` : 'clean'}
              </Badge>
            </Group>
            {a.flags.length === 0 ? (
              <Alert color="green" variant="light" icon={<ThumbsUp size={16} />}>
                Nothing flagged. The real test is an audience: send it to the Arena.
              </Alert>
            ) : (
              a.flags.map((f, i) => <FlagCard key={`${f.fix}-${latest.number}`} flag={f} index={i} />)
            )}
            {a.strengths.length > 0 && (
              <Stack gap="4xs">
                <Eyebrow c="var(--good)">Already working</Eyebrow>
                {a.strengths.map((t) => (
                  <Group key={t} gap="2xs" wrap="nowrap">
                    <Check size={14} color="var(--good)" />
                    <Text fz="sm">{t}</Text>
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

function StartView({ onStart, starting }) {
  const { data: recent } = useRecentPunchUpsQuery()
  const [, setParams] = useSearchParams()
  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Stage>
          <Stack gap="md">
            <Eyebrow c="var(--accent)">Bring a joke</Eyebrow>
            <Text c="dimmed" fz="sm">
              Any joke, any state. The coach won&apos;t rewrite it for you: it points at the exact words, asks the questions, and
              shows a worked example of each fix. You do the rewriting.
            </Text>
            <JokeForm onSubmit={onStart} submitting={starting} submitLabel="Diagnose it" autoFocus />
          </Stack>
        </Stage>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Stack gap="lg">
          <Stack gap="2xs">
            <Title order={2}>How a punch-up works</Title>
            {[
              ['1', 'Diagnose', 'Flags on the exact words: filler, a buried punch word, a setup that gives the twist away.'],
              ['2', 'Rewrite', 'You answer the questions by rewriting. Every draft is saved to your notebook.'],
              ['3', 'Critique', 'Before vs after: word count, where the punch word sits, what got fixed.'],
              ['4', 'Moves', 'Still stuck? Concrete moves to try, then send it to the Arena for real votes.'],
            ].map(([n, t, d]) => (
              <Group key={n} gap="sm" wrap="nowrap" align="flex-start">
                <Text className={classes.rank} c="var(--accent)" fz="lg">
                  {n}
                </Text>
                <Stack gap={0}>
                  <Text fw={700}>{t}</Text>
                  <Text fz="sm" c="dimmed">
                    {d}
                  </Text>
                </Stack>
              </Group>
            ))}
          </Stack>
          {recent?.length ? (
            <Stack gap="2xs">
              <Eyebrow>Recent punch-ups</Eyebrow>
              {recent.map((r) => (
                <UnstyledButton key={r.id} onClick={() => setParams({ session: String(r.id) })}>
                  <Panel p="sm">
                    <Group justify="space-between" wrap="nowrap" gap="sm">
                      <Text fz="sm" lineClamp={2} flex={1}>
                        {r.setup} <b>{r.punchline}</b>
                      </Text>
                      <Text fz="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {r.firstScore} → <b style={{ color: scoreTone(r.latestScore) }}>{r.latestScore}</b>
                      </Text>
                    </Group>
                  </Panel>
                </UnstyledButton>
              ))}
            </Stack>
          ) : (
            <Text fz="sm" c="dimmed">
              No joke handy? Pick one from your <Link to="/notebook" style={{ color: 'var(--accent)' }}>Bit Notebook</Link>.
            </Text>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  )
}

export default function PunchUpPage() {
  const [params, setParams] = useSearchParams()
  const sessionId = params.get('session') ? Number(params.get('session')) : null
  const fromJoke = params.get('joke') ? Number(params.get('joke')) : null
  const start = useStartPunchUpMutation()
  const startedFor = useRef(null)
  const { mutate } = start

  useEffect(() => {
    if (!fromJoke || sessionId || startedFor.current === fromJoke) return
    startedFor.current = fromJoke
    mutate(
      { fromJokeId: fromJoke },
      {
        onSuccess: (s) => setParams({ session: String(s.id) }, { replace: true }),
        onError: (e) => notifications.show({ color: 'red', message: errorMessage(e) }),
      },
    )
  }, [fromJoke, sessionId, mutate, setParams])

  const begin = (body) =>
    start.mutate(body, {
      onSuccess: (s) => setParams({ session: String(s.id) }),
      onError: (e) => notifications.show({ color: 'red', message: errorMessage(e) }),
    })

  return (
    <Box>
      <PageHeader
        eyebrow="Economy · Formulas"
        title="Punch-Up Coach"
        description="Make every word earn its place and land the laugh on the last one."
        actions={
          sessionId ? (
            <Button variant="subtle" color="gray" onClick={() => setParams({})}>
              New joke
            </Button>
          ) : null
        }
      />
      {sessionId ? (
        <SessionView id={sessionId} />
      ) : fromJoke ? (
        <Skeleton h={320} radius="lg" />
      ) : (
        <StartView onStart={begin} starting={start.isPending} />
      )}
    </Box>
  )
}
