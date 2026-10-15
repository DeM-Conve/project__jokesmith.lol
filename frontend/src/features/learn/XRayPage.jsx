import { Alert, Badge, Button, Chip, Group, Kbd, SimpleGrid, Skeleton, Stack, Text, Textarea, UnstyledButton } from '@mantine/core'
import { Eye, PenLine, ScanSearch, TriangleAlert } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import { useGalleryQuery, useXRayHistoryQuery, useXRayMutation } from './api.js'
import Annotator from './components/Annotator.jsx'
import Stage, { Eyebrow } from './components/Stage.jsx'
import XRayResult from './components/XRayResult.jsx'
import { FORMULA_LABELS } from './lib/words.js'
import classes from './learn.module.css'

const DIFFICULTY = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' }

function GalleryCard({ joke, active, onSelect }) {
  return (
    <UnstyledButton
      onClick={() => onSelect(joke)}
      className={`${classes.gridCard} ${active ? classes.gridCardActive : ''}`}
      aria-label={`Gallery joke: ${joke.setup} ${joke.punchline}`}
    >
      <Stack gap="xs" justify="space-between" h="100%">
        <Stack gap="4xs">
          <Text className={classes.jokeSetup} fz="sm" lineClamp={2}>
            {joke.setup}
          </Text>
          <Text className={classes.jokePunch} fz="md" lineClamp={2}>
            {joke.punchline}
          </Text>
        </Stack>
        <Group gap="4xs">
          <Badge size="xs" variant="default" color="gray">
            {DIFFICULTY[joke.difficulty] ?? joke.difficulty}
          </Badge>
          {joke.tags.slice(0, 2).map((t) => (
            <Badge key={t} size="xs" variant="transparent" color="gray">
              #{t}
            </Badge>
          ))}
        </Group>
      </Stack>
    </UnstyledButton>
  )
}

/** A gallery joke picked for study: annotate first (Socratic), or just look. */
function GalleryStudy({ joke, onClear }) {
  const [mode, setMode] = useState('choose')
  const text = `${joke.setup} ${joke.punchline}`
  if (mode === 'annotate') return <Annotator key={joke.id} text={text} galleryRef={joke.id} onReset={onClear} />
  if (mode === 'reveal') {
    return (
      <Stack gap="md">
        <XRayResult xray={joke.xray} title="Hand-annotated X-ray" />
        <Group gap="xs">
          <Button variant="default" leftSection={<PenLine size={16} />} onClick={() => setMode('annotate')}>
            Now mark it up yourself
          </Button>
          <Button variant="subtle" color="gray" onClick={onClear}>
            Close
          </Button>
        </Group>
      </Stack>
    )
  }
  return (
    <Stage>
      <Stack gap="md">
        <Eyebrow>From the gallery</Eyebrow>
        <Stack gap="4xs">
          <Text className={classes.jokeSetup} fz="xl">
            {joke.setup}
          </Text>
          <Text className={classes.jokePunch} fz="2xl">
            {joke.punchline}
          </Text>
        </Stack>
        <Text c="dimmed" fz="sm">
          Try finding the parts yourself first. You'll learn twice as much from comparing as from reading.
        </Text>
        <Group gap="xs">
          <Button variant="default" leftSection={<PenLine size={16} />} onClick={() => setMode('annotate')}>
            Mark it up first
          </Button>
          <Button variant="subtle" color="gray" leftSection={<Eye size={16} />} onClick={() => setMode('reveal')}>
            Just show me the X-ray
          </Button>
        </Group>
      </Stack>
    </Stage>
  )
}

export default function XRayPage() {
  const [text, setText] = useState('')
  const [work, setWork] = useState(null) // { kind: 'xray' } | { kind: 'annotate', text } | { kind: 'gallery', joke }
  const [filter, setFilter] = useState('ALL')
  const xray = useXRayMutation()
  const gallery = useGalleryQuery()
  const history = useXRayHistoryQuery()
  const workRef = useRef(null)

  const scrollToWork = () => setTimeout(() => workRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)

  const runXRay = () => {
    const t = text.trim()
    if (!t || xray.isPending) return
    xray.mutate(t, { onSuccess: () => setWork({ kind: 'xray' }) })
  }

  const annotateMine = () => {
    const t = text.trim()
    if (!t) return
    setWork({ kind: 'annotate', text: t, n: Date.now() })
    scrollToWork()
  }

  const formulasInGallery = useMemo(() => {
    const set = new Set((gallery.data ?? []).map((j) => j.xray.formula))
    return Object.keys(FORMULA_LABELS).filter((f) => set.has(f))
  }, [gallery.data])
  const shown = (gallery.data ?? []).filter((j) => filter === 'ALL' || j.xray.formula === filter)

  return (
    <Stack gap="xl" maw={980}>
      <PageHeader
        eyebrow="Anatomy"
        title="Joke X-Ray"
        description="Paste any joke and see its skeleton: setup, target assumption, connector, reinterpretation and punch word. Or mark it up yourself and compare."
      />

      <Stage>
        <Stack gap="md">
          <Eyebrow>Put a joke on the table</Eyebrow>
          <Textarea
            aria-label="Joke to X-ray"
            placeholder="I've been going to the gym religiously. Christmas and Easter."
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                runXRay()
              }
            }}
            autosize
            minRows={2}
            maxRows={6}
            maxLength={600}
            size="lg"
            styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 700, background: 'var(--surface-2)' } }}
          />
          <Group justify="space-between" gap="xs">
            <Text fz="xs" c="dimmed">
              <Kbd size="xs">Enter</Kbd> to X-ray · <Kbd size="xs">Shift</Kbd>+<Kbd size="xs">Enter</Kbd> for a new line
            </Text>
            <Group gap="xs">
              <Button variant="default" leftSection={<PenLine size={16} />} onClick={annotateMine} disabled={!text.trim()}>
                Mark it up myself
              </Button>
              <Button leftSection={<ScanSearch size={16} />} onClick={runXRay} loading={xray.isPending} disabled={!text.trim()}>
                X-ray it
              </Button>
            </Group>
          </Group>
          {xray.isError && (
            <Alert color="red" variant="light" icon={<TriangleAlert size={16} />}>
              {xray.error?.response?.data?.detail ?? "Couldn't X-ray that. Try a complete joke."}
            </Alert>
          )}
        </Stack>
      </Stage>

      <div ref={workRef}>
        {work?.kind === 'xray' && xray.data && <XRayResult xray={xray.data} title="X-ray" />}
        {work?.kind === 'annotate' && <Annotator key={work.n} text={work.text} onReset={() => setWork(null)} />}
        {work?.kind === 'gallery' && <GalleryStudy key={work.joke.id} joke={work.joke} onClear={() => setWork(null)} />}
      </div>

      <Stack gap="md">
        <Group justify="space-between" align="flex-end">
          <Stack gap="4xs">
            <Text ff="var(--font-display)" fw={800} fz="xl">
              The gallery
            </Text>
            <Text fz="sm" c="dimmed">
              {gallery.data ? `${gallery.data.length} jokes, each hand-annotated.` : 'Hand-annotated jokes.'} Pick
              one, find the parts, then compare.
            </Text>
          </Stack>
        </Group>
        {gallery.data && (
          <Chip.Group multiple={false} value={filter} onChange={setFilter}>
            <Group gap="2xs">
              <Chip value="ALL" size="xs" color="amber">
                All
              </Chip>
              {formulasInGallery.map((f) => (
                <Chip key={f} value={f} size="xs" color="amber">
                  {FORMULA_LABELS[f]}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        )}
        {gallery.isLoading && <Skeleton h={160} radius="md" />}
        {gallery.isError && <Text c="dimmed">The gallery couldn't load right now.</Text>}
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
          {shown.map((j) => (
            <GalleryCard
              key={j.id}
              joke={j}
              active={work?.kind === 'gallery' && work.joke.id === j.id}
              onSelect={(joke) => {
                setWork({ kind: 'gallery', joke })
                scrollToWork()
              }}
            />
          ))}
        </SimpleGrid>
      </Stack>

      {history.data?.length > 0 && (
        <Stack gap="xs">
          <Eyebrow c="var(--text-muted)">Your recent X-rays</Eyebrow>
          {history.data.map((h) => (
            <Group key={h.id} gap="sm" wrap="nowrap" justify="space-between">
              <Text fz="sm" lineClamp={1} c="dimmed">
                {h.jokeText}
              </Text>
              <Group gap="4xs" wrap="nowrap">
                <Badge size="xs" variant="default" color="gray">
                  {FORMULA_LABELS[h.formula]}
                </Badge>
                {h.mode === 'SELF_ANNOTATED' && (
                  <Badge size="xs" variant="light" color="amber">
                    marked up {h.checksPassed}/{h.checksTotal}
                  </Badge>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
