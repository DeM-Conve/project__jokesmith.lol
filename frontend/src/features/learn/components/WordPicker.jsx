import { Group } from '@mantine/core'
import { tokens } from '../lib/words.js'
import classes from '../learn.module.css'

/**
 * A joke as clickable words. `words` is the token list (setup + punch); words at
 * index >= punchStart are styled as punchline. `marks` maps index -> 'selected' | 'correct' | 'wrong'.
 */
export default function WordPicker({ text, punchStart = null, marks = {}, onPick, disabled, label }) {
  const toks = tokens(text)
  return (
    <Group gap="4xs" role="group" aria-label={label ?? 'Words of the joke'} style={{ rowGap: 'var(--mantine-spacing-4xs)' }}>
      {toks.map((w, i) => {
        const mark = marks[i]
        const cls = [
          classes.word,
          punchStart != null && i >= punchStart ? classes.wordPunch : punchStart != null ? classes.wordSetup : '',
          mark === 'selected' && classes.wordSelected,
          mark === 'correct' && classes.wordCorrect,
          mark === 'wrong' && classes.wordWrong,
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <button
            key={`${i}-${w}`}
            type="button"
            className={cls}
            style={{ fontSize: 'var(--mantine-font-size-xl)' }}
            onClick={() => onPick?.(i, w)}
            disabled={disabled}
            aria-pressed={mark === 'selected'}
          >
            {w}
          </button>
        )
      })}
    </Group>
  )
}
