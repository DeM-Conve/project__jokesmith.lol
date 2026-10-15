import './testPolyfills.js'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { api } from '../../api/client.js'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import ArenaPage from './ArenaPage.jsx'

const pairs = [
  { left: { id: 1, setup: 'I joined a gym in January.', punchline: "So far I've lost forty dollars a month." },
    right: { id: 2, setup: 'My cat has a forty-dollar bed.', punchline: 'She sleeps in the box it came in.' } },
  { left: { id: 3, setup: 'I set eight alarms.', punchline: 'So I can win seven times before I lose.' },
    right: { id: 4, setup: 'My phone is at two percent.', punchline: "I've never been more focused." } },
]

beforeEach(() => {
  http.reset()
  http.get('/me', { id: 'u1', handle: 'DryOtter42' })
})

test('keyboard pick votes, reveals the rating swing, then deals the next duel', async () => {
  let n = 0
  http.get('/workshop/arena/pair', () => ({ ...pairs[Math.min(n, 1)], promptLabel: null, samePrompt: false, votesCast: n, nextXpIn: 10 - n }))
  http.post('/workshop/arena/votes', (body) => {
    expect(body).toEqual({ leftId: 1, rightId: 2, winnerId: 1 })
    n = 1
    return {
      skipped: false, left: { jokeId: 1, before: 1200, after: 1216 }, right: { jokeId: 2, before: 1200, after: 1184 },
      delta: 16, votesCast: 1, nextXpIn: 9, xpAwarded: false,
    }
  })
  renderWithProviders(<ArenaPage />, { route: '/arena' })
  expect(await screen.findByText(/lost forty dollars a month/)).toBeInTheDocument()
  // Anonymous: no handles or ratings before the vote.
  expect(screen.queryByText(/rating 1200/)).not.toBeInTheDocument()

  fireEvent.keyDown(window, { key: 'ArrowLeft' })
  expect(await screen.findByTestId('delta-left')).toHaveTextContent('+16')
  expect(screen.getByTestId('delta-right')).toHaveTextContent('−16')
  expect(screen.getByRole('button', { name: 'Pick the left joke' })).toHaveAttribute('data-state', 'won')

  expect(await screen.findByText(/seven times before I lose/, {}, { timeout: 3000 })).toBeInTheDocument()
  expect(screen.getByText('9 more to +10 Feedback XP')).toBeInTheDocument()
})

test('skip with the down arrow sends no winner; exhausted pool says so', async () => {
  let done = false
  http.get('/workshop/arena/pair', () =>
    done ? { left: null, right: null, samePrompt: false, votesCast: 0, nextXpIn: 10 } : { ...pairs[0], samePrompt: false, votesCast: 0, nextXpIn: 10 },
  )
  http.post('/workshop/arena/votes', (body) => {
    expect(body.winnerId).toBeNull()
    done = true
    return { skipped: true, left: null, right: null, delta: 0, votesCast: 0, nextXpIn: 10, xpAwarded: false }
  })
  renderWithProviders(<ArenaPage />, { route: '/arena' })
  await screen.findByText(/lost forty dollars a month/)
  fireEvent.keyDown(window, { key: 'ArrowDown' })
  expect(await screen.findByText(/judged every pair/, {}, { timeout: 3000 })).toBeInTheDocument()
})

test('leaderboard and my jokes tabs', async () => {
  http.get('/workshop/arena/leaderboard', {
    period: 'WEEK',
    jokes: [{ rank: 1, jokeId: 9, setup: 'S', punchline: 'The house special.', handle: 'The House', house: true, mine: false, rating: 1290, wins: 6, losses: 1, gained: 48 }],
    writers: [{ rank: 1, handle: 'DryOtter42', me: true, rating: 1234, jokes: 3, wins: 5, losses: 2 }],
  })
  renderWithProviders(<ArenaPage />, { route: '/arena?tab=leaders' })
  expect(await screen.findByText('The house special.')).toBeInTheDocument()
  expect(screen.getByText('+48 this week')).toBeInTheDocument()
  expect(screen.getByText(/DryOtter42/)).toBeInTheDocument()

  http.get('/workshop/arena/mine', {
    writerRating: 1234, writerRank: 1, votesCast: 12, nextXpIn: 8,
    jokes: [{ jokeId: 5, setup: 'Mine', punchline: 'My best one.', source: 'DAILY_RIFF', createdAt: '2026-10-15T10:00:00Z', inArena: true, rating: 1250, wins: 3, losses: 1, votes: 4, winRate: 75 }],
  })
  http.put('/workshop/jokes/5/arena', (body) => ({ id: 5, inArena: body.inArena }))
  fireEvent.click(screen.getByRole('tab', { name: /My jokes/ }))
  expect(await screen.findByText('75% wins')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('switch', { name: 'In the Arena' }))
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/workshop/jokes/5/arena', { inArena: false }))
})
