import { Stack, Text } from '@mantine/core'
import { lastIndexOfWord, tokens } from '../lib/words.js'
import classes from '../learn.module.css'

/** Highlights `punchWord` inside `text` (last occurrence). */
export function WithPunchWord({ text, punchWord }) {
  const toks = tokens(text)
  const at = punchWord ? lastIndexOfWord(toks, punchWord) : -1
  if (at < 0) return text
  return (
    <>
      {toks.slice(0, at).join(' ')}
      {at > 0 && ' '}
      <span className={classes.punchWord} data-testid="punch-word">{toks[at]}</span>
      {at < toks.length - 1 && ' '}
      {toks.slice(at + 1).join(' ')}
    </>
  )
}

/** A joke as the hero: quieter setup, loud punchline, punch word in the spotlight. */
export default function JokeLines({ setup, punchline, punchWord, size = 'lg' }) {
  const big = size === 'lg'
  return (
    <Stack gap="4xs">
      {setup && (
        <Text className={classes.jokeSetup} fz={big ? 'xl' : 'md'}>
          {setup}
        </Text>
      )}
      <Text className={classes.jokePunch} fz={big ? '2xl' : 'lg'}>
        <WithPunchWord text={punchline} punchWord={punchWord} />
      </Text>
    </Stack>
  )
}
