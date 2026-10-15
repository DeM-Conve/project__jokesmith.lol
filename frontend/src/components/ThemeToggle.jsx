import { ActionIcon, Menu, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { Check, Monitor, Moon, Sun } from 'lucide-react'

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'auto', label: 'System', icon: Monitor },
]

/** Light / Dark / System. Per device: Mantine keeps the choice in localStorage. */
export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const computed = useComputedColorScheme('dark')
  const Icon = computed === 'light' ? Sun : Moon
  return (
    <Menu position="bottom-end" width={160}>
      <Menu.Target>
        <Tooltip label="Theme">
          <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Theme">
            <Icon size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        {OPTIONS.map(({ value, label, icon: ItemIcon }) => (
          <Menu.Item
            key={value}
            leftSection={<ItemIcon size={16} />}
            rightSection={colorScheme === value ? <Check size={14} /> : null}
            onClick={() => setColorScheme(value)}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
