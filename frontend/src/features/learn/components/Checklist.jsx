import { Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { Check, X } from 'lucide-react'

/** The rule-based coach's verdict: one line per craft rule, with a concrete tip for misses. */
export default function Checklist({ checks, showPassedTips = false }) {
  return (
    <Stack gap="xs" component="ul" p={0} m={0} style={{ listStyle: 'none' }}>
      {checks.map((c) => (
        <Group key={c.key} component="li" gap="sm" align="flex-start" wrap="nowrap">
          <ThemeIcon
            size={22}
            radius="xl"
            variant="light"
            color={c.passed ? 'green' : 'red'}
            aria-label={c.passed ? 'passed' : 'missed'}
          >
            {c.passed ? <Check size={14} /> : <X size={14} />}
          </ThemeIcon>
          <Stack gap="5xs">
            <Text fz="md" fw={600} >
              {c.label}
            </Text>
            {(!c.passed || showPassedTips) && c.tip && (
              <Text fz="sm" c="dimmed">
                {c.tip}
              </Text>
            )}
          </Stack>
        </Group>
      ))}
    </Stack>
  )
}
