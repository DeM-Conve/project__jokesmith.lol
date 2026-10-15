import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import XRayPage from './XRayPage.jsx'

const credit = {
  comedian: 'Tim Vine',
  source: 'Dave Funniest Joke of the Fringe, winner 2010',
  sourceUrl: 'https://www.comedy.co.uk/fringe/2010/features/tim_vine_joke_of_the_year/',
  translation: null,
}

const handXray = {
  setup: "I've just been on a once-in-a-lifetime holiday.",
  punchline: "I'll tell you what, never again.",
  targetAssumption: 'The trip of a lifetime.',
  connector: 'once-in-a-lifetime',
  reinterpretation: 'It was so bad he will never repeat it.',
  punchWord: 'again',
  punchWordLast: true,
  formula: 'MISDIRECTION',
  formulaLabel: 'Misdirection',
  alsoSpotted: [],
  whyItWorks: 'The phrase is a compliment in the setup and a warning in the punch.',
  cues: [],
  tips: [],
  wordCount: 14,
  source: 'HAND_ANNOTATED',
  confidence: 'high',
  credit,
}

beforeEach(() => {
  http.reset()
  http.get('/learn/xray/history', [])
  http.get('/learn/xray/gallery', [
    { id: 'g01', setup: handXray.setup, punchline: handXray.punchline, difficulty: 'EASY', tags: ['one-liner'], credit, xray: handXray },
  ])
})

test('x-rays a pasted joke and labels the estimate honestly', async () => {
  const user = userEvent.setup()
  let sent
  http.post('/learn/xray', (body) => {
    sent = body
    return {
      ...handXray,
      setup: 'My smart speaker is like a teenager.',
      punchline: "It only listens when I'm saying something private.",
      punchWord: 'private',
      formula: 'COMPARISON',
      formulaLabel: 'Comparison',
      targetAssumption: 'You expect the thing to be compared to something flattering.',
      cues: ['A comparison signal: "like a"'],
      source: 'ESTIMATE',
      confidence: 'medium',
    }
  })
  renderWithProviders(<XRayPage />)
  await user.type(
    screen.getByLabelText('Joke to X-ray'),
    "My smart speaker is like a teenager. It only listens when I'm saying something private.{Enter}",
  )
  expect(await screen.findByTestId('xray-result')).toBeInTheDocument()
  expect(sent).toEqual({ text: "My smart speaker is like a teenager. It only listens when I'm saying something private." })
  expect(screen.getByText('Estimate · medium confidence')).toBeInTheDocument()
  expect(screen.getByText(/compared to something flattering/)).toBeInTheDocument()
  expect(screen.getByText('A comparison signal: "like a"')).toBeInTheDocument()
  expect(screen.getByTestId('punch-word')).toHaveTextContent('private')
})

test('gallery joke: mark it up yourself, then compare with the hand annotation', async () => {
  const user = userEvent.setup()
  let sent
  http.post('/learn/xray/annotate', (body) => {
    sent = body
    return {
      checks: [
        { key: 'split', label: 'You found where the setup turns into the punch', passed: true, tip: 'Spot on.' },
        { key: 'punch-word', label: 'You spotted the punch word', passed: true, tip: 'Yes.' },
        { key: 'formula', label: 'You named the formula', passed: true, tip: 'Right.' },
        { key: 'assumption', label: 'You described the target assumption', passed: false, tip: 'Compare yours.' },
      ],
      passed: 3,
      total: 4,
      expected: handXray,
      comparedWith: 'HAND_ANNOTATED',
    }
  })
  renderWithProviders(<XRayPage />)
  await user.click(await screen.findByRole('button', { name: /gallery joke: i've just been on/i }))
  await user.click(screen.getByRole('button', { name: /mark it up first/i }))
  await user.click(screen.getByRole('button', { name: "I'll" }))
  await user.click(screen.getByRole('button', { name: 'again.' }))
  // The annotator's chips come before the gallery filter chips.
  await user.click(screen.getAllByRole('radio', { name: 'Misdirection' })[0])
  await user.type(screen.getByLabelText('The target assumption'), 'the trip of a lifetime{Enter}')

  expect(await screen.findByText('3/4')).toBeInTheDocument()
  expect(sent).toEqual({
    galleryRef: 'g01',
    text: null,
    punchline: "I'll tell you what, never again.",
    punchWord: 'again',
    formula: 'MISDIRECTION',
    assumption: 'the trip of a lifetime',
  })
  expect(screen.getByText('The hand annotation')).toBeInTheDocument()
  expect(screen.getByText('Compare yours.')).toBeInTheDocument()
})

test('gallery joke: just show me', async () => {
  const user = userEvent.setup()
  renderWithProviders(<XRayPage />)
  expect(await screen.findByText(/1 jokes from working comedians, each credited and hand-annotated/)).toBeInTheDocument()
  expect(screen.getByText(/— Tim Vine, Dave Funniest Joke of the Fringe, winner 2010/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /gallery joke.*\(tim vine\)/i }))
  await user.click(screen.getByRole('button', { name: /just show me the x-ray/i }))
  expect(screen.getByText('Hand-annotated')).toBeInTheDocument()
  expect(screen.getByText('It was so bad he will never repeat it.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /tim vine, dave funniest joke of the fringe/i })).toHaveAttribute(
    'href',
    credit.sourceUrl,
  )
})
