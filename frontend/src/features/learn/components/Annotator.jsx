import { Alert, Badge, Button, Chip, Group, Stack, Text, TextInput } from '@mantine/core'
import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useAnnotateMutation } from '../api.js'
import { bare, FORMULA_LABELS, tokens } from '../lib/words.js'
import Checklist from './Checklist.jsx'
import Stage, { Eyebrow } from './Stage.jsx'
import WordPicker from './WordPicker.jsx'
import XRayResult from './XRayResult.jsx'

const PICKABLE = ['MISDIRECTION', 'RULE_OF_THREE', 'EXAGGERATION', 'COMPARISON', 'LITERAL', 'WORDPLAY', 'REVERSAL', 'MASHUP', 'ATTITUDE', 'CALLBACK']

/**
 * Self-annotation: the user marks where the punch starts, the punch word, the
 * formula and the assumption, then compares with the hand annotation (or the
 * analyser's estimate for a pasted joke).
 */
export default function Annotator({ text, galleryRef, onReset }) {
  const toks = tokens(text)
  const [punchStart, setPunchStart] = useState(null)
  const [punchWord, setPunchWord] = useState(null)
  const [formula, setFormula] = useState(null)
  const [assumption, setAssumption] = useState('')
  const annotate = useAnnotateMutation()
  const result = annotate.data

  const step = punchStart == null ? 1 : punchWord == null ? 2 : formula == null ? 3 : 4

  const pick = (i) => {
    if (result) return
    if (step === 1 || (step > 1 && i < punchStart)) {
      if (i === 0 && toks.length > 1) return
      setPunchStart(i)
      setPunchWord(null)
      return
    }
    setPunchWord(i)
  }

  const marks = {}
  if (punchWord != null) marks[punchWord] = 'selected'

  const submit = () => {
    if (punchStart == null || punchWord == null || !formula) return
    annotate.mutate({
      galleryRef: galleryRef ?? null,
      text: galleryRef ? null : text,
      punchline: toks.slice(punchStart).join(' '),
      punchWord: bare(toks[punchWord]),
      formula,
      assumption: assumption.trim(),
    })
  }

  const prompts = {
    1: 'Step 1: tap the first word of the punchline, where the picture starts to change.',
    2: 'Step 2: now tap the punch word, the single word that makes the second story undeniable.',
    3: 'Step 3: which formula is doing the work?',
    4: 'Step 4: in your own words, what does the setup make you assume?',
  }

  return (
    <Stack gap="lg">
      <Stage>
        <Stack gap="md">
          <Group justify="space-between">
            <Eyebrow>Mark it up yourself</Eyebrow>
            {!result && (
              <Badge variant="default" color="gray">
                Step {step} of 4
              </Badge>
            )}
          </Group>
          {!result && (
            <Text fz="md" fw={600} aria-live="polite">
              {prompts[step]}
            </Text>
          )}
          <WordPicker text={text} punchStart={punchStart} marks={marks} onPick={pick} disabled={Boolean(result)} />
          {step >= 3 && !result && (
            <Chip.Group multiple={false} value={formula} onChange={setFormula}>
              <Group gap="2xs">
                {PICKABLE.map((f) => (
                  <Chip key={f} value={f} size="sm" color="amber">
                    {FORMULA_LABELS[f]}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          )}
          {step >= 4 && !result && (
            <TextInput
              label="The target assumption"
              placeholder="Right before the punch, the audience believes…"
              value={assumption}
              onChange={(e) => setAssumption(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoFocus
            />
          )}
          {annotate.isError && (
            <Alert color="red" variant="light" icon={<TriangleAlert size={16} />}>
              Couldn't check that annotation. Try again.
            </Alert>
          )}
          {!result && (
            <Group justify="flex-end" gap="xs">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  setPunchStart(null)
                  setPunchWord(null)
                  setFormula(null)
                }}
              >
                Start over
              </Button>
              <Button variant="default" onClick={submit} disabled={step < 4} loading={annotate.isPending}>
                Compare with the X-ray
              </Button>
            </Group>
          )}
        </Stack>
      </Stage>

      {result && (
        <Stack gap="lg">
          <Stack gap="sm">
            <Group gap="sm">
              <Text ff="var(--font-display)" fw={800} fz="2xl">
                {result.passed}/{result.total}
              </Text>
              <Text c="dimmed">
                {result.passed === result.total
                  ? 'You read it like a writer.'
                  : result.passed >= result.total / 2
                    ? 'Close. Look at what you missed below.'
                    : 'Good rep. The breakdown below shows the machine.'}
              </Text>
            </Group>
            <Checklist checks={result.checks} showPassedTips />
          </Stack>
          <XRayResult
            xray={result.expected}
            title={result.comparedWith === 'HAND_ANNOTATED' ? 'The hand annotation' : "The analyser's estimate"}
          />
          {onReset && (
            <Group>
              <Button variant="default" onClick={onReset}>
                Try another joke
              </Button>
            </Group>
          )}
        </Stack>
      )}
    </Stack>
  )
}
