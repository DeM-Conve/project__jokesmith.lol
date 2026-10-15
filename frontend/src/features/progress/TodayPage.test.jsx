import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import { todayNew, todayRegular } from './test/fixtures.js'
import TodayPage from './TodayPage.jsx'
import { tipForDate } from './data/tips.js'

beforeEach(() => {
  http.reset()
  http.get('/me', { id: 'u1', handle: 'DryOtter42' })
})

test('a brand-new user gets the onboarding hero, not a wall of zeros', async () => {
  http.get('/progress/today', todayNew)
  renderWithProviders(<TodayPage />)
  const cta = await screen.findByRole('link', { name: /start with lesson 1/i })
  expect(cta).toHaveAttribute('href', '/learn/ANATOMY')
  for (const step of ['Learn', 'Practise', 'Workshop']) expect(screen.getByText(step)).toBeInTheDocument()
  expect(screen.queryByText(/day streak/)).not.toBeInTheDocument()
  expect(screen.getByText('Your first set')).toBeInTheDocument()
  expect(screen.getByText('X-ray a joke')).toBeInTheDocument()
  expect(await screen.findByText('DryOtter42')).toBeInTheDocument()
  expect(screen.getByText(tipForDate().text)).toBeInTheDocument()
})

test('a returning user sees streak, goal, rank and the next item to do', async () => {
  http.get('/progress/today', todayRegular)
  renderWithProviders(<TodayPage />)
  expect(await screen.findByText(/day streak/)).toBeInTheDocument()
  expect(screen.getByText('4')).toBeInTheDocument()
  expect(screen.getByText('40 XP to today\'s goal.')).toBeInTheDocument()
  expect(screen.getByText('Five-Minute Spot')).toBeInTheDocument()
  expect(screen.getByText('180 XP to Guest Spot')).toBeInTheDocument()
  expect(screen.getByText('1/4 done')).toBeInTheDocument()
  expect(screen.getByText('3 to go')).toBeInTheDocument()

  // the riff is done: no button; the first open item is the one to start
  const items = screen.getAllByRole('listitem')
  expect(items[0]).toHaveAttribute('data-done', 'true')
  expect(within(items[0]).queryByRole('link')).not.toBeInTheDocument()
  expect(within(items[1]).getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/punchup')
  expect(within(items[3]).getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/learn/FORMULAS')
})

test('rename the stage name inline with Enter', async () => {
  http.get('/progress/today', todayRegular)
  const put = vi.fn((body) => ({ id: 'u1', handle: body.handle }))
  http.put('/me', put)
  renderWithProviders(<TodayPage />)
  await screen.findByText('DryOtter42')
  await userEvent.click(screen.getByRole('button', { name: 'Change stage name' }))
  const input = screen.getByRole('textbox', { name: 'Stage name' })
  await userEvent.clear(input)
  await userEvent.type(input, 'Deadpan Dave{Enter}')
  expect(put).toHaveBeenCalledWith({ handle: 'Deadpan Dave' }, expect.anything())
  expect(await screen.findByText('Deadpan Dave')).toBeInTheDocument()
})

test('rename rejects invalid names and Escape cancels', async () => {
  http.get('/progress/today', todayRegular)
  renderWithProviders(<TodayPage />)
  await screen.findByText('DryOtter42')
  await userEvent.click(screen.getByRole('button', { name: 'Change stage name' }))
  const input = screen.getByRole('textbox', { name: 'Stage name' })
  await userEvent.clear(input)
  await userEvent.type(input, '<script>')
  expect(screen.getByText(/2-32 letters/)).toBeInTheDocument()
  fireEvent.keyDown(input, { key: 'Escape' })
  expect(screen.queryByRole('textbox', { name: 'Stage name' })).not.toBeInTheDocument()
})
