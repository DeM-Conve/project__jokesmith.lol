import {
  Alert, Badge, Box, Button, Chip, Group, Kbd, Paper, SimpleGrid, Skeleton, Stack, Text, Textarea, TextInput, Title,
  UnstyledButton,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Dices, Lightbulb, Network, Plus, Shuffle, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import {
  useAddItemMutation, useCollisionJokeMutation, useShuffleMutation, useStartMapMutation, useTopicsQuery,
} from './api.js'
import { Eyebrow, SetupLine, Stage } from './components/Stage.jsx'
import Timer from './components/Timer.jsx'
import { useCountdown } from './lib/countdown.js'
import classes from './practice.module.css'

const BRAINSTORM_MS = 3 * 60_000
const SHOWN_TOPICS = 14

function sample(list, n, seed) {
  const copy = [...list]
  let s = seed
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function TopicPicker({ topics, onStart }) {
  const [seed, setSeed] = useState(() => Date.now() % 233280)
  const [custom, setCustom] = useState('')
  const shown = useMemo(() => sample(topics, SHOWN_TOPICS, seed), [topics, seed])
  const start = () => custom.trim() && onStart(custom.trim())
  return (
    <Stack gap="lg" maw={880}>
      <Stage>
        <Stack gap="md">
          <Eyebrow c="var(--accent)">Step 1 · pick a topic</Eyebrow>
          <SetupLine fz="2xl">What are we mining today?</SetupLine>
          <Group gap="2xs">
            {shown.map((t) => (
              <Chip key={t} checked={false} onChange={() => onStart(t)} variant="outline" radius="xl">
                {t}
              </Chip>
            ))}
            <Button variant="subtle" color="gray" size="compact-sm" leftSection={<Dices size={14} />} onClick={() => setSeed((s) => s + 1)}>
              More
            </Button>
          </Group>
          <Group gap="sm" align="flex-end" wrap="nowrap">
            <TextInput
              flex={1}
              label="…or bring your own"
              placeholder="e.g. my sister's wedding"
              value={custom}
              maxLength={80}
              onChange={(e) => setCustom(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && start()}
            />
            <Button onClick={start} disabled={!custom.trim()}>
              Start the clock
            </Button>
          </Group>
        </Stack>
      </Stage>
      <Text c="dimmed" fz="sm">
        You get three minutes to fill five columns: people, places, things, phrases and feelings. Then the mapper
        smashes two distant ideas together and you write the joke that connects them.
      </Text>
    </Stack>
  )
}

function Column({ category, items, onAdd, autoFocus }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    if (!draft.trim()) return
    onAdd(category.key, draft.trim())
    setDraft('')
  }
  return (
    <Paper p="sm" bg="var(--surface)" withBorder style={{ borderColor: 'var(--border)' }}>
      <Group justify="space-between" mb="4xs">
        <Text fw={700} ff="var(--font-display)">
          {category.label}
        </Text>
        <Text key={items.length} className={classes.bump} fz="sm" fw={700} c={items.length ? 'var(--accent)' : 'var(--text-faint)'}>
          {items.length}
        </Text>
      </Group>
      <Text fz="2xs" c="var(--text-faint)" mb="2xs" mih={30}>
        {category.hint}
      </Text>
      <TextInput
        size="sm"
        value={draft}
        autoFocus={autoFocus}
        maxLength={80}
        aria-label={`Add to ${category.label}`}
        placeholder="type, Enter"
        onChange={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
      />
      <Stack gap="4xs" mt="2xs">
        {items.map((t, i) => (
          <Text key={`${t}-${i}`} className={classes.popIn} fz="sm">
            {t}
          </Text>
        ))}
      </Stack>
    </Paper>
  )
}

function Brainstorm({ topic, categories, onDone, saving }) {
  const [items, setItems] = useState([])
  const itemsRef = useRef(items)
  itemsRef.current = items
  const clock = useCountdown(BRAINSTORM_MS, { onExpire: () => onDone(itemsRef.current) })
  const { start } = clock
  useEffect(() => {
    start()
  }, [start])
  const add = (category, text) => setItems((l) => [...l, { category, text }])
  return (
    <Stack gap="lg">
      <Stage p="lg">
        <Group justify="space-between" wrap="nowrap">
          <Stack gap="4xs">
            <Eyebrow>Step 2 · brainstorm, don&apos;t judge</Eyebrow>
            <SetupLine fz="3xl">{topic}</SetupLine>
            <Text c="dimmed" fz="sm">
              {items.length} associations · <Kbd size="xs">Tab</Kbd> jumps columns, <Kbd size="xs">Enter</Kbd> adds
            </Text>
          </Stack>
          <Timer remaining={clock.remaining} fraction={clock.fraction} size={112} />
        </Group>
      </Stage>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }} spacing="sm">
        {categories.map((c, i) => (
          <Column key={c.key} category={c} autoFocus={i === 0} items={items.filter((it) => it.category === c.key).map((it) => it.text)} onAdd={add} />
        ))}
      </SimpleGrid>
      <Group justify="flex-end">
        <Button
          loading={saving}
          disabled={items.length < 2}
          onClick={() => {
            clock.stop()
            onDone(items)
          }}
        >
          Done, collide them
        </Button>
      </Group>
    </Stack>
  )
}

function SurpriseMeter({ value }) {
  return (
    <Group gap="4xs" aria-label={`Surprise ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Box key={n} w={10} h={10} style={{ borderRadius: 999, background: n <= value ? 'var(--accent)' : 'var(--surface-3)' }} />
      ))}
    </Group>
  )
}

function CollisionCard({ c, active, onSelect, label }) {
  return (
    <UnstyledButton className={`${classes.choice} ${classes.popIn}`} data-active={active} onClick={onSelect} p="md" aria-pressed={active}>
      <Group justify="space-between" mb="2xs">
        <Text fz="2xs" tt="uppercase" lts={1.2} c="var(--text-faint)">
          {label}
        </Text>
        <SurpriseMeter value={c.surprise} />
      </Group>
      <Text ff="var(--font-display)" fw={800} fz="xl" lh={1.2}>
        {c.a.text} <Text span c="var(--accent)">×</Text> {c.b.text}
      </Text>
      <Text fz="xs" c="dimmed" mt="4xs">
        {c.why}
      </Text>
    </UnstyledButton>
  )
}

function CollisionLab({ map, setMap, categories }) {
  const [selected, setSelected] = useState(0)
  const [shuffles, setShuffles] = useState(0)
  const [setup, setSetup] = useState('')
  const [punchline, setPunchline] = useState('')
  const [written, setWritten] = useState([])
  const shuffle = useShuffleMutation(map.id)
  const adopt = useAddItemMutation(map.id)
  const joke = useCollisionJokeMutation(map.id)
  const labelOf = (key) => categories.find((c) => c.key === key)?.label ?? key
  const collision = map.collisions[selected]

  const reroll = () => {
    const next = shuffles + 1
    setShuffles(next)
    shuffle.mutate(next, { onSuccess: (m) => { setMap(m); setSelected(0) } })
  }

  const save = () => {
    if (!collision || !punchline.trim()) return
    joke.mutate(
      { a: collision.a.text, b: collision.b.text, setup: setup.trim(), punchline: punchline.trim() },
      {
        onSuccess: (res) => {
          setWritten((w) => [{ id: res.jokeId, a: collision.a.text, b: collision.b.text, text: punchline.trim() }, ...w])
          setSetup('')
          setPunchline('')
          notifications.show({
            title: res.xp ? `+${res.xp} xp · Association` : 'Saved to your bank',
            message: res.xp ? 'First collision joke of the map. Try another pairing.' : `${res.jokes} jokes from this map.`,
            color: 'amber',
          })
        },
      },
    )
  }

  const suggestionEntries = Object.entries(map.suggestions ?? {}).filter(([, list]) => list.length > 0)

  return (
    <Stack gap="xl">
      <Stage p="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap="4xs">
            <Eyebrow>Step 3 · collide</Eyebrow>
            <SetupLine fz="3xl">{map.topic}</SetupLine>
            <Text fz="sm" c="dimmed">
              {map.items.length} associations of yours{map.jokes ? ` · ${map.jokes} jokes written` : ''}
            </Text>
          </Stack>
          <Button variant="default" leftSection={<Shuffle size={16} />} onClick={reroll} loading={shuffle.isPending}>
            New collisions
          </Button>
        </Group>
      </Stage>

      {map.collisions.length === 0 ? (
        <Alert color="gray" variant="light">
          Collisions need ideas from at least two columns. Add a couple of the extras below.
        </Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {map.collisions.map((c, i) => (
            <CollisionCard
              key={`${c.a.text}-${c.b.text}`}
              c={c}
              active={i === selected}
              onSelect={() => setSelected(i)}
              label={`${labelOf(c.a.category)} × ${labelOf(c.b.category)}${c.a.suggested || c.b.suggested ? ' · uses an extra' : ''}`}
            />
          ))}
        </SimpleGrid>
      )}

      {collision && (
        <Paper p="lg" bg="var(--surface)" withBorder style={{ borderColor: 'var(--accent)' }}>
          <Stack gap="sm">
            <Group gap="2xs">
              <Zap size={16} color="var(--accent)" />
              <Text fw={600}>{collision.prompt}</Text>
            </Group>
            <Textarea
              label="Setup (optional)"
              placeholder={`Something true about ${map.topic}…`}
              rows={1}
              maxLength={500}
              value={setup}
              onChange={(e) => setSetup(e.currentTarget.value)}
            />
            <Textarea
              label="Punchline"
              placeholder={`Connect “${collision.a.text}” and “${collision.b.text}”…`}
              rows={3}
              maxLength={500}
              value={punchline}
              onChange={(e) => setPunchline(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
              }}
              styles={{ input: { fontFamily: 'var(--font-display)', fontSize: 'var(--mantine-font-size-lg)' } }}
            />
            <Group justify="space-between">
              <Text fz="xs" c="var(--text-faint)">
                <Kbd size="xs">Ctrl</Kbd>+<Kbd size="xs">Enter</Kbd> saves
              </Text>
              <Button onClick={save} loading={joke.isPending} disabled={!punchline.trim()}>
                Save joke
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {written.length > 0 && (
        <Stack gap="2xs">
          <Title order={2}>Written from this map</Title>
          {written.map((w) => (
            <Box key={w.id} className={classes.popIn} p="sm" bg="var(--surface-2)" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
              <Text fz="2xs" c="var(--text-faint)">
                {w.a} × {w.b}
              </Text>
              <Text fw={600}>{w.text}</Text>
            </Box>
          ))}
        </Stack>
      )}

      {suggestionEntries.length > 0 && (
        <Stack gap="sm">
          <Group gap="2xs">
            <Plus size={16} color="var(--accent)" />
            <Title order={2}>Ones you didn&apos;t think of</Title>
          </Group>
          <Text fz="sm" c="dimmed">
            From the {map.curatedTopic} list. Tap one to add it to your map; it joins the next round of collisions.
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {suggestionEntries.map(([cat, list]) => (
              <Stack key={cat} gap="4xs">
                <Text fz="2xs" tt="uppercase" lts={1.2} c="var(--text-faint)">
                  {labelOf(cat)}
                </Text>
                <Group gap="4xs">
                  {list.map((s) => (
                    <Badge
                      key={s}
                      component="button"
                      variant="outline"
                      color="gray"
                      tt="none"
                      fw={500}
                      style={{ cursor: 'pointer' }}
                      onClick={() => adopt.mutate({ category: cat, text: s }, { onSuccess: setMap })}
                    >
                      + {s}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      )}

      <Stack gap="2xs">
        <Group gap="2xs">
          <Lightbulb size={16} color="var(--accent)" />
          <Title order={2}>Coach&apos;s notes</Title>
        </Group>
        {map.tips.map((t) => (
          <Text key={t} fz="sm" c="dimmed">
            {t}
          </Text>
        ))}
      </Stack>
    </Stack>
  )
}

export default function AssociationPage() {
  const { data: topics, isLoading } = useTopicsQuery()
  const start = useStartMapMutation()
  const [topic, setTopic] = useState(null)
  const [map, setMap] = useState(null)

  const finish = useCallback(
    (items) => {
      start.mutate(
        { topic, items },
        {
          onSuccess: setMap,
          onError: () => notifications.show({ title: 'Couldn’t save the map', message: 'Try again in a moment.', color: 'red' }),
        },
      )
    },
    [start, topic],
  )

  const reset = () => {
    setMap(null)
    setTopic(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Association"
        title="Association Mapper"
        description="Jokes live where two ideas that shouldn't meet, meet. Map a topic fast, then collide its far corners."
        actions={
          (topic || map) && (
            <Button variant="default" leftSection={<Network size={16} />} onClick={reset}>
              New map
            </Button>
          )
        }
      />
      {isLoading && <Skeleton h={240} radius="lg" />}
      {topics && !topic && !map && <TopicPicker topics={topics.topics} onStart={setTopic} />}
      {topics && topic && !map && (
        <Brainstorm topic={topic} categories={topics.categories} onDone={finish} saving={start.isPending} />
      )}
      {topics && map && <CollisionLab map={map} setMap={setMap} categories={topics.categories} />}
    </>
  )
}
