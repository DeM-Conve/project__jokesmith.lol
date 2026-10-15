import './testPolyfills.js'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { api } from '../../api/client.js'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import { note } from './fixtures.js'
import NotebookPage from './NotebookPage.jsx'

let jokes
beforeEach(() => {
  http.reset()
  jokes = [note(1, { tags: ['pets'], favourite: true }), note(2, { source: 'DAILY_RIFF', inArena: true, votes: 4, winRate: 50, rating: 1210 })]
  http.get('/me', { id: 'u1', handle: 'DryOtter42' })
  http.get('/workshop/jokes', () => jokes)
  http.get('/workshop/tags', [{ name: 'pets', count: 1 }])
  http.get('/workshop/bits', [])
})

test('lists jokes with actions; favourite, arena and x-ray', async () => {
  http.put('/workshop/jokes/2/favourite', (b) => ({ ...jokes[1], favourite: b.favourite }))
  http.put('/workshop/jokes/1/arena', (b) => ({ ...jokes[0], inArena: b.inArena }))
  renderWithProviders(<NotebookPage />, { route: '/notebook' })
  const cards = await screen.findAllByTestId('note')
  expect(cards).toHaveLength(2)
  expect(within(cards[0]).getByText('#pets')).toBeInTheDocument()
  expect(within(cards[1]).getByText('1210 · 50% of 4')).toBeInTheDocument()

  fireEvent.click(within(cards[1]).getByRole('button', { name: 'Favourite' }))
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/workshop/jokes/2/favourite', { favourite: true }))

  fireEvent.click(within(cards[0]).getByRole('button', { name: /Send to arena/ }))
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/workshop/jokes/1/arena', { inArena: true }))

  expect(within(cards[0]).getByRole('link', { name: /X-ray it/ })).toHaveAttribute('href', `/xray?text=${encodeURIComponent('Setup 1 Punchline 1')}`)
})

test('adds a joke manually and filters by search', async () => {
  http.post('/workshop/jokes', (b) => {
    jokes = [note(3, { setup: b.setup, punchline: b.punchline }), ...jokes]
    return jokes[0]
  })
  renderWithProviders(<NotebookPage />, { route: '/notebook' })
  await screen.findAllByTestId('note')
  fireEvent.click(screen.getByRole('button', { name: /New joke/ }))
  fireEvent.change(await screen.findByLabelText('Setup'), { target: { value: 'My dog greets me like I came home from war.' } })
  fireEvent.change(screen.getByLabelText('Punchline'), { target: { value: 'I went to get the mail.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add to notebook' }))
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith('/workshop/jokes', { setup: 'My dog greets me like I came home from war.', punchline: 'I went to get the mail.', tags: [] }),
  )
  expect(await screen.findByText('I went to get the mail.')).toBeInTheDocument()

  fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'mail' } })
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/workshop/jokes?q=mail'))
})

test('bits reorder and the callback finder', async () => {
  const bit = { id: 5, title: 'Pets', createdAt: '2026-10-15T10:00:00Z', jokes: [note(1), note(2)] }
  http.get('/workshop/bits', [bit])
  http.put('/workshop/bits/5/jokes', (b) => ({ ...bit, jokes: b.jokeIds.map((id) => note(id)) }))
  http.get('/workshop/callbacks', [
    { a: { id: 1, setup: 'I bought a smart fridge.', punchline: 'It judges me.' }, b: { id: 2, setup: 'My mom has two fridges.', punchline: 'One is for bags.' }, sharedWords: ['fridge'], score: 1.2, hint: "Both jokes live near 'fridge'." },
  ])
  renderWithProviders(<NotebookPage />, { route: '/notebook?tab=bits' })
  const card = await screen.findByTestId('bit')
  fireEvent.click(within(card).getByRole('button', { name: 'Move joke 2 up' }))
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/workshop/bits/5/jokes', { jokeIds: [2, 1] }))

  fireEvent.click(screen.getByRole('tab', { name: /Callback finder/ }))
  const list = await screen.findByTestId('callbacks')
  expect(within(list).getAllByText('fridge').length).toBeGreaterThanOrEqual(2) // badge + highlighted word
  expect(list.querySelector('[data-mark="punch"]')).toHaveTextContent('fridge')
  expect(within(list).getByText(/Both jokes live near/)).toBeInTheDocument()
})
