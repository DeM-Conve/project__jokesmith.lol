import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import FormulaGymPage from './FormulaGymPage.jsx'

const formula = (key, label) => ({
  key,
  label,
  oneLiner: `${label} one-liner.`,
  howItWorks: 'How it works.',
  exampleSetup: 'A good team needs three things:',
  examplePunchline: 'trust, communication and someone to blame.',
  templateSetup: '{{the topic}} comes down to three things:',
  templatePunchline: '{{a normal item}}, {{another normal item}} and {{the item that breaks the pattern}}.',
  tips: ['Keep items parallel.'],
  stretch: 'Make the third a callback.',
})

beforeEach(() => {
  http.reset()
  http.get('/learn/gym', { formulas: [formula('RULE_OF_THREE', 'Rule of three'), formula('EXAGGERATION', 'Exaggeration')], premiseCount: 66 })
  http.get('/learn/gym/stats', [{ formula: 'RULE_OF_THREE', reps: 2, bestPassed: 8, bestTotal: 9 }])
  http.get('/learn/gym/premise', { id: 'p42', text: 'Yoga classes', category: 'Health' })
})

test('scaffold, free attempt, checklist, then model answers on request', async () => {
  const user = userEvent.setup()
  let sent
  http.post('/learn/gym/attempts', (body) => {
    sent = body
    return {
      jokeId: 1,
      formula: 'RULE_OF_THREE',
      checks: [
        { key: 'punch-last', label: 'The punch word is the last word', passed: true, tip: 'Good.' },
        { key: 'three-items', label: "There's a list of three", passed: false, tip: 'Write it as "A, B and C".' },
      ],
      passed: 1,
      total: 2,
      headline: 'There\'s a joke in here.',
      nextRep: 'Next rep: Write it as "A, B and C".',
      modelAnswers: [{ formula: 'RULE_OF_THREE', premiseId: 'p42', setup: 'Yoga has taught me balance, patience', punchline: 'and the exact location of the clock.', note: 'Two virtues, then a confession.' }],
      xpAwarded: 25,
    }
  })
  renderWithProviders(<FormulaGymPage />)
  expect(await screen.findByTestId('premise')).toHaveTextContent('Yoga classes')
  expect(screen.getByText('2 reps · best 8/9')).toBeInTheDocument()
  expect(screen.getByText('Rule of three one-liner.')).toBeInTheDocument()

  await user.type(screen.getByLabelText('the topic'), 'Yoga')
  await user.type(screen.getByLabelText('the item that breaks the pattern'), 'naps')
  await user.click(screen.getByRole('button', { name: /use this as my draft/i }))
  expect(screen.getByLabelText('Setup')).toHaveValue('Yoga comes down to three things:')

  await user.clear(screen.getByLabelText('Punchline'))
  await user.type(screen.getByLabelText('Punchline'), 'stretching, breathing and a nap.{Enter}')
  expect(await screen.findByTestId('gym-feedback')).toBeInTheDocument()
  expect(sent).toEqual({
    formula: 'RULE_OF_THREE',
    premiseId: 'p42',
    setup: 'Yoga comes down to three things:',
    punchline: 'stretching, breathing and a nap.',
  })
  expect(screen.getByText("There's a list of three")).toBeInTheDocument()
  expect(screen.getByText(/\+25 XP/)).toBeInTheDocument()
  expect(screen.queryByText('Two virtues, then a confession.')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /reveal model answers/i }))
  expect(screen.getByText('Two virtues, then a confession.')).toBeInTheDocument()
})

test('switching formula changes the drill', async () => {
  const user = userEvent.setup()
  renderWithProviders(<FormulaGymPage />)
  await user.click(await screen.findByRole('tab', { name: /exaggeration/i }))
  expect(screen.getByText('Exaggeration one-liner.')).toBeInTheDocument()
})
