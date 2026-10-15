import {
  Alert, Badge, Box, Button, Grid, Group, Kbd, Progress, SegmentedControl, SimpleGrid, Skeleton, Stack, Switch, Tabs, Text,
  Title, Tooltip, UnstyledButton,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { ArrowDown, Crown, PenLine, Swords, Trophy, User } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import {
  errorMessage, useArenaEntryMutation, useLeaderboardQuery, useMyArenaQuery, usePairQuery, useVoteMutation,
} from './api.js'
import JokeLines, { Eyebrow, Panel, SOURCE_LABEL } from './components/JokeLines.jsx'
import classes from './workshop.module.css'

/** How long the pick animation and rating reveal stay up before the next duel. */
export const REVEAL_MS = 900

function DuelCard({ joke, side, state, change, onPick, disabled }) {
  const delta = change ? change.after - change.before : null
  return (
    <UnstyledButton
      className={`${classes.duelCard} ${classes.duelIn}`}
      data-state={state}
      onClick={onPick}
      disabled={disabled}
      aria-label={`Pick the ${side} joke`}
      p="xl"
    >
      {delta != null ? (
        <Text className={classes.delta} fz="2xl" c={delta >= 0 ? 'var(--accent)' : 'var(--text-faint)'} data-testid={`delta-${side}`}>
          {delta >= 0 ? `+${delta}` : `−${Math.abs(delta)}`}
        </Text>
      ) : null}
      <JokeLines setup={joke.setup} punchline={joke.punchline} size="lg" pr={delta != null ? 'xl' : undefined} />
      <Group justify="space-between" mt="xl">
        <Kbd size="sm">{side === 'left' ? '←' : '→'}</Kbd>
        {change ? (
          <Text fz="sm" c="dimmed">
            rating {change.after}
          </Text>
        ) : (
          <Text fz="sm" c="var(--text-faint)">
            this one
          </Text>
        )}
      </Group>
    </UnstyledButton>
  )
}

function XpMeter({ votesCast, nextXpIn }) {
  const done = 10 - nextXpIn
  return (
    <Stack gap="4xs" miw={200}>
      <Group justify="space-between">
        <Text fz="xs" c="dimmed">
          {nextXpIn === 10 && votesCast > 0 ? '+10 Feedback XP earned!' : `${nextXpIn} more to +10 Feedback XP`}
        </Text>
        <Text fz="xs" c="var(--text-faint)">
          {votesCast} votes
        </Text>
      </Group>
      <Progress value={done * 10} size="sm" radius="xl" aria-label="Votes to next XP" />
    </Stack>
  )
}

function Duel() {
  const [mode, setMode] = useState('any')
  const samePrompt = mode === 'prompt'
  const { data: pair, isLoading, refetch, error } = usePairQuery(samePrompt)
  const vote = useVoteMutation()
  const [result, setResult] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const next = useCallback(async () => {
    await refetch()
    setResult(null)
  }, [refetch])

  const choose = useCallback(
    (side) => {
      if (!pair?.left || result || vote.isPending) return
      const winnerId = side === 'skip' ? null : pair[side].id
      vote.mutate(
        { leftId: pair.left.id, rightId: pair.right.id, winnerId },
        {
          onSuccess: (res) => {
            setResult({ side, res })
            if (res.xpAwarded) notifications.show({ color: 'amber', title: '+10 XP · Feedback', message: 'Ten more votes in. Good taste is a skill.' })
            timer.current = setTimeout(next, side === 'skip' ? REVEAL_MS / 2 : REVEAL_MS)
          },
          onError: (e) => {
            notifications.show({ color: 'red', message: errorMessage(e) })
            next()
          },
        },
      )
    },
    [pair, result, vote, next],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable="true"]')) return
      const side = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'skip' }[e.key]
      if (!side) return
      e.preventDefault()
      choose(side)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choose])

  const stateOf = (side) => {
    if (!result) return 'idle'
    if (result.side === 'skip') return 'skipped'
    return result.side === side ? 'won' : 'lost'
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <SegmentedControl
          value={mode}
          onChange={(v) => {
            setResult(null)
            setMode(v)
          }}
          data={[
            { value: 'any', label: 'Any jokes' },
            { value: 'prompt', label: 'Same prompt' },
          ]}
        />
        {pair ? <XpMeter votesCast={result?.res.votesCast ?? pair.votesCast} nextXpIn={result?.res.nextXpIn ?? pair.nextXpIn} /> : null}
      </Group>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Skeleton h={300} radius="lg" />
          <Skeleton h={300} radius="lg" />
        </SimpleGrid>
      ) : error ? (
        <Alert color="red">{errorMessage(error)}</Alert>
      ) : !pair.left ? (
        <Panel p="xl">
          <Stack gap="sm" align="flex-start">
            <Title order={2}>You&apos;ve judged every pair{samePrompt ? ' that shares a prompt' : ''}.</Title>
            <Text c="dimmed">
              The arena refills as people write. Add your own jokes so others can judge them, or switch to
              {samePrompt ? ' any jokes.' : ' same-prompt duels.'}
            </Text>
            <Group gap="2xs">
              <Button component={Link} to="/riff" variant="default">
                Write today&apos;s riff
              </Button>
              <Button component={Link} to="/notebook" variant="default">
                Open notebook
              </Button>
            </Group>
          </Stack>
        </Panel>
      ) : (
        <>
          <Stack gap="4xs" align="center">
            {pair.promptLabel ? (
              <Badge variant="light" size="lg">
                {pair.promptLabel}
              </Badge>
            ) : null}
            <Text ff="var(--font-display)" fw={800} fz="xl" ta="center">
              Which one made you smile more?
            </Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" key={`${pair.left.id}-${pair.right.id}`}>
            {['left', 'right'].map((side) => (
              <DuelCard
                key={side}
                side={side}
                joke={pair[side]}
                state={stateOf(side)}
                change={result?.res?.[side] ?? null}
                disabled={!!result || vote.isPending}
                onPick={() => choose(side)}
              />
            ))}
          </SimpleGrid>
          <Group justify="center" gap="md">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<ArrowDown size={16} />}
              onClick={() => choose('skip')}
              disabled={!!result || vote.isPending}
            >
              Skip (neither)
            </Button>
            <Text fz="xs" c="var(--text-faint)">
              <Kbd size="xs">←</Kbd> <Kbd size="xs">→</Kbd> pick · <Kbd size="xs">↓</Kbd> skip
            </Text>
          </Group>
        </>
      )}
    </Stack>
  )
}

function Leaderboard() {
  const [period, setPeriod] = useState('WEEK')
  const { data, isLoading } = useLeaderboardQuery(period)
  return (
    <Stack gap="xl">
      <SegmentedControl
        w="fit-content"
        value={period}
        onChange={setPeriod}
        data={[
          { value: 'WEEK', label: 'This week' },
          { value: 'ALL', label: 'All time' },
        ]}
      />
      {isLoading ? (
        <Skeleton h={300} radius="md" />
      ) : (
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="sm">
            <Group gap="2xs">
              <Trophy size={18} color="var(--accent)" />
              <Title order={2}>Top jokes</Title>
            </Group>
            {data.jokes.length === 0 ? (
              <Text c="dimmed">No votes {period === 'WEEK' ? 'this week' : 'yet'}. Go judge a few duels.</Text>
            ) : (
              data.jokes.map((j) => (
                <Panel key={j.jokeId} className={classes.popIn} style={j.mine ? { borderColor: 'var(--accent)' } : undefined}>
                  <Group align="flex-start" gap="md" wrap="nowrap">
                    <Text className={classes.rank} fz="2xl" c={j.rank <= 3 ? 'var(--accent)' : 'var(--text-faint)'}>
                      {j.rank}
                    </Text>
                    <Stack gap="2xs" flex={1}>
                      <JokeLines setup={j.setup} punchline={j.punchline} size="sm" />
                      <Text fz="xs" c="dimmed">
                        {j.mine ? 'yours' : j.house ? 'the house' : j.handle} · {j.wins}–{j.losses}
                      </Text>
                    </Stack>
                    <Stack gap={0} align="flex-end">
                      <Text ff="var(--font-display)" fw={800} fz="xl">
                        {j.rating}
                      </Text>
                      {j.gained != null ? (
                        <Text fz="xs" c="var(--good)">
                          +{j.gained} this week
                        </Text>
                      ) : (
                        <Text fz="xs" c="var(--text-faint)">
                          rating
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Panel>
              ))
            )}
          </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="sm">
            <Group gap="2xs">
              <Crown size={18} color="var(--accent)" />
              <Title order={2}>Top writers</Title>
            </Group>
            <Text fz="xs" c="dimmed">
              Average rating of a writer&apos;s jokes, pulled toward 1200 until they&apos;ve had a few duels.
            </Text>
            {data.writers.length === 0 ? (
              <Text c="dimmed">No ranked writers yet. Three duels on your jokes puts you on the board.</Text>
            ) : (
              data.writers.map((w) => (
                <Group key={w.rank} gap="sm" wrap="nowrap" p="2xs" style={w.me ? { background: 'var(--accent-soft)', borderRadius: 'var(--mantine-radius-sm)' } : undefined}>
                  <Text className={classes.rank} c={w.rank <= 3 ? 'var(--accent)' : 'var(--text-faint)'}>
                    {w.rank}
                  </Text>
                  <Text flex={1} fw={w.me ? 700 : 500} truncate>
                    {w.handle}
                    {w.me ? ' (you)' : ''}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {w.wins}–{w.losses}
                  </Text>
                  <Text fw={700}>{w.rating}</Text>
                </Group>
              ))
            )}
          </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  )
}

function MyJokes() {
  const { data, isLoading } = useMyArenaQuery()
  const entry = useArenaEntryMutation()
  if (isLoading) return <Skeleton h={300} radius="md" />
  return (
    <Stack gap="lg">
      <Group gap="2xl" wrap="wrap">
        <Stack gap={0}>
          <Eyebrow>Writer rating</Eyebrow>
          <Text ff="var(--font-display)" fw={800} fz="3xl" c="var(--accent)">
            {data.writerRating ?? '—'}
          </Text>
          <Text fz="xs" c="dimmed">
            {data.writerRating ? (data.writerRank ? `#${data.writerRank} of all writers` : 'unranked') : 'no duels yet'}
          </Text>
        </Stack>
        <Stack gap={0}>
          <Eyebrow>Votes you&apos;ve cast</Eyebrow>
          <Text ff="var(--font-display)" fw={800} fz="3xl">
            {data.votesCast}
          </Text>
          <Text fz="xs" c="dimmed">
            {data.nextXpIn} to next +10 XP
          </Text>
        </Stack>
      </Group>
      {data.jokes.length === 0 ? (
        <Panel p="xl">
          <Stack gap="sm" align="flex-start">
            <Text>You haven&apos;t written anything yet. Your riffs land here automatically; notebook drafts once you send them.</Text>
            <Button component={Link} to="/notebook" variant="default" leftSection={<PenLine size={16} />}>
              Write one
            </Button>
          </Stack>
        </Panel>
      ) : (
        data.jokes.map((j) => (
          <Panel key={j.jokeId}>
            <Group align="flex-start" gap="lg" wrap="nowrap">
              <Stack gap="2xs" flex={1}>
                <JokeLines setup={j.setup} punchline={j.punchline} size="sm" />
                <Text fz="xs" c="var(--text-faint)">
                  {SOURCE_LABEL[j.source]}
                </Text>
              </Stack>
              <Stack gap="2xs" w={180}>
                <Group justify="space-between">
                  <Text fz="xs" c="dimmed">
                    rating
                  </Text>
                  <Text fw={800} ff="var(--font-display)">
                    {j.rating}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text fz="xs" c="dimmed">
                    {j.votes} {j.votes === 1 ? 'vote' : 'votes'}
                  </Text>
                  <Text fz="xs" fw={600}>
                    {j.winRate == null ? 'no duels' : `${j.winRate}% wins`}
                  </Text>
                </Group>
                <Progress value={j.winRate ?? 0} size="xs" radius="xl" aria-label="Win rate" />
                <Tooltip label={j.inArena ? 'Strangers can vote on it' : 'Private: only you see it'}>
                  <Switch
                    size="xs"
                    label="In the Arena"
                    checked={j.inArena}
                    onChange={(e) => entry.mutate({ id: j.jokeId, inArena: e.currentTarget.checked })}
                  />
                </Tooltip>
              </Stack>
            </Group>
          </Panel>
        ))
      )}
    </Stack>
  )
}

export default function ArenaPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'duel'
  return (
    <Box>
      <PageHeader
        eyebrow="Feedback"
        title="Joke Arena"
        description="Two jokes, no names. Pick the one that made you smile. Every vote moves an Elo rating, and yours get judged too."
      />
      <Tabs value={tab} onChange={(v) => setParams(v === 'duel' ? {} : { tab: v })} keepMounted={false}>
        <Tabs.List mb="xl">
          <Tabs.Tab value="duel" leftSection={<Swords size={16} />}>
            Duel
          </Tabs.Tab>
          <Tabs.Tab value="leaders" leftSection={<Trophy size={16} />}>
            Leaderboard
          </Tabs.Tab>
          <Tabs.Tab value="mine" leftSection={<User size={16} />}>
            My jokes
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="duel">
          <Duel />
        </Tabs.Panel>
        <Tabs.Panel value="leaders">
          <Leaderboard />
        </Tabs.Panel>
        <Tabs.Panel value="mine">
          <MyJokes />
        </Tabs.Panel>
      </Tabs>
    </Box>
  )
}
