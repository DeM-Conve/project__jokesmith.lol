import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import LessonPage from './LessonPage.jsx'

beforeEach(() => http.reset())

const renderLesson = (route) =>
  renderWithProviders(
    <Routes>
      <Route path="/learn/:skill" element={<LessonPage />} />
    </Routes>,
    { route },
  )

test('take the quiz, write a joke, finish the lesson', async () => {
  const user = userEvent.setup()
  http.get('/learn/progress', { lessons: [], completedCount: 0, totalLessons: 9, xrayCount: 0, gymReps: 0 })
  let sent
  http.post('/learn/lessons/ANATOMY/complete', (body) => {
    sent = body
    return {
      status: { skill: 'ANATOMY', bestQuizCorrect: 3, quizTotal: 4, timesCompleted: 1 },
      firstCompletion: true,
      xpAwarded: 50,
      jokeId: 7,
      checks: [{ key: 'punch-last', label: 'The punch word is the last word', passed: true, tip: 'Ends on "Easter". Good.' }],
    }
  })
  renderLesson('/learn/anatomy')

  expect(screen.getByRole('heading', { name: 'Anatomy of a joke' })).toBeInTheDocument()
  expect(screen.getByText('Worked example 1 of 4')).toBeInTheDocument()

  // Q1: tap the punch word.
  await user.click(screen.getByRole('button', { name: 'nap.' }))
  expect(screen.getByText('Nailed it.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next question' }))
  // Q2-Q4: multiple choice (one wrong).
  await user.click(screen.getByRole('radio', { name: /temporarily unemployed/i }))
  await user.click(screen.getByRole('button', { name: 'Next question' }))
  await user.click(screen.getByRole('radio', { name: /best$/ }))
  expect(screen.getByText('Not quite.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next question' }))
  await user.click(screen.getByRole('radio', { name: /laugh starts/i }))
  expect(screen.getByText('Quiz done: 3/4')).toBeInTheDocument()

  const finish = screen.getByRole('button', { name: /finish lesson/i })
  expect(finish).toBeDisabled()
  await user.type(screen.getByLabelText('Setup'), "I've been going to the gym religiously.")
  await user.type(screen.getByLabelText('Punchline'), 'Christmas and Easter.{Enter}')

  expect(await screen.findByText(/lesson complete · \+50 XP/i)).toBeInTheDocument()
  expect(sent).toEqual({
    quizCorrect: 3,
    quizTotal: 4,
    setup: "I've been going to the gym religiously.",
    punchline: 'Christmas and Easter.',
    formula: 'MISDIRECTION',
  })
  expect(screen.getByText('The punch word is the last word')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /next: find your attitude/i })).toHaveAttribute('href', '/learn/point-of-view')
  await user.click(screen.getByRole('button', { name: /reveal model answers/i }))
  expect(screen.getByText('Connector: "religiously".')).toBeInTheDocument()
})

test('worked examples reveal one step at a time', async () => {
  const user = userEvent.setup()
  renderLesson('/learn/anatomy')
  const [first] = screen.getAllByRole('button', { name: /guess first, then show: setup/i })
  await user.click(first)
  expect(screen.getByText(/sounds like a wellness brag/i)).toBeInTheDocument()
  expect(screen.queryByText(/eight hours, every night/i)).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /next: target assumption/i }))
  expect(screen.getByText(/eight hours, every night/i)).toBeInTheDocument()
})

test('unknown lesson', () => {
  renderLesson('/learn/juggling')
  expect(screen.getByText('Lesson not found')).toBeInTheDocument()
})
