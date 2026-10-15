import { Paper, SegmentedControl, Select, Stack, Text, TextInput, Textarea } from '@mantine/core'

export function jokeLabel(j) {
  const text = `${j.setup ? `${j.setup} ` : ''}${j.punchline}`
  return text.length > 90 ? `${text.slice(0, 87)}...` : text
}

/**
 * Step 1: pick a joke from the bank or type one. value: { mode, jokeId, setup, punchline }.
 */
export default function JokePicker({ jokes, value, onChange, disabled }) {
  const hasBank = jokes.length > 0
  return (
    <Paper p="lg" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Stack gap="sm">
        <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)">
          1 · Pick your joke
        </Text>
        <SegmentedControl
          value={value.mode}
          onChange={(mode) => onChange({ ...value, mode })}
          disabled={disabled}
          data={[
            { value: 'bank', label: `From my bank${hasBank ? ` (${jokes.length})` : ''}`, disabled: !hasBank },
            { value: 'typed', label: 'Type one' },
          ]}
        />
        {value.mode === 'bank' ? (
          <Select
            aria-label="Joke from your bank"
            placeholder="Choose a joke you wrote"
            searchable
            disabled={disabled}
            data={jokes.map((j) => ({ value: String(j.id), label: jokeLabel(j) }))}
            value={value.jokeId == null ? null : String(value.jokeId)}
            onChange={(id) => onChange({ ...value, jokeId: id == null ? null : Number(id) })}
            nothingFoundMessage="No joke matches"
          />
        ) : (
          <Stack gap="xs">
            {!hasBank && (
              <Text fz="sm" c="dimmed">
                Your joke bank is empty, so type one in. Anything you write in the riff, gym or notebook shows up here
                later.
              </Text>
            )}
            <Textarea
              label="Setup"
              placeholder="I bought a smart fridge."
              rows={2}
              maxLength={500}
              disabled={disabled}
              value={value.setup}
              onChange={(e) => onChange({ ...value, setup: e.currentTarget.value })}
            />
            <TextInput
              label="Punchline"
              placeholder="Now it judges me in real time."
              maxLength={500}
              disabled={disabled}
              value={value.punchline}
              onChange={(e) => onChange({ ...value, punchline: e.currentTarget.value })}
            />
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
