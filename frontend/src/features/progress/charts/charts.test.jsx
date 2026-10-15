import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render.jsx'
import { radarFixture } from '../test/fixtures.js'
import { SKILL_BY_KEY } from '../data/skills.js'
import RadarChart, { polar } from './RadarChart.jsx'
import RepsBars from './RepsBars.jsx'
import StreakHeatmap, { intensity } from './StreakHeatmap.jsx'
import VolumeTimeline from './VolumeTimeline.jsx'

test('polar puts the first axis straight up', () => {
  const [x, y] = polar(0, 9, 100, 200, 200)
  expect(x).toBeCloseTo(200)
  expect(y).toBeCloseTo(100)
})

test('heat intensity is relative to the daily goal', () => {
  expect(intensity(0)).toBe(0)
  expect(intensity(10)).toBe(1)
  expect(intensity(25)).toBe(2)
  expect(intensity(50)).toBe(3)
  expect(intensity(75)).toBe(4)
  expect(intensity(300)).toBe(4)
})

test('radar labels every skill and reads out on hover', () => {
  const skills = radarFixture().skills.map((s) => ({ ...SKILL_BY_KEY[s.skill], ...s, key: s.skill }))
  renderWithProviders(<RadarChart skills={skills} />)
  expect(screen.getByRole('img', { name: 'Skill radar' })).toBeInTheDocument()
  expect(screen.getByText('Delivery')).toBeInTheDocument()
  fireEvent.mouseEnter(screen.getByText('POV').closest('g'))
  expect(screen.getByText('Point of view: level 30 · 150 XP · 6 reps')).toBeInTheDocument()
})

test('heatmap draws one cell per day and a readout on hover', () => {
  const { days } = radarFixture()
  renderWithProviders(<StreakHeatmap days={days} />)
  const cells = screen.getAllByTestId('heat-cell')
  expect(cells).toHaveLength(days.length)
  expect(cells[1].getAttribute('data-level')).toBe('2') // 25 xp
  fireEvent.mouseEnter(cells[2])
  expect(screen.getByText(/2 reps · 50 XP/)).toBeInTheDocument()
})

test('reps bars skip empty days', () => {
  const days = radarFixture().days.slice(-30)
  renderWithProviders(<RepsBars days={days} />)
  expect(screen.getAllByTestId('rep-bar')).toHaveLength(days.filter((d) => d.reps).length)
})

test('timeline highlights the pre-punch pause', () => {
  const samples = [{ t: 0, level: 0.2 }, { t: 50, level: 0.01 }, { t: 100, level: 0.3 }]
  renderWithProviders(<VolumeTimeline samples={samples} segments={[]} prePunch={{ start: 50, end: 100, ms: 640 }} durationMs={150} />)
  expect(screen.getByTestId('pre-punch-band')).toBeInTheDocument()
  expect(screen.getByText('Pause before the punch: 0.64s')).toBeInTheDocument()
})
