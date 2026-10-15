import { Alert, Badge, Button, Group, List, SimpleGrid, Skeleton, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import { ArrowDownToLine, Check, Dices, RotateCcw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import { useGymAttemptMutation, useGymQuery, useGymStatsQuery, usePremiseQuery } from './api.js'
import Checklist from './components/Checklist.jsx'
import Credit from './components/Credit.jsx'
import JokeLines from './components/JokeLines.jsx'
import ModelAnswers from './components/ModelAnswers.jsx'
import Stage, { Eyebrow } from './components/Stage.jsx'
import { fillTemplate, parseTemplate } from './lib/words.js'
import classes from './learn.module.css'

function FormulaPicker({ formulas, stats, value, onChange }) {
  const reps = Object.fromEntries((stats ?? []).map((s) => [s.formula, s]))
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="xs" role="tablist" aria-label="Formulas">
      {formulas.map((f) => {
        const s = reps[f.key]
        const active = f.key === value
        return (
          <UnstyledButton
            key={f.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.key)}
            className={`${classes.gridCard} ${active ? classes.gridCardActive : ''}`}
          >
            <Stack gap="4xs">
              <Text ff="var(--font-display)" fw={700} fz="md" c={active ? 'var(--accent)' : 'var(--text)'}>
                {f.label}
              </Text>
              <Text fz="2xs" c="dimmed">
                {s?.reps ? `${s.reps} rep${s.reps === 1 ? '' : 's'} · best ${s.bestPassed}/${s.bestTotal}` : 'No reps yet'}
              </Text>
            </Stack>
          </UnstyledButton>
        )
      })}
    </SimpleGrid>
  )
}

/** Fill-in-the-blank version of the formula; "use it" copies the result into the draft. */
function Scaffold({ formula, onUse }) {
  const setupParts = parseTemplate(formula.templateSetup)
  const punchParts = parseTemplate(formula.templatePunchline).map((p) => (p.type === 'blank' ? { ...p, id: p.id + 100 } : p))
  const [values, setValues] = useState({})
  const set = (id, v) => setValues((old) => ({ ...old, [id]: v }))
  const filled = Object.values(values).some((v) => v?.trim())

  const renderParts = (parts) =>
    parts.map((p, i) =>
      p.type === 'text' ? (
        <span key={i}>{p.text}</span>
      ) : (
        <TextInput
          key={i}
          aria-label={p.label}
          placeholder={p.label}
          value={values[p.id] ?? ''}
          onChange={(e) => set(p.id, e.currentTarget.value)}
          size="sm"
          display="inline-block"
          mx="4xs"
          my="5xs"
          w={Math.max(160, Math.min(320, p.label.length * 8))}
        />
      ),
    )

  return (
    <Stack gap="sm">
      <Eyebrow c="var(--text-muted)">Scaffold: fill the blanks for your premise</Eyebrow>
      <Text fz="lg" ff="var(--font-display)" c="dimmed" lh={2.2} component="div">
        {renderParts(setupParts)}
      </Text>
      <Text fz="lg" ff="var(--font-display)" fw={700} lh={2.2} component="div">
        {renderParts(punchParts)}
      </Text>
      <Group>
        <Button
          variant="default"
          size="xs"
          leftSection={<ArrowDownToLine size={14} />}
          disabled={!filled}
          onClick={() => onUse(fillTemplate(setupParts, values), fillTemplate(punchParts, values))}
        >
          Use this as my draft
        </Button>
      </Group>
    </Stack>
  )
}

function Drill({ formula, premiseCount }) {
  const [draw, setDraw] = useState(0)
  const [lastPremise, setLastPremise] = useState(null)
  const premise = usePremiseQuery(formula.key, draw, lastPremise)
  const [setup, setSetup] = useState('')
  const [punchline, setPunchline] = useState('')
  const attempt = useGymAttemptMutation()
  const feedback = attempt.data

  const newPremise = () => {
    setLastPremise(premise.data?.id ?? null)
    setDraw((d) => d + 1)
    setSetup('')
    setPunchline('')
    attempt.reset()
  }

  const submit = () => {
    if (!premise.data || !punchline.trim() || attempt.isPending) return
    attempt.mutate({ formula: formula.key, premiseId: premise.data.id, setup: setup.trim(), punchline: punchline.trim() })
  }

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Stack gap="sm">
          <Text ff="var(--font-display)" fw={800} fz="2xl" lh={1.15}>
            {formula.oneLiner}
          </Text>
          <Text c="dimmed" fz="md" lh={1.6}>
            {formula.howItWorks}
          </Text>
        </Stack>
        <Stack gap="sm" className={classes.gridCard}>
          <Eyebrow c="var(--text-muted)">Example</Eyebrow>
          <Stack gap="4xs">
            <JokeLines setup={formula.exampleSetup} punchline={formula.examplePunchline} size="sm" />
            <Credit credit={formula.exampleCredit} size="xs" />
          </Stack>
          <List size="sm" c="dimmed" spacing="4xs" icon={<Check size={14} color="var(--accent)" />}>
            {formula.tips.map((t) => (
              <List.Item key={t}>{t}</List.Item>
            ))}
          </List>
        </Stack>
      </SimpleGrid>

      <Stage>
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap="4xs">
              <Eyebrow>Your premise</Eyebrow>
              {premise.isLoading ? (
                <Skeleton h={40} w={260} />
              ) : (
                <Text ff="var(--font-display)" fw={800} fz="3xl" lh={1.1} data-testid="premise">
                  {premise.data?.text ?? 'No premise'}
                </Text>
              )}
              {premise.data && (
                <Text fz="xs" c="dimmed">
                  {premise.data.category} · one of {premiseCount} premises
                </Text>
              )}
            </Stack>
            <Button variant="subtle" color="gray" leftSection={<Dices size={16} />} onClick={newPremise}>
              New premise
            </Button>
          </Group>

          {!feedback && (
            <Scaffold
              key={`${formula.key}-${draw}`}
              formula={formula}
              onUse={(s, p) => {
                setSetup(s)
                setPunchline(p)
              }}
            />
          )}

          <Stack gap="sm">
            <Eyebrow c="var(--text-muted)">{feedback ? 'Your joke' : 'Free attempt: your own words'}</Eyebrow>
            <TextInput
              label="Setup"
              placeholder="Build the assumption"
              value={setup}
              onChange={(e) => setSetup(e.currentTarget.value)}
              readOnly={Boolean(feedback)}
              size="md"
              styles={{ input: { fontFamily: 'var(--font-display)' } }}
            />
            <TextInput
              label="Punchline"
              placeholder="The turn, ending on the punch word (Enter to check)"
              value={punchline}
              onChange={(e) => setPunchline(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              readOnly={Boolean(feedback)}
              size="lg"
              styles={{ input: { fontFamily: 'var(--font-display)', fontWeight: 700 } }}
            />
            {attempt.isError && (
              <Alert color="red" variant="light" icon={<TriangleAlert size={16} />}>
                Couldn't check that one. Try again.
              </Alert>
            )}
            {!feedback && (
              <Group justify="flex-end">
                <Button onClick={submit} loading={attempt.isPending} disabled={!punchline.trim() || !premise.data}>
                  Check my joke
                </Button>
              </Group>
            )}
          </Stack>
        </Stack>
      </Stage>

      {feedback && (
        <Stack gap="lg" data-testid="gym-feedback">
          <Group gap="sm" align="center">
            <Text ff="var(--font-display)" fw={800} fz="3xl" lh={1}>
              {feedback.passed}/{feedback.total}
            </Text>
            <Stack gap={0}>
              <Text fw={700}>{feedback.headline}</Text>
              <Text fz="xs" c="dimmed">
                +{feedback.xpAwarded} XP · saved to your Bit Notebook
              </Text>
            </Stack>
          </Group>
          <Checklist checks={feedback.checks} />
          <Text fz="md" c="var(--accent)" fw={600}>
            {feedback.nextRep}
          </Text>
          <ModelAnswers answers={feedback.modelAnswers} />
          <Group gap="xs">
            <Button variant="default" leftSection={<RotateCcw size={16} />} onClick={() => attempt.reset()}>
              Rewrite this one
            </Button>
            <Button variant="default" leftSection={<Dices size={16} />} onClick={newPremise}>
              Next premise
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  )
}

export default function FormulaGymPage() {
  const gym = useGymQuery()
  const stats = useGymStatsQuery()
  const [selected, setSelected] = useState(null)
  const formulas = gym.data?.formulas ?? []
  const formula = formulas.find((f) => f.key === selected) ?? formulas[0]

  return (
    <Stack gap="xl" maw={1040}>
      <PageHeader
        eyebrow="Formulas"
        title="Formula Gym"
        description="One formula per drill. Learn the move, fill the scaffold, then write your own on a random premise. Every rep gets a craft checklist and model answers."
        actions={
          stats.data && (
            <Badge variant="default" color="gray" size="lg">
              {stats.data.reduce((n, s) => n + s.reps, 0)} reps
            </Badge>
          )
        }
      />
      {gym.isLoading && <Skeleton h={300} radius="lg" />}
      {gym.isError && (
        <Alert color="red" variant="light" icon={<TriangleAlert size={16} />}>
          The gym is closed for a moment (couldn't load the drills).
        </Alert>
      )}
      {formula && (
        <>
          <FormulaPicker formulas={formulas} stats={stats.data} value={formula.key} onChange={setSelected} />
          <Drill key={formula.key} formula={formula} premiseCount={gym.data.premiseCount} />
        </>
      )}
    </Stack>
  )
}
