import { RingProgress, Stack, Text } from '@mantine/core'
import { formatClock } from '../lib/countdown.js'
import classes from '../practice.module.css'

/**
 * The big visible clock. Amber while there's time, mic-red for the last stretch.
 * `fraction` is the share of time left (1 -> 0).
 */
export default function Timer({ remaining, fraction, size = 132, label = 'left', urgentBelow = 0.2 }) {
  const urgent = fraction > 0 && fraction <= urgentBelow
  const color = urgent ? 'var(--mic)' : 'var(--accent)'
  return (
    <RingProgress
      size={size}
      thickness={Math.round(size / 14)}
      roundCaps
      sections={[{ value: Math.max(0, Math.min(100, fraction * 100)), color }]}
      rootColor="var(--surface-3)"
      aria-label={`${formatClock(remaining)} ${label}`}
      label={
        <Stack gap={0} align="center">
          <Text
            ff="var(--font-display)"
            fw={800}
            fz={size > 100 ? '3xl' : 'xl'}
            lh={1}
            c={urgent ? 'var(--mic)' : 'var(--text)'}
            className={urgent ? classes.urgent : undefined}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatClock(remaining)}
          </Text>
          {size > 100 && (
            <Text fz="2xs" tt="uppercase" lts={1.2} c="var(--text-faint)">
              {label}
            </Text>
          )}
        </Stack>
      }
    />
  )
}
