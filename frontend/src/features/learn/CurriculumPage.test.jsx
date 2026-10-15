import { screen } from '@testing-library/react'
import { http } from '../../test/http.js'
import { renderWithProviders } from '../../test/render.jsx'
import CurriculumPage from './CurriculumPage.jsx'

beforeEach(() => http.reset())

test('shows all nine lessons as a path with completion and the next lesson', async () => {
  http.get('/learn/progress', {
    lessons: [{ skill: 'ANATOMY', bestQuizCorrect: 3, quizTotal: 4, timesCompleted: 1 }],
    completedCount: 1,
    totalLessons: 9,
    xrayCount: 2,
    gymReps: 5,
  })
  renderWithProviders(<CurriculumPage />)
  expect(await screen.findByText('1/9')).toBeInTheDocument()
  expect(screen.getAllByTestId(/^lesson-/)).toHaveLength(9)
  expect(screen.getByTestId('lesson-ANATOMY')).toHaveAttribute('data-done', 'true')
  expect(screen.getByTestId('lesson-POINT_OF_VIEW')).toHaveAttribute('data-done', 'false')
  expect(screen.getByText('Quiz 3/4')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /start lesson 2/i })).toHaveAttribute('href', '/learn/point-of-view')
  expect(screen.getByRole('link', { name: /formula gym · 5/i })).toBeInTheDocument()
})

test('still lists the lessons when progress fails to load', async () => {
  renderWithProviders(<CurriculumPage />)
  expect(await screen.findByText(/couldn't load your progress/i)).toBeInTheDocument()
  expect(screen.getAllByTestId(/^lesson-/)).toHaveLength(9)
})
