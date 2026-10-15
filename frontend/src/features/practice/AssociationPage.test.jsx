import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import AssociationPage from './AssociationPage.jsx'

const categories = [
  { key: 'PEOPLE', label: 'People', hint: 'Who?' },
  { key: 'PLACES', label: 'Places', hint: 'Where?' },
  { key: 'THINGS', label: 'Things', hint: 'What?' },
  { key: 'PHRASES', label: 'Phrases', hint: 'Said?' },
  { key: 'FEELINGS', label: 'Feelings', hint: 'Felt?' },
]

const map = {
  id: 4,
  topic: 'Dentist',
  curatedTopic: 'Dentist',
  items: [
    { category: 'PEOPLE', text: 'the hygienist' },
    { category: 'FEELINGS', text: 'betrayal' },
  ],
  suggestions: { THINGS: ['the spit sucker'] },
  collisions: [
    {
      a: { category: 'PEOPLE', text: 'the hygienist', suggested: false },
      b: { category: 'FEELINGS', text: 'betrayal', suggested: false },
      surprise: 4,
      why: 'Different worlds.',
      prompt: 'When does the hygienist make you feel betrayal?',
    },
  ],
  tips: ['Be specific.'],
  jokes: 0,
}

beforeEach(() => {
  http.reset()
  http.get('/me', { id: 'u1', handle: 'DryOtter42' })
  http.get('/practice/associate/topics', { topics: ['Dentist'], categories, tips: ['Be specific.'] })
})

test('topic, timed brainstorm, collisions, then a joke', async () => {
  let started
  http.post('/practice/associate/sessions', (body) => {
    started = body
    return map
  })
  let joke
  http.post('/practice/associate/sessions/4/jokes', (body) => {
    joke = body
    return { jokeId: 1, xp: 25, jokes: 1 }
  })

  renderWithProviders(<AssociationPage />, { route: '/associate' })
  fireEvent.click(await screen.findByText('Dentist'))
  expect(screen.getByLabelText(/left$/)).toBeInTheDocument()

  const people = screen.getByLabelText('Add to People')
  fireEvent.change(people, { target: { value: 'the hygienist' } })
  fireEvent.keyDown(people, { key: 'Enter' })
  const feelings = screen.getByLabelText('Add to Feelings')
  fireEvent.change(feelings, { target: { value: 'betrayal' } })
  fireEvent.keyDown(feelings, { key: 'Enter' })
  fireEvent.click(screen.getByRole('button', { name: /collide them/i }))
  await waitFor(() => expect(started.items).toHaveLength(2))
  expect(started.topic).toBe('Dentist')

  expect(await screen.findByText(/make you feel betrayal/)).toBeInTheDocument()
  expect(screen.getByText('+ the spit sucker')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Punchline'), { target: { value: 'She flosses me, then ghosts me for six months.' } })
  fireEvent.click(screen.getByRole('button', { name: /save joke/i }))
  await waitFor(() => expect(joke?.a).toBe('the hygienist'))
  expect(await screen.findByText('Written from this map')).toBeInTheDocument()
})
