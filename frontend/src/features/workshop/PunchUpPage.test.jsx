import './testPolyfills.js'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { api } from '../../api/client.js'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import { critique, v1, v2 } from './fixtures.js'
import PunchUpPage from './PunchUpPage.jsx'

const diagnosed = { id: 7, stage: 'DIAGNOSED', originJokeId: null, versions: [v1], critique: null, movesUnlocked: false, latestInArena: false }
const rewritten = { ...diagnosed, stage: 'REWRITTEN', versions: [v1, v2], critique, movesUnlocked: true }

beforeEach(() => {
  http.reset()
  http.get('/me', { id: 'u1', handle: 'DryOtter42' })
  http.get('/workshop/punchup', [])
})

test('diagnose, rewrite, critique, then moves: the Socratic loop', async () => {
  let session = diagnosed
  http.post('/workshop/punchup', () => session)
  http.get('/workshop/punchup/7', () => session)
  http.post('/workshop/punchup/7/rewrites', (body) => {
    expect(body).toEqual({ setup: v2.setup, punchline: v2.punchline })
    session = rewritten
    return session
  })
  http.get('/workshop/punchup/7/moves', {
    jokeId: 12,
    moves: [{ fix: null, label: 'Explore', instruction: 'Write three alternative last words for the punchline.', words: [], example: null }],
  })

  renderWithProviders(<PunchUpPage />, { route: '/punchup' })
  fireEvent.change(screen.getByLabelText(/^Setup/), { target: { value: v1.setup } })
  fireEvent.change(screen.getByLabelText(/^Punchline/), { target: { value: v1.punchline } })
  fireEvent.click(screen.getByRole('button', { name: /Diagnose it/ }))

  // Stage 1: specific flags, a question each, and a worked example next to each flag.
  expect(await screen.findByText('End on a strong word')).toBeInTheDocument()
  expect(screen.getByText(/Can the sentence end right there\?/)).toBeInTheDocument()
  expect(screen.getAllByTestId('example')).toHaveLength(2)
  // Filler words are marked inside the joke itself.
  expect(document.querySelector('[data-mark="filler"]')).toHaveTextContent('really')
  // Moves stay locked until the user has tried.
  expect(screen.getByRole('button', { name: /Show me rewrite moves/ })).toBeDisabled()

  fireEvent.change(screen.getByLabelText(/^Setup/), { target: { value: v2.setup } })
  fireEvent.change(screen.getByLabelText(/^Punchline/), { target: { value: v2.punchline } })
  fireEvent.click(screen.getByRole('button', { name: /Submit rewrite/ }))

  // Stage 2: before/after critique with the word diff.
  const crit = await screen.findByTestId('critique')
  expect(within(crit).getByText('18 → 12')).toBeInTheDocument()
  expect(within(crit).getByText('2 → 0')).toBeInTheDocument()
  expect(within(screen.getByTestId('diff')).getByText('me')).toHaveAttribute('data-op', 'REMOVED')

  fireEvent.click(screen.getByRole('button', { name: /Show me rewrite moves/ }))
  expect(await screen.findByText(/three alternative last words/)).toBeInTheDocument()
})

test('starts from a notebook joke via ?joke=', async () => {
  http.post('/workshop/punchup', (body) => {
    expect(body).toEqual({ fromJokeId: 42 })
    return { ...diagnosed, originJokeId: 42 }
  })
  http.get('/workshop/punchup/7', { ...diagnosed, originJokeId: 42 })
  renderWithProviders(<PunchUpPage />, { route: '/punchup?joke=42' })
  expect(await screen.findByText('Cut the filler')).toBeInTheDocument()
  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1))
})
