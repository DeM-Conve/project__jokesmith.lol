import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/render.jsx'
import ThemeToggle from './ThemeToggle.jsx'

test('switches the color scheme and remembers it', async () => {
  const user = userEvent.setup()
  renderWithProviders(<ThemeToggle />)
  await user.click(screen.getByRole('button', { name: 'Theme' }))
  await user.click(await screen.findByText('Light'))
  expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'light')
  expect(localStorage.getItem('mantine-color-scheme-value')).toBe('light')

  await user.click(screen.getByRole('button', { name: 'Theme' }))
  await user.click(await screen.findByText('Dark'))
  expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark')
})
