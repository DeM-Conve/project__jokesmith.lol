import { Box, Group, Kbd, Stack, Text, UnstyledButton } from '@mantine/core'
import { Mic, Square } from 'lucide-react'
import VolumeTimeline from '../charts/VolumeTimeline.jsx'
import { MAX_TAKE_MS } from './useTakeRecorder.js'

function seconds(ms) {
  return `${Math.floor(ms / 1000)}.${Math.floor((ms % 1000) / 100)}s`
}

/**
 * The stage: the joke as a teleprompter, a big round mic button, and while recording a
 * live mic-red waveform, timer and transcript.
 */
export default function MicStage({ joke, recorder, onToggle, ready }) {
  const { status, samples, transcript, elapsedMs, support } = recorder
  const live = status === 'recording'
  const busy = status === 'requesting' || status === 'processing'

  return (
    <Box
      p={{ base: 'lg', sm: 'xl' }}
      style={{
        borderRadius: 'var(--mantine-radius-lg)',
        border: `1px solid ${live ? 'var(--mic)' : 'var(--border)'}`,
        background: live
          ? 'radial-gradient(ellipse 60% 70% at 50% 0%, var(--mic-soft), transparent 70%), var(--surface)'
          : 'radial-gradient(ellipse 60% 70% at 50% 0%, var(--accent-soft), transparent 70%), var(--surface)',
        transition: 'background 300ms ease, border-color 300ms ease',
      }}
    >
      <Stack gap="lg" align="center">
        <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c={live ? 'var(--mic)' : 'var(--text-faint)'}>
          {live ? '● On air' : '2 · Step up to the mic'}
        </Text>

        <Stack gap="2xs" maw={720} ta="center" mih={90} justify="center">
          {joke ? (
            <>
              {joke.setup && (
                <Text ff="var(--font-display)" fw={500} fz={{ base: 'xl', sm: '2xl' }} lh={1.25}>
                  {joke.setup}
                </Text>
              )}
              <Text ff="var(--font-display)" fw={800} fz={{ base: '2xl', sm: '3xl' }} lh={1.15} c="var(--accent)">
                {joke.punchline}
              </Text>
            </>
          ) : (
            <Text c="dimmed" fz="lg">
              Pick or type a joke, then hit the mic.
            </Text>
          )}
        </Stack>

        <UnstyledButton
          onClick={onToggle}
          disabled={!ready || busy || !support.mic}
          aria-label={live ? 'Stop recording' : 'Start recording'}
          data-autofocus
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: live ? 'var(--mic)' : ready && support.mic ? 'var(--accent)' : 'var(--surface-3)',
            color: live || !(ready && support.mic) ? 'var(--text)' : 'var(--accent-ink)',
            boxShadow: live ? '0 0 0 10px var(--mic-soft), var(--shadow)' : 'var(--shadow)',
            transition: 'all 200ms ease',
            opacity: busy ? 0.6 : 1,
            cursor: !ready || busy || !support.mic ? 'not-allowed' : 'pointer',
          }}
        >
          {live ? <Square size={32} fill="currentColor" /> : <Mic size={38} />}
        </UnstyledButton>

        <Group gap="xs" c="dimmed">
          {live ? (
            <Text fz="sm" c="var(--mic)" fw={600} ff="monospace">
              {seconds(elapsedMs)} / {MAX_TAKE_MS / 1000}s
            </Text>
          ) : status === 'processing' ? (
            <Text fz="sm">Listening back...</Text>
          ) : (
            <Text fz="sm">
              Press <Kbd>Space</Kbd> to record, and again to stop. Tell it like you mean it.
            </Text>
          )}
        </Group>

        {live && (
          <Stack gap="xs" w="100%" maw={720}>
            <VolumeTimeline samples={samples} live durationMs={Math.max(6000, elapsedMs)} />
            {support.speech && (
              <Text fz="md" c={transcript ? 'var(--text)' : 'var(--text-faint)'} ta="center" fs={transcript ? undefined : 'italic'}>
                {transcript || 'Listening...'}
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
