import { Badge, Group, Paper, Text } from '@mantine/core'
import { Lightbulb } from 'lucide-react'
import { tipForDate } from '../data/tips.js'

/** Comedy tip of the day, rotating at local midnight. */
export default function TipCard({ date }) {
  const tip = tipForDate(date)
  return (
    <Paper p="lg" radius="lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Group justify="space-between" mb="sm">
        <Group gap="2xs">
          <Lightbulb size={16} color="var(--accent)" />
          <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)">
            Tip of the day
          </Text>
        </Group>
        <Badge variant="light" color="gray" size="sm">
          {tip.category}
        </Badge>
      </Group>
      <Text ff="var(--font-display)" fw={500} fz="lg" lh={1.4}>
        {tip.text}
      </Text>
    </Paper>
  )
}
