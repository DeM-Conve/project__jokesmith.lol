import { Group, Stack, Text, Title } from '@mantine/core'

/**
 * Every page starts with this: eyebrow (the skill it trains), title, one-line
 * description, actions on the right. Keeps pages lined up with each other.
 */
export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xl">
      <Stack gap="4xs">
        {eyebrow && (
          <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--accent)">
            {eyebrow}
          </Text>
        )}
        <Title order={1}>{title}</Title>
        {description && (
          <Text c="dimmed" fz="md" maw={640}>
            {description}
          </Text>
        )}
      </Stack>
      {actions && <Group gap="2xs">{actions}</Group>}
    </Group>
  )
}
