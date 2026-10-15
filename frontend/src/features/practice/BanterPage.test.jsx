import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import BanterPage from './BanterPage.jsx'

const setup = {
  personas: [
    { key: 'FRIEND', label: 'Friend', description: 'Your mate.', lines: 32 },
    { key: 'COWORKER', label: 'Coworker', description: 'Kitchen chat.', lines: 32 },
    { key: 'DATE', label: 'Date', description: 'Second date.', lines: 32 },
  ],
  techniques: [
    { key: 'REVERSAL', label: 'Reversal', description: 'Flip the expected stance.' },
    { key: 'EXAGGERATION', label: 'Exaggeration', description: 'Blow it up.' },
  ],
  timers: [15, 10, 5],
  rounds: 5,
}

const rounds = (first) => [
  { roundNo: 1, line: 'Ugh, Mondays.', result: first },
  ...[2, 3, 4, 5].map((n) => ({ roundNo: n, line: `line ${n}`, result: null })),
]
const result = {
  reply: 'I have aged a fiscal quarter since breakfast',
  timedOut: false,
  wit: 4,
  surprise: 4,
  kindness: 4,
  total: 12,
  verdict: 'Big laugh',
  spotted: 'EXAGGERATION',
  tip: 'Nice. Next level: reuse one of their exact words.',
  example: { technique: 'REVERSAL', label: 'Reversal', text: 'Honestly I love Mondays. It is the other six days.' },
  moreExamples: [{ technique: 'ROLE_PLAY', label: 'Role-play', text: 'In a world where the weekend lasted two days...' }],
  selfRating: null,
  saved: true,
}

beforeEach(() => {
  http.reset()
  http.get('/me', { id: 'u1', handle: 'DryOtter42' })
  http.get('/practice/banter/setup', setup)
})

test('pick a partner, reply to a line, get scored, rate yourself against the example', async () => {
  let started
  http.post('/practice/banter/sessions', (body) => {
    started = body
    return { id: 9, persona: body.persona, secondsLimit: body.secondsLimit, rounds: rounds(null), complete: false, xp: null }
  })
  let replied
  http.post('/practice/banter/sessions/9/rounds/1/reply', (body) => {
    replied = body
    return { id: 9, persona: 'COWORKER', secondsLimit: 5, rounds: rounds(result), complete: false, xp: null }
  })
  http.put('/practice/banter/sessions/9/rounds/1/self-rating', (body) => ({
    id: 9, persona: 'COWORKER', secondsLimit: 5, rounds: rounds({ ...result, selfRating: body.rating }), complete: false, xp: null,
  }))

  renderWithProviders(<BanterPage />, { route: '/banter' })
  fireEvent.click(await screen.findByText('Coworker'))
  fireEvent.click(screen.getByRole('radio', { name: '5s' }))
  fireEvent.click(screen.getByRole('button', { name: /start 5 rounds/i }))
  await waitFor(() => expect(started).toEqual({ persona: 'COWORKER', secondsLimit: 5 }))

  expect(await screen.findByText('Ugh, Mondays.')).toBeInTheDocument()
  expect(screen.getByLabelText(/seconds left/)).toBeInTheDocument()
  const input = screen.getByLabelText('Your reply')
  fireEvent.change(input, { target: { value: result.reply } })
  fireEvent.keyDown(input, { key: 'Enter' })
  await waitFor(() => expect(replied?.reply).toBe(result.reply))
  expect(replied.responseMs).toBeGreaterThanOrEqual(0)

  expect(await screen.findByText('Big laugh')).toBeInTheDocument()
  expect(screen.getByText(/reuse one of their exact words/)).toBeInTheDocument()
  expect(screen.getByText(/I love Mondays/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /next line/i })).toBeDisabled()

  fireEvent.click(screen.getByRole('button', { name: /mine was better/i }))
  expect(await screen.findByText(/in your joke bank/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /next line/i }))
  expect(await screen.findByText('line 2')).toBeInTheDocument()
  expect(screen.getByText('Round 2 of 5')).toBeInTheDocument()
})
