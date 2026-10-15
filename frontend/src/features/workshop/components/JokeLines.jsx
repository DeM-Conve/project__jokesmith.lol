import { Box, Stack, Text } from '@mantine/core'
import classes from '../workshop.module.css'

const SIZES = {
  sm: { setup: 'sm', punch: 'lg' },
  md: { setup: 'md', punch: 'xl' },
  lg: { setup: 'lg', punch: '2xl' },
  xl: { setup: 'xl', punch: '3xl' },
}

const norm = (w) => w.toLowerCase().replace(/[’]/g, "'")

/**
 * Splits text into words and separators, wrapping marked words. `marks` maps a mark kind
 * ('filler' | 'punch' | 'weak') to a list of words or phrases (case-insensitive).
 */
export function Marked({ text, marks }) {
  if (!marks || !text) return text
  const phrases = []
  for (const [kind, words] of Object.entries(marks)) {
    for (const w of words ?? []) if (w) phrases.push({ kind, parts: norm(w).split(/\s+/) })
  }
  if (phrases.length === 0) return text
  const tokens = text.split(/([\p{L}\p{N}'’-]+)/u)
  const out = []
  let i = 0
  while (i < tokens.length) {
    const tok = tokens[i]
    let matched = null
    if (i % 2 === 1) {
      for (const p of phrases) {
        const ok = p.parts.every((part, k) => tokens[i + 2 * k] !== undefined && norm(tokens[i + 2 * k]) === part)
        if (ok && (!matched || p.parts.length > matched.parts.length)) matched = p
      }
    }
    if (matched) {
      const span = tokens.slice(i, i + matched.parts.length * 2 - 1).join('')
      const cls = { filler: classes.markFiller, punch: classes.markPunch, weak: classes.markWeak }[matched.kind]
      out.push(
        <span key={i} className={cls} data-mark={matched.kind}>
          {span}
        </span>,
      )
      i += matched.parts.length * 2 - 1
    } else {
      out.push(tok)
      i += 1
    }
  }
  return out
}

/** A joke as the hero: muted setup line, big display-face punchline. */
export default function JokeLines({ setup, punchline, size = 'md', marks, ...rest }) {
  const s = SIZES[size] ?? SIZES.md
  return (
    <Stack gap="4xs" {...rest}>
      {setup ? (
        <Text className={classes.setup} fz={s.setup}>
          <Marked text={setup} marks={marks} />
        </Text>
      ) : null}
      <Text className={classes.display} fz={s.punch}>
        <Marked text={punchline} marks={marks} />
      </Text>
    </Stack>
  )
}

/** The spotlit card. */
export function Stage({ children, p = 'xl', ...rest }) {
  return (
    <Box className={classes.stage} p={p} {...rest}>
      {children}
    </Box>
  )
}

/** A quiet bordered panel. */
export function Panel({ children, p = 'md', className, ...rest }) {
  return (
    <Box className={[classes.panel, className].filter(Boolean).join(' ')} p={p} {...rest}>
      {children}
    </Box>
  )
}

export function Eyebrow({ children, c = 'var(--text-faint)', ...rest }) {
  return (
    <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c={c} {...rest}>
      {children}
    </Text>
  )
}

export const SOURCE_LABEL = {
  DAILY_RIFF: 'Daily Riff',
  FORMULA_GYM: 'Formula Gym',
  PUNCH_UP: 'Punch-Up',
  BANTER: 'Banter',
  ASSOCIATION: 'Association',
  NOTEBOOK: 'Notebook',
  DELIVERY: 'Delivery',
}

/** /xray link for a joke (the learn feature owns that page). */
export function xrayHref(joke) {
  const text = [joke.setup, joke.punchline].filter(Boolean).join(' ')
  return `/xray?text=${encodeURIComponent(text)}`
}
