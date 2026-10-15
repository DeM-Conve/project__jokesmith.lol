import { AppShell, Burger, Group, NavLink, ScrollArea, Skeleton, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Suspense } from 'react'
import { NavLink as RouterLink, Route, Routes, useLocation } from 'react-router-dom'
import { useMeQuery } from './api/me.js'
import { NAV } from './nav.js'
import { ROUTES } from './routes.jsx'

function Logo() {
  return (
    <Text ff="var(--font-display)" fw={800} fz="xl" lts={-0.5}>
      punchl<span style={{ color: 'var(--accent)' }}>.in</span>
    </Text>
  )
}

function Sidebar({ onNavigate }) {
  const { pathname } = useLocation()
  const { data: me } = useMeQuery()
  const isActive = (to) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`))
  return (
    <Stack gap="md" h="100%">
      <ScrollArea flex={1}>
        <Stack gap="md">
          {NAV.map(({ section, items }) => (
            <Stack key={section ?? 'root'} gap="5xs">
              {section && (
                <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c="var(--text-faint)" px="sm" mb="4xs">
                  {section}
                </Text>
              )}
              {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  component={RouterLink}
                  to={to}
                  label={label}
                  leftSection={<Icon size={16} />}
                  active={isActive(to)}
                  onClick={onNavigate}
                  variant="light"
                  style={{ borderRadius: 'var(--mantine-radius-md)' }}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </ScrollArea>
      {me && (
        <Text fz="xs" c="dimmed" px="sm">
          on stage as <b style={{ color: 'var(--text)' }}>{me.handle}</b>
        </Text>
      )}
    </Stack>
  )
}

export default function App() {
  const [opened, { toggle, close }] = useDisclosure()
  return (
    <AppShell
      header={{ height: 56, collapsed: false }}
      navbar={{ width: 248, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="xl"
      styles={{
        header: { background: 'var(--bg)', borderColor: 'var(--border)' },
        navbar: { background: 'var(--bg)', borderColor: 'var(--border)' },
      }}
    >
      <AppShell.Header px="md">
        <Group h="100%" gap="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Logo />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm">
        <Sidebar onNavigate={close} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Suspense fallback={<Skeleton h={240} radius="lg" />}>
          <Routes>
            {ROUTES.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  )
}
