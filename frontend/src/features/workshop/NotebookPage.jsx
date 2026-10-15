import {
  ActionIcon, Badge, Box, Button, Chip, Drawer, Group, Menu, Modal, Select, SimpleGrid, Skeleton, Stack, Tabs, TagsInput,
  Text, Textarea, TextInput, Title, Tooltip,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  ArrowDown, ArrowUp, Layers, Link2, ListPlus, MoreHorizontal, NotebookPen, Pencil, Plus, ScanSearch, Search, Star,
  Swords, Trash2, Wand2, X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import {
  errorMessage, useArenaEntryMutation, useBitJokesMutation, useBitsQuery, useCallbacksQuery, useCreateBitMutation,
  useDeleteBitMutation, useDeleteJokeMutation, useFavouriteMutation, useJokesQuery, useRenameBitMutation,
  useSaveJokeMutation, useTagsQuery,
} from './api.js'
import JokeLines, { Eyebrow, Panel, SOURCE_LABEL, xrayHref } from './components/JokeLines.jsx'
import classes from './workshop.module.css'

const fail = (e) => notifications.show({ color: 'red', message: errorMessage(e) })

// ---------------------------------------------------------------- editor

function JokeEditor({ joke, opened, onClose }) {
  const save = useSaveJokeMutation()
  const { data: tags } = useTagsQuery()
  const [setup, setSetup] = useState(joke?.setup ?? '')
  const [punchline, setPunchline] = useState(joke?.punchline ?? '')
  const [jokeTags, setJokeTags] = useState(joke?.tags ?? [])
  const submit = () => {
    if (!punchline.trim()) return
    save.mutate(
      { id: joke?.id, setup: setup.trim(), punchline: punchline.trim(), tags: jokeTags },
      {
        onSuccess: () => {
          notifications.show({ color: 'amber', message: joke ? 'Saved.' : 'In the notebook.' })
          onClose()
        },
        onError: fail,
      },
    )
  }
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    }
  }
  return (
    <Modal opened={opened} onClose={onClose} title={joke ? 'Edit joke' : 'New joke'} size="lg" centered>
      <Stack gap="sm">
        <Textarea label="Setup" value={setup} onChange={(e) => setSetup(e.currentTarget.value)} onKeyDown={onKeyDown} autosize minRows={2} maxLength={500} data-autofocus />
        <Textarea
          label="Punchline"
          value={punchline}
          onChange={(e) => setPunchline(e.currentTarget.value)}
          onKeyDown={onKeyDown}
          autosize
          minRows={2}
          maxLength={500}
          styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--mantine-font-size-lg)' } }}
        />
        <TagsInput
          label="Tags"
          description="Up to 8. Enter adds one."
          value={jokeTags}
          onChange={setJokeTags}
          data={(tags ?? []).map((t) => t.name)}
          maxTags={8}
          clearable
        />
        <Group justify="flex-end" gap="2xs">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={save.isPending} disabled={!punchline.trim()}>
            {joke ? 'Save' : 'Add to notebook'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

// ---------------------------------------------------------------- callbacks

function CallbackPair({ c }) {
  const marks = { punch: c.sharedWords.flatMap((w) => [w, `${w}s`, `${w}es`]) }
  return (
    <Panel className={classes.popIn}>
      <Stack gap="sm">
        <Group gap="2xs">
          {c.sharedWords.map((w) => (
            <Badge key={w} variant="light">
              {w}
            </Badge>
          ))}
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <JokeLines setup={c.a.setup} punchline={c.a.punchline} size="sm" marks={marks} />
          <JokeLines setup={c.b.setup} punchline={c.b.punchline} size="sm" marks={marks} />
        </SimpleGrid>
        <Group gap="2xs" wrap="nowrap" align="flex-start">
          <Link2 size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
          <Text fz="sm" c="dimmed">
            {c.hint}
          </Text>
        </Group>
      </Stack>
    </Panel>
  )
}

function CallbackList({ jokeId }) {
  const { data, isLoading } = useCallbacksQuery(jokeId)
  if (isLoading) return <Skeleton h={160} radius="md" />
  if (!data.length) {
    return (
      <Text c="dimmed">
        {jokeId
          ? 'No other joke shares a key noun with this one yet. Write a second joke about the same thing and come back.'
          : 'No two jokes share a key noun yet. Callbacks need overlap: write a few jokes on the same topic.'}
      </Text>
    )
  }
  return (
    <Stack gap="sm" data-testid="callbacks">
      {data.map((c) => (
        <CallbackPair key={`${c.a.id}-${c.b.id}`} c={c} />
      ))}
    </Stack>
  )
}

// ---------------------------------------------------------------- jokes

function NoteCard({ joke, bits, onEdit, onCallbacks }) {
  const navigate = useNavigate()
  const favourite = useFavouriteMutation()
  const arena = useArenaEntryMutation()
  const del = useDeleteJokeMutation()
  const bitJokes = useBitJokesMutation()
  const [confirming, setConfirming] = useState(false)

  const addToBit = (bit) =>
    bitJokes.mutate(
      { id: bit.id, jokeIds: [...bit.jokes.map((j) => j.id).filter((id) => id !== joke.id), joke.id] },
      { onSuccess: () => notifications.show({ color: 'amber', message: `Added to “${bit.title}”.` }), onError: fail },
    )

  return (
    <Panel className={classes.popIn} data-testid="note">
      <Stack gap="sm">
        <Group align="flex-start" wrap="nowrap" gap="md">
          <JokeLines setup={joke.setup} punchline={joke.punchline} size="md" flex={1} />
          <ActionIcon
            variant="subtle"
            color={joke.favourite ? 'amber' : 'gray'}
            aria-label={joke.favourite ? 'Unfavourite' : 'Favourite'}
            aria-pressed={joke.favourite}
            onClick={() => favourite.mutate({ id: joke.id, favourite: !joke.favourite })}
          >
            <Star size={18} fill={joke.favourite ? 'var(--accent)' : 'none'} />
          </ActionIcon>
        </Group>
        <Group justify="space-between" wrap="wrap" gap="xs">
          <Group gap="4xs">
            <Badge size="sm" variant="outline" color="gray">
              {SOURCE_LABEL[joke.source]}
            </Badge>
            {joke.tags.map((t) => (
              <Badge key={t} size="sm" variant="light" color="gray">
                #{t}
              </Badge>
            ))}
            {joke.inArena ? (
              <Badge size="sm" variant="light" leftSection={<Swords size={10} />}>
                {joke.votes ? `${joke.rating} · ${joke.winRate}% of ${joke.votes}` : 'in arena'}
              </Badge>
            ) : null}
          </Group>
          <Group gap="4xs">
            <Button size="compact-sm" variant="subtle" color="gray" leftSection={<Wand2 size={14} />} onClick={() => navigate(`/punchup?joke=${joke.id}`)}>
              Punch it up
            </Button>
            <Button
              size="compact-sm"
              variant="subtle"
              color="gray"
              leftSection={<Swords size={14} />}
              onClick={() =>
                arena.mutate(
                  { id: joke.id, inArena: !joke.inArena },
                  {
                    onSuccess: (j) => notifications.show({ color: 'amber', message: j.inArena ? 'In the Arena. Strangers will judge it.' : 'Withdrawn from the Arena.' }),
                    onError: fail,
                  },
                )
              }
            >
              {joke.inArena ? 'Withdraw' : 'Send to arena'}
            </Button>
            <Button size="compact-sm" variant="subtle" color="gray" leftSection={<ScanSearch size={14} />} component={Link} to={xrayHref(joke)}>
              X-ray it
            </Button>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label="More actions">
                  <MoreHorizontal size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Pencil size={14} />} onClick={() => onEdit(joke)}>
                  Edit
                </Menu.Item>
                <Menu.Item leftSection={<Link2 size={14} />} onClick={() => onCallbacks(joke)}>
                  Find callbacks
                </Menu.Item>
                {bits.length > 0 && <Menu.Label>Add to bit</Menu.Label>}
                {bits.map((b) => (
                  <Menu.Item key={b.id} leftSection={<ListPlus size={14} />} onClick={() => addToBit(b)}>
                    {b.title}
                  </Menu.Item>
                ))}
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => setConfirming(true)}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
        {confirming ? (
          <Group justify="flex-end" gap="2xs">
            <Text fz="sm" c="dimmed">
              Delete this joke for good?
            </Text>
            <Button size="compact-sm" variant="subtle" color="gray" onClick={() => setConfirming(false)}>
              Keep
            </Button>
            <Button size="compact-sm" variant="light" color="red" loading={del.isPending} onClick={() => del.mutate(joke.id, { onError: fail })}>
              Delete
            </Button>
          </Group>
        ) : null}
      </Stack>
    </Panel>
  )
}

function JokesTab({ onEdit, onCallbacks, onNew }) {
  const [q, setQ] = useState('')
  const [source, setSource] = useState(null)
  const [tag, setTag] = useState(null)
  const [favOnly, setFavOnly] = useState(false)
  const [debouncedQ] = useDebouncedValue(q, 200)
  const filter = { q: debouncedQ || undefined, source: source ?? undefined, tag: tag ?? undefined, favourite: favOnly || undefined }
  const { data: jokes, isLoading } = useJokesQuery(filter)
  const { data: tags } = useTagsQuery()
  const { data: bits } = useBitsQuery()
  const filtered = !!(debouncedQ || source || tag || favOnly)

  return (
    <Stack gap="lg">
      <Group gap="sm" wrap="wrap">
        <TextInput
          leftSection={<Search size={16} />}
          placeholder="Search your jokes"
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          aria-label="Search"
          flex={1}
          miw={200}
        />
        <Select
          placeholder="Any source"
          aria-label="Source"
          data={Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label }))}
          value={source}
          onChange={setSource}
          clearable
          w={170}
        />
        <Select
          placeholder="Any tag"
          aria-label="Tag"
          data={(tags ?? []).map((t) => ({ value: t.name, label: `#${t.name} (${t.count})` }))}
          value={tag}
          onChange={setTag}
          clearable
          searchable
          w={170}
        />
        <Chip checked={favOnly} onChange={setFavOnly} icon={<Star size={12} />}>
          Favourites
        </Chip>
      </Group>
      {isLoading ? (
        <Stack gap="sm">
          <Skeleton h={120} radius="md" />
          <Skeleton h={120} radius="md" />
        </Stack>
      ) : jokes.length === 0 ? (
        <Panel p="xl">
          <Stack gap="sm" align="flex-start">
            <Title order={2}>{filtered ? 'Nothing matches.' : 'Your notebook is empty.'}</Title>
            <Text c="dimmed">
              {filtered
                ? 'Try a different filter.'
                : 'Everything you write anywhere (riffs, drills, punch-ups) lands here. Or jot one down now.'}
            </Text>
            {!filtered && (
              <Button variant="default" leftSection={<Plus size={16} />} onClick={onNew}>
                Jot one down
              </Button>
            )}
          </Stack>
        </Panel>
      ) : (
        <Stack gap="sm">
          <Text fz="xs" c="dimmed">
            {jokes.length} {jokes.length === 1 ? 'joke' : 'jokes'}
          </Text>
          {jokes.map((j) => (
            <NoteCard key={j.id} joke={j} bits={bits ?? []} onEdit={onEdit} onCallbacks={onCallbacks} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

// ---------------------------------------------------------------- bits

function BitCard({ bit, allJokes }) {
  const setJokes = useBitJokesMutation()
  const rename = useRenameBitMutation()
  const del = useDeleteBitMutation()
  const [title, setTitle] = useState(bit.title)
  const ids = bit.jokes.map((j) => j.id)
  const update = (next) => setJokes.mutate({ id: bit.id, jokeIds: next }, { onError: fail })
  const move = (i, d) => {
    const next = [...ids]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    update(next)
  }
  const options = allJokes
    .filter((j) => !ids.includes(j.id))
    .map((j) => ({ value: String(j.id), label: `${j.setup ? `${j.setup} ` : ''}${j.punchline}`.slice(0, 90) }))

  return (
    <Panel p="lg" data-testid="bit">
      <Stack gap="md">
        <Group justify="space-between" wrap="nowrap">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onBlur={() => title.trim() && title !== bit.title && rename.mutate({ id: bit.id, title: title.trim() }, { onError: fail })}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            variant="unstyled"
            aria-label="Bit title"
            styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--mantine-font-size-xl)' } }}
            flex={1}
          />
          <Tooltip label="Delete bit (the jokes stay in your notebook)">
            <ActionIcon variant="light" color="red" aria-label="Delete bit" onClick={() => del.mutate(bit.id, { onError: fail })}>
              <Trash2 size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
        {bit.jokes.length === 0 ? (
          <Text c="dimmed" fz="sm">
            Empty bit. Add jokes below, then order them: strongest last, callback at the very end.
          </Text>
        ) : (
          <Stack gap="xs">
            {bit.jokes.map((j, i) => (
              <Group key={j.id} gap="sm" wrap="nowrap" align="flex-start" className={classes.popIn}>
                <Text className={classes.rank} c="var(--accent)" fz="lg">
                  {i + 1}
                </Text>
                <JokeLines setup={j.setup} punchline={j.punchline} size="sm" flex={1} />
                <Group gap="5xs" wrap="nowrap">
                  <ActionIcon variant="subtle" color="gray" aria-label={`Move joke ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="gray" aria-label={`Move joke ${i + 1} down`} disabled={i === ids.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="gray" aria-label={`Remove joke ${i + 1}`} onClick={() => update(ids.filter((id) => id !== j.id))}>
                    <X size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>
        )}
        <Select
          placeholder="Add a joke to this bit…"
          aria-label="Add a joke to this bit"
          data={options}
          value={null}
          onChange={(v) => v && update([...ids, Number(v)])}
          searchable
          nothingFoundMessage="No other jokes"
        />
      </Stack>
    </Panel>
  )
}

function BitsTab() {
  const { data: bits, isLoading } = useBitsQuery()
  const { data: jokes } = useJokesQuery()
  const create = useCreateBitMutation()
  const [title, setTitle] = useState('')
  const submit = () =>
    title.trim() && create.mutate({ title: title.trim() }, { onSuccess: () => setTitle(''), onError: fail })
  return (
    <Stack gap="lg">
      <Text c="dimmed" maw={640}>
        A bit is a run of jokes on one topic, in the order you&apos;d tell them. Build one, then reorder until each joke tops the
        last.
      </Text>
      <Group gap="sm">
        <TextInput
          placeholder="Bit title, e.g. Airports"
          aria-label="New bit title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          maxLength={80}
          flex={1}
          maw={420}
        />
        <Button variant="default" leftSection={<Layers size={16} />} onClick={submit} loading={create.isPending} disabled={!title.trim()}>
          Create bit
        </Button>
      </Group>
      {isLoading ? (
        <Skeleton h={200} radius="md" />
      ) : bits.length === 0 ? (
        <Text c="dimmed">No bits yet.</Text>
      ) : (
        bits.map((b) => <BitCard key={b.id} bit={b} allJokes={jokes ?? []} />)
      )}
    </Stack>
  )
}

// ---------------------------------------------------------------- page

export default function NotebookPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'jokes'
  const [editing, setEditing] = useState(null) // null closed, {} new, joke = edit
  const [callbacksFor, setCallbacksFor] = useState(null)

  return (
    <Box>
      <PageHeader
        eyebrow="Joke bank"
        title="Bit Notebook"
        description="Every joke you've written, from every exercise. Star the keepers, group them into bits, find callbacks."
        actions={
          <Button leftSection={<NotebookPen size={16} />} onClick={() => setEditing({})}>
            New joke
          </Button>
        }
      />
      <Tabs value={tab} onChange={(v) => setParams(v === 'jokes' ? {} : { tab: v })} keepMounted={false}>
        <Tabs.List mb="xl">
          <Tabs.Tab value="jokes">Jokes</Tabs.Tab>
          <Tabs.Tab value="bits" leftSection={<Layers size={16} />}>
            Bits
          </Tabs.Tab>
          <Tabs.Tab value="callbacks" leftSection={<Link2 size={16} />}>
            Callback finder
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="jokes">
          <JokesTab onEdit={setEditing} onCallbacks={setCallbacksFor} onNew={() => setEditing({})} />
        </Tabs.Panel>
        <Tabs.Panel value="bits">
          <BitsTab />
        </Tabs.Panel>
        <Tabs.Panel value="callbacks">
          <Stack gap="lg">
            <Text c="dimmed" maw={640}>
              A callback brings back something from an earlier joke. These pairs share a key noun, so one can pay off the other.
            </Text>
            <CallbackList />
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {editing && <JokeEditor key={editing.id ?? 'new'} joke={editing.id ? editing : null} opened onClose={() => setEditing(null)} />}

      <Drawer opened={!!callbacksFor} onClose={() => setCallbacksFor(null)} position="right" size="lg" title="Callbacks">
        {callbacksFor && (
          <Stack gap="md">
            <Eyebrow>For this joke</Eyebrow>
            <JokeLines setup={callbacksFor.setup} punchline={callbacksFor.punchline} size="sm" />
            <CallbackList jokeId={callbacksFor.id} />
          </Stack>
        )}
      </Drawer>
    </Box>
  )
}
