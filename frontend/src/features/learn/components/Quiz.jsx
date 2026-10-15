import { Badge, Button, Group, Progress, Stack, Text, UnstyledButton } from '@mantine/core'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { bare, tokens } from '../lib/words.js'
import JokeLines from './JokeLines.jsx'
import WordPicker from './WordPicker.jsx'
import classes from '../learn.module.css'

function ChoiceQuestion({ q, picked, onPick }) {
  const answered = picked != null
  return (
    <Stack gap="2xs" role="radiogroup" aria-label={q.prompt}>
      {q.options.map((opt, i) => {
        const isAnswer = i === q.answer
        const isPicked = i === picked
        const state = !answered ? null : isAnswer ? 'correct' : isPicked ? 'wrong' : null
        return (
          <UnstyledButton
            key={i}
            role="radio"
            aria-checked={isPicked}
            disabled={answered}
            onClick={() => onPick(i)}
            className={`${classes.gridCard} ${isPicked ? classes.gridCardActive : ''}`}
            style={{
              borderColor: state === 'correct' ? 'var(--good)' : state === 'wrong' ? 'var(--bad)' : undefined,
            }}
          >
            <Group gap="sm" wrap="nowrap">
              <Badge variant={state ? 'filled' : 'default'} color={state === 'correct' ? 'green' : state === 'wrong' ? 'red' : 'gray'} circle>
                {state === 'correct' ? <Check size={12} /> : state === 'wrong' ? <X size={12} /> : String.fromCharCode(65 + i)}
              </Badge>
              <Text fz="md">{opt}</Text>
            </Group>
          </UnstyledButton>
        )
      })}
    </Stack>
  )
}

function WordQuestion({ q, picked, onPick }) {
  const text = `${q.joke.setup} ${q.joke.punchline}`
  const punchStart = tokens(q.joke.setup).length
  const answered = picked != null
  const toks = tokens(text)
  const marks = {}
  if (answered) {
    toks.forEach((w, i) => {
      if (bare(w) === bare(q.answer)) marks[i] = 'correct'
    })
    if (marks[picked] !== 'correct') marks[picked] = 'wrong'
  }
  return (
    <WordPicker
      text={text}
      punchStart={punchStart}
      marks={marks}
      disabled={answered}
      onPick={(i) => onPick(i)}
      label="Tap a word"
    />
  )
}

function isCorrect(q, picked) {
  if (picked == null) return false
  if (q.kind === 'word') {
    const toks = tokens(`${q.joke.setup} ${q.joke.punchline}`)
    return bare(toks[picked]) === bare(q.answer)
  }
  return picked === q.answer
}

/** Lesson check: one question at a time, instant explanation, score at the end. */
export default function Quiz({ questions, onDone }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const q = questions[index]
  const picked = answers[index]
  const answered = picked != null
  const done = answers.filter((a) => a != null).length === questions.length && index === questions.length - 1 && answered
  const correctCount = questions.reduce((n, qq, i) => n + (isCorrect(qq, answers[i]) ? 1 : 0), 0)

  const pick = (value) => {
    if (answered) return
    const next = [...answers]
    next[index] = value
    setAnswers(next)
    if (next.filter((a) => a != null).length === questions.length) {
      onDone?.(questions.reduce((n, qq, i) => n + (isCorrect(qq, next[i]) ? 1 : 0), 0), questions.length)
    }
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fz="sm" c="dimmed">
          Question {index + 1} of {questions.length}
        </Text>
        <Text fz="sm" c="dimmed">
          {correctCount} correct
        </Text>
      </Group>
      <Progress value={((index + (answered ? 1 : 0)) / questions.length) * 100} size="xs" />
      <Text ff="var(--font-display)" fw={700} fz="xl">
        {q.prompt}
      </Text>
      {q.kind === 'choice' && q.joke && <JokeLines setup={q.joke.setup} punchline={q.joke.punchline} size="sm" />}
      {q.kind === 'word' ? (
        <WordQuestion q={q} picked={picked} onPick={pick} />
      ) : (
        <ChoiceQuestion q={q} picked={picked} onPick={pick} />
      )}
      {answered && (
        <Stack gap="2xs" p="md" bg="var(--surface-2)" style={{ borderRadius: 'var(--mantine-radius-md)' }} aria-live="polite">
          <Text fw={700} c={isCorrect(q, picked) ? 'var(--good)' : 'var(--bad)'}>
            {isCorrect(q, picked) ? 'Nailed it.' : q.kind === 'word' ? `Not quite. It's "${q.answer}".` : 'Not quite.'}
          </Text>
          <Text fz="md" c="dimmed">
            {q.explain}
          </Text>
        </Stack>
      )}
      <Group justify="flex-end" gap="xs">
        {index > 0 && (
          <Button variant="subtle" color="gray" onClick={() => setIndex(index - 1)}>
            Back
          </Button>
        )}
        {index < questions.length - 1 && (
          <Button variant="default" disabled={!answered} onClick={() => setIndex(index + 1)}>
            Next question
          </Button>
        )}
        {done && (
          <Text fw={700} c="var(--accent)" aria-live="polite">
            Quiz done: {correctCount}/{questions.length}
          </Text>
        )}
      </Group>
    </Stack>
  )
}
