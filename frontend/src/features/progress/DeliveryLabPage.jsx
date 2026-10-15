import { Alert, Grid, Paper, Stack, Text } from '@mantine/core'
import { MicOff, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import { useDeliveryJokesQuery, useSaveTakeMutation } from './api.js'
import { analyseTake } from './delivery/analysis.js'
import JokePicker from './delivery/JokePicker.jsx'
import MicStage from './delivery/MicStage.jsx'
import TakeResult from './delivery/TakeResult.jsx'
import TakesTable from './delivery/TakesTable.jsx'
import { useTakeRecorder } from './delivery/useTakeRecorder.js'

/** The joke being performed, from the picker state. */
function currentJoke(pick, bank) {
  if (pick.mode === 'bank') {
    const j = bank.find((b) => b.id === pick.jokeId)
    return j ? { jokeId: j.id, setup: j.setup, punchline: j.punchline } : null
  }
  const punchline = pick.punchline.trim()
  return punchline ? { jokeId: null, setup: pick.setup.trim(), punchline } : null
}

const LISTEN_FOR = [
  ['The pause', 'a beat of silence right before the punch, about half a second.'],
  ['Pace', 'around 120-165 words a minute, a little slower than chatting.'],
  ['Fillers', '"um", "uh", and "so" or "like" used as padding.'],
  ['The ending', 'the punch word should be the last thing you say.'],
  ['Energy', 'how much your volume moves; monotone hides the punch.'],
]

const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

/**
 * Delivery Lab: tell a joke into the mic, see your timing. Analysis runs in the browser;
 * only numbers + transcript are saved. useRecorder is injectable for tests.
 */
export default function DeliveryLabPage({ useRecorder = useTakeRecorder }) {
  const { data: bank = [] } = useDeliveryJokesQuery()
  const save = useSaveTakeMutation()
  const recorder = useRecorder()
  const [pick, setPick] = useState({ mode: 'typed', jokeId: null, setup: '', punchline: '' })
  const [takes, setTakes] = useState([])
  const [selected, setSelected] = useState(null)
  const touched = useRef(false)

  // Default to the bank once it loads, with the newest joke picked.
  useEffect(() => {
    if (!touched.current && bank.length) {
      touched.current = true
      setPick((p) => ({ ...p, mode: 'bank', jokeId: bank[0].id }))
    }
  }, [bank])

  // Blob URLs live only for this session.
  const urls = useRef([])
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL?.(u)), [])

  const joke = useMemo(() => currentJoke(pick, bank), [pick, bank])
  const live = recorder.status === 'recording'

  const toggle = async () => {
    if (live) {
      const raw = await recorder.stop()
      if (!raw) return
      const jokeText = `${joke.setup ? `${joke.setup} ` : ''}${joke.punchline}`
      const analysis = analyseTake({ ...raw, jokeText })
      const number = takes.length + 1
      if (raw.audioUrl) urls.current.push(raw.audioUrl)
      const take = { number, jokeText, analysis, samples: raw.samples, transcript: raw.transcript, audioUrl: raw.audioUrl, saved: null }
      setTakes((ts) => [...ts, take])
      setSelected(number)
      if (!analysis.silent) {
        const body = { ...analysis.metrics, transcript: raw.transcript }
        if (joke.jokeId != null) body.jokeId = joke.jokeId
        else Object.assign(body, { setup: joke.setup, punchline: joke.punchline })
        save.mutate(body, {
          onSuccess: (saved) => setTakes((ts) => ts.map((t) => (t.number === number ? { ...t, saved } : t))),
        })
      }
    } else if (joke) {
      recorder.start()
    }
  }

  // Space toggles recording (unless typing in a field).
  const toggleRef = useRef(toggle)
  toggleRef.current = toggle
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat || isTyping(document.activeElement)) return
      if (document.activeElement?.tagName === 'BUTTON') return // let the focused button handle it
      e.preventDefault()
      toggleRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const shown = takes.find((t) => t.number === selected)
  const { support, status } = recorder

  return (
    <Stack gap={0} maw={1100}>
      <PageHeader
        eyebrow="Delivery"
        title="Delivery Lab"
        description="Half of funny is how you say it. Tell a joke into the mic and see your pace, your fillers and the pause before the punch."
      />

      <Stack gap="md">
        {!support.mic && (
          <Alert color="gray" variant="light" icon={<MicOff size={16} />} title="This browser can't record audio">
            Recording needs microphone access and MediaRecorder (any recent Chrome, Edge, Firefox or Safari). You can
            still pick a joke and rehearse it out loud.
          </Alert>
        )}
        {support.mic && !support.speech && (
          <Alert color="gray" variant="light" title="No live transcript in this browser">
            Pause, pace and energy still work. For filler words and the "ended on the punch" check, use Chrome or Edge.
          </Alert>
        )}
        {status === 'denied' && (
          <Alert color="red" variant="light" icon={<MicOff size={16} />} title="Microphone blocked">
            Allow microphone access for this site in your browser's address bar, then try again.
          </Alert>
        )}
        {status === 'error' && (
          <Alert color="red" variant="light" title="Couldn't start the microphone">
            Check that a microphone is connected and not in use by another app.
          </Alert>
        )}
        {save.isError && (
          <Alert color="red" variant="light" title="Couldn't save that take">
            Your analysis is still here; the XP just didn't make it to the server.
          </Alert>
        )}

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <JokePicker jokes={bank} value={pick} onChange={setPick} disabled={live} />
              <Paper p="md" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)" mb="xs">
                  What we listen for
                </Text>
                <Stack gap="2xs">
                  {LISTEN_FOR.map(([name, line]) => (
                    <Text key={name} fz="sm" c="dimmed">
                      <Text span fw={600} c="var(--text)">
                        {name}.{' '}
                      </Text>
                      {line}
                    </Text>
                  ))}
                </Stack>
              </Paper>
              <Text fz="xs" c="dimmed">
                <ShieldCheck size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                Your recording never leaves this browser. We only keep the numbers.
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <MicStage joke={joke} recorder={recorder} onToggle={toggle} ready={Boolean(joke)} />
          </Grid.Col>
        </Grid>

        {shown && <TakeResult take={shown} />}
        {takes.length > 1 && <TakesTable takes={takes} selected={selected} onSelect={setSelected} />}
      </Stack>
    </Stack>
  )
}
