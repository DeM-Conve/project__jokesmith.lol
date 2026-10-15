import { screen } from '@testing-library/react'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import { radarFixture } from './test/fixtures.js'
import ProgressPage from './ProgressPage.jsx'

beforeEach(() => http.reset())

test('shows the radar, stats, calendar, reps and rank ladder', async () => {
  const data = radarFixture()
  http.get('/progress/radar', data)
  renderWithProviders(<ProgressPage />)
  expect(await screen.findByRole('img', { name: 'Skill radar' })).toBeInTheDocument()
  expect(screen.getByText('1,800')).toBeInTheDocument()
  expect(screen.getByText('31')).toBeInTheDocument() // jokes written
  expect(screen.getByText('3d')).toBeInTheDocument()
  expect(screen.getAllByTestId('heat-cell')).toHaveLength(data.days.length)
  expect(screen.getByRole('img', { name: 'Reps per day' })).toBeInTheDocument()
  expect(screen.getByText('Headliner')).toBeInTheDocument()
  expect(screen.getAllByText('Club Regular').length).toBeGreaterThan(0)
  expect(screen.getByText('700 XP to Road Dog')).toBeInTheDocument()
  expect(screen.getByText(/Quietest skill: Joke anatomy/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Delivery' })).toHaveAttribute('href', '/delivery')
})

test('an empty radar invites the first rep instead of showing zeros', async () => {
  http.get('/progress/radar', radarFixture({ empty: true }))
  renderWithProviders(<ProgressPage />)
  expect(await screen.findByText('Your radar is a blank stage')).toBeInTheDocument()
  expect(screen.queryByText('Total XP')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /today's set/i })).toHaveAttribute('href', '/')
})
