import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import DailyRiffPage from './DailyRiffPage.jsx'
import { localIsoDate } from './lib/riff.js'

const today = localIsoDate()
const base = { date: today, number: 288, setup: 'My landlord just texted "we need to talk."', bestJokeId: null }

beforeEach(() => {
  http.reset()
  http.get('/me', { id: 'u1', handle: 'DryOtter42' })
})

test('riff flow: start, add punchlines with Enter, finish, pick best, see peers', async () => {
  http.get(`/practice/riff/days/${today}`, { ...base, sessions: 0, punchlines: [], modelPunchlines: null })
  let posted
  http.post(`/practice/riff/days/${today}`, (body) => {
    posted = body
    return {
      saved: body.punchlines.length,
      xp: 5 * body.punchlines.length,
      skill: 'REAL_TIME_WIT',
      day: {
        ...base,
        sessions: 1,
        punchlines: body.punchlines.map((text, i) => ({ id: 100 + i, text })),
        modelPunchlines: ['He wants to talk about the damp. The damp wants to talk about him.'],
      },
    }
  })
  http.put(`/practice/riff/days/${today}/best`, (body) => ({
    ...base,
    sessions: 1,
    bestJokeId: body.jokeId,
    punchlines: posted.punchlines.map((text, i) => ({ id: 100 + i, text })),
    modelPunchlines: ['He wants to talk about the damp. The damp wants to talk about him.'],
  }))
  http.get(`/practice/riff/days/${today}/picks`, [
    { handle: 'SneakyGoose11', punchline: 'He means the rent. He always means the rent.', mine: false },
  ])

  renderWithProviders(<DailyRiffPage />, { route: '/riff' })
  expect(await screen.findByText(base.setup)).toBeInTheDocument()
  expect(screen.getByText(/Riff #288/)).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /start riffing/i }))
  const input = await screen.findByLabelText('Punchline')
  expect(screen.getByLabelText(/left$/)).toBeInTheDocument() // the visible timer

  for (const p of ['rent is going up', 'he is moving in', 'he found my drum kit', 'the walls are load-bearing gossip']) {
    fireEvent.change(input, { target: { value: p } })
    fireEvent.keyDown(input, { key: 'Enter' })
  }
  fireEvent.keyDown(input, { key: 'Enter' }) // empty input adds nothing
  expect(screen.getByTestId('riff-count')).toHaveTextContent('4')
  expect(screen.getByText(/exaggerat/i)).toBeInTheDocument() // nudge after 4

  fireEvent.click(screen.getByRole('button', { name: /i'm done/i }))
  await waitFor(() => expect(posted?.punchlines).toHaveLength(4))
  expect(posted.secondsUsed).toBeGreaterThanOrEqual(0)

  expect(await screen.findByText(/4 punchlines · \+20 xp/)).toBeInTheDocument()
  expect(screen.getByText(/The damp wants to talk about him/)).toBeInTheDocument()
  expect(screen.getByText(/Pick your best to see/)).toBeInTheDocument()

  const group = screen.getByRole('radiogroup', { name: 'Your punchlines' })
  fireEvent.click(within(group).getByText('he found my drum kit'))
  expect(await screen.findByText('He means the rent. He always means the rent.')).toBeInTheDocument()
  expect(screen.getByText('SneakyGoose11')).toBeInTheDocument()
  expect(within(group).getByRole('radio', { checked: true })).toHaveTextContent('he found my drum kit')
})

test('archive day shows the date and a way back to today', async () => {
  http.get('/practice/riff/days/2026-09-01', { ...base, date: '2026-09-01', number: 244, sessions: 0, punchlines: [], modelPunchlines: null })
  renderWithProviders(<DailyRiffPage />, { route: '/riff?date=2026-09-01' })
  expect(await screen.findByText(/Riff #244/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /back to today/i })).toBeInTheDocument()
})
