import { ActionIcon, Button, Group, Text, TextInput } from '@mantine/core'
import { Check, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { useMeQuery, useRenameMutation } from '../../../api/me.js'

export function greetingFor(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Up late'
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  if (h < 22) return 'Evening'
  return 'Late show'
}

/** "Evening, DryOtter42." for the page title. */
export function GreetingTitle() {
  const { data: me } = useMeQuery()
  return (
    <>
      {greetingFor()},{' '}
      <Text span inherit c="var(--accent)">
        {me?.handle ?? '...'}
      </Text>
      .
    </>
  )
}

const VALID = /^[\p{L}\p{N}_ .-]{2,32}$/u

/** Inline rename of the stage name: Enter saves, Esc cancels. */
export function RenameControl() {
  const { data: me } = useMeQuery()
  const rename = useRenameMutation()
  const [draft, setDraft] = useState(null)
  const trimmed = (draft ?? '').trim()
  const invalid = draft !== null && trimmed.length > 0 && !VALID.test(trimmed)

  const save = () => {
    if (!VALID.test(trimmed) || trimmed === me?.handle) return setDraft(null)
    rename.mutate(trimmed, { onSuccess: () => setDraft(null) })
  }

  if (draft === null) {
    const edit = () => setDraft(me?.handle ?? '')
    return (
      <>
        <Button variant="subtle" color="gray" size="xs" leftSection={<Pencil size={14} />} onClick={edit} visibleFrom="sm">
          Change stage name
        </Button>
        <ActionIcon variant="subtle" color="gray" aria-label="Edit stage name" onClick={edit} hiddenFrom="sm">
          <Pencil size={16} />
        </ActionIcon>
      </>
    )
  }

  return (
    <Group gap="4xs" align="flex-start" wrap="nowrap">
      <TextInput
        aria-label="Stage name"
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') setDraft(null)
        }}
        error={invalid ? '2-32 letters, numbers, spaces, . _ -' : rename.isError ? 'Could not save that name' : null}
        maxLength={32}
        size="sm"
        w={200}
        autoFocus
      />
      <ActionIcon size="lg" variant="default" aria-label="Save stage name" onClick={save} loading={rename.isPending}>
        <Check size={16} />
      </ActionIcon>
      <ActionIcon size="lg" variant="subtle" color="gray" aria-label="Cancel rename" onClick={() => setDraft(null)}>
        <X size={16} />
      </ActionIcon>
    </Group>
  )
}
