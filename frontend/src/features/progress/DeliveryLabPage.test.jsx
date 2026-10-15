import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import DeliveryLabPage from './DeliveryLabPage.jsx'
import { GOOD_TAKE } from './test/fixtures.js'

/** A recorder hook that "records" a prepared take. */
function fakeRecorder(raw, support = { mic: true, speech: true }) {
  return function useFake() {
    const [status, setStatus] = useState('idle')
    return {
      support,
      status,
      samples: [],
      transcript: '',
      elapsedMs: 0,
      start: () => setStatus('recording'),
      stop: async () => {
        setStatus('idle')
        return { ...raw, audioUrl: 'blob:take' }
      },
    }
  }
}

const BANK = [{ id: 7, setup: 'My dog is so lazy,', punchline: 'he hired a cat.', source: 'NOTEBOOK', createdAt: '2026-10-15T10:00:00Z' }]
const saved = (body) => ({ take: { id: 1, ...body }, xp: 25, totalTakes: 1 })

beforeEach(() => http.reset())

test('record a take of a banked joke: analysis, coaching, and only numbers are saved', async () => {
  http.get('/progress/delivery/jokes', BANK)
  const post = vi.fn(saved)
  http.post('/progress/delivery/takes', post)
  renderWithProviders(<DeliveryLabPage useRecorder={fakeRecorder(GOOD_TAKE)} />)

  expect(await screen.findByText('he hired a cat.')).toBeInTheDocument() // newest joke auto-picked
  await userEvent.click(screen.getByRole('button', { name: 'Start recording' }))
  expect(screen.getByText('● On air')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Stop recording' }))

  expect(await screen.findByText('Take 1')).toBeInTheDocument()
  expect(screen.getByText('0.70s')).toBeInTheDocument()
  expect(screen.getByText('Pause before the punch: 0.70s')).toBeInTheDocument()
  expect(screen.getByText("Coach's notes")).toBeInTheDocument()
  expect(await screen.findByText('+25 XP · Delivery')).toBeInTheDocument()

  expect(post).toHaveBeenCalledTimes(1)
  const body = post.mock.calls[0][0]
  expect(body).toMatchObject({ jokeId: 7, prePunchPauseMs: 700, punchLast: true, fillerCount: 0, transcript: GOOD_TAKE.transcript })
  expect(Object.keys(body)).not.toContain('audioUrl')
  expect(Object.keys(body)).not.toContain('samples')
})

test('typed joke, two takes, compared side by side', async () => {
  http.get('/progress/delivery/jokes', [])
  const post = vi.fn(saved)
  http.post('/progress/delivery/takes', post)
  renderWithProviders(<DeliveryLabPage useRecorder={fakeRecorder(GOOD_TAKE)} />)

  const mic = await screen.findByRole('button', { name: 'Start recording' })
  expect(mic).toBeDisabled() // no joke yet
  await userEvent.type(screen.getByLabelText('Setup'), 'My dog is so lazy,')
  await userEvent.type(screen.getByLabelText('Punchline'), 'he hired a cat.')
  for (let i = 0; i < 2; i++) {
    await userEvent.click(screen.getByRole('button', { name: 'Start recording' }))
    await userEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    await screen.findByText(`Take ${i + 1}`)
  }
  expect(screen.getByText("This session's takes")).toBeInTheDocument()
  await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
  expect(post.mock.calls[0][0]).toMatchObject({ setup: 'My dog is so lazy,', punchline: 'he hired a cat.' })
  expect(post.mock.calls[0][0].jokeId).toBeUndefined()
  await userEvent.click(screen.getByRole('button', { name: 'Show take 1' }))
  expect(screen.getByText('Take 1')).toBeInTheDocument()
})

test('a silent take is not saved', async () => {
  http.get('/progress/delivery/jokes', BANK)
  const post = vi.fn(saved)
  http.post('/progress/delivery/takes', post)
  const silent = { samples: [{ t: 0, level: 0 }, { t: 50, level: 0 }], transcript: '', durationMs: 100 }
  renderWithProviders(<DeliveryLabPage useRecorder={fakeRecorder(silent)} />)
  await screen.findByText('he hired a cat.')
  await userEvent.click(screen.getByRole('button', { name: 'Start recording' }))
  await userEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
  expect(await screen.findByText("We didn't hear anything.")).toBeInTheDocument()
  expect(post).not.toHaveBeenCalled()
})

test('degrades gracefully without mic or speech recognition', async () => {
  http.get('/progress/delivery/jokes', BANK)
  renderWithProviders(<DeliveryLabPage />) // the real hook: jsdom has no MediaRecorder
  expect(await screen.findByText("This browser can't record audio")).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Start recording' })).toBeDisabled()
})

test('without speech recognition, a notice explains what still works', async () => {
  http.get('/progress/delivery/jokes', BANK)
  renderWithProviders(<DeliveryLabPage useRecorder={fakeRecorder(GOOD_TAKE, { mic: true, speech: false })} />)
  expect(await screen.findByText('No live transcript in this browser')).toBeInTheDocument()
})
