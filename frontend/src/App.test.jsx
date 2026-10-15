import { screen } from '@testing-library/react'
import { http } from './test/http.js'
import App from './App.jsx'
import { renderWithProviders } from './test/render.jsx'

http.get('/me', { id: 'u1', handle: 'DryOtter42' })

test('shell renders every nav section', async () => {
  renderWithProviders(<App />)
  for (const label of ['Curriculum', 'Daily Riff', 'Joke Arena', 'Funny Radar']) {
    expect(screen.getByText(label)).toBeInTheDocument()
  }
  expect(await screen.findByText('DryOtter42')).toBeInTheDocument()
})
