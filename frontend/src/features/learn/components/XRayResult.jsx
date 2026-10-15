import { Badge, Group, List, SimpleGrid, Stack, Text } from '@mantine/core'
import { Info } from 'lucide-react'
import Credit from './Credit.jsx'
import JokeLines from './JokeLines.jsx'
import Stage, { Eyebrow } from './Stage.jsx'
import { FORMULA_LABELS } from '../lib/words.js'
import classes from '../learn.module.css'

function Part({ n, label, children, hint }) {
  return (
    <div className={classes.step}>
      <Group gap="2xs" align="baseline">
        <Text fz="2xs" fw={700} c="var(--text-faint)">
          {n}
        </Text>
        <Text fz="2xs" fw={600} tt="uppercase" lts={1} c="var(--accent)">
          {label}
        </Text>
      </Group>
      <Text fz="md">{children}</Text>
      {hint && (
        <Text fz="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </div>
  )
}

/** The X-ray: the joke on stage, then its parts in Greg Dean's order. */
export default function XRayResult({ xray, title }) {
  const estimate = xray.source === 'ESTIMATE'
  return (
    <Stage data-testid="xray-result">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Eyebrow>{title ?? 'X-ray'}</Eyebrow>
          <Group gap="xs">
            <Badge color="amber" variant="filled">
              {xray.formulaLabel ?? FORMULA_LABELS[xray.formula]}
            </Badge>
            {xray.alsoSpotted?.map((f) => (
              <Badge key={f} color="gray" variant="default">
                + {FORMULA_LABELS[f]}
              </Badge>
            ))}
            <Badge color={estimate ? 'gray' : 'green'} variant="light">
              {estimate ? `Estimate · ${xray.confidence} confidence` : 'Hand-annotated'}
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <JokeLines setup={xray.setup} punchline={xray.punchline} punchWord={xray.punchWord} />
          <Credit credit={xray.credit} />
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          <Part n="1" label="Setup" hint={`${xray.wordCount} words in the whole joke`}>
            {xray.setup || <Text span c="dimmed">(no clear setup found)</Text>}
          </Part>
          <Part n="2" label="Target assumption">{xray.targetAssumption}</Part>
          <Part n="3" label="Connector">"{xray.connector}"</Part>
          <Part n="4" label="Reinterpretation">{xray.reinterpretation}</Part>
          <Part
            n="5"
            label="Punch word"
            hint={xray.punchWordLast ? 'It is the last word. Good.' : 'Not the last word. The joke trails after it.'}
          >
            "{xray.punchWord}"
          </Part>
          <Part n="6" label="Formula">
            {xray.formulaLabel ?? FORMULA_LABELS[xray.formula]}
          </Part>
        </SimpleGrid>

        <Stack gap="4xs">
          <Eyebrow c="var(--text-muted)">Why it works</Eyebrow>
          <Text fz="md" lh={1.6}>
            {xray.whyItWorks}
          </Text>
        </Stack>

        {xray.cues?.length > 0 && (
          <Stack gap="4xs">
            <Eyebrow c="var(--text-muted)">What the analyser spotted</Eyebrow>
            <List size="sm" c="dimmed" spacing="4xs">
              {xray.cues.map((c) => (
                <List.Item key={c}>{c}</List.Item>
              ))}
            </List>
          </Stack>
        )}
        {xray.tips?.length > 0 && (
          <Stack gap="4xs">
            <Eyebrow c="var(--warn)">Tighten it</Eyebrow>
            <List size="sm" spacing="4xs">
              {xray.tips.map((t) => (
                <List.Item key={t}>{t}</List.Item>
              ))}
            </List>
          </Stack>
        )}
        {estimate && (
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <Info size={14} color="var(--text-faint)" style={{ flexShrink: 0, marginTop: 3 }} />
            <Text fz="xs" c="var(--text-faint)">
              This is a rule-based estimate. It splits at the last sentence break, takes the last meaningful word as the
              punch word, and names a formula from surface cues (lists, "like", numbers, quoted advice). It can't truly
              understand a joke, so mark it up yourself and see where you disagree.
            </Text>
          </Group>
        )}
      </Stack>
    </Stage>
  )
}
