// The nine ComedySkills in curriculum order: display names, short radar labels, and
// where each one is trained (mirrors the backend's SkillDrills).
export const SKILLS = [
  { key: 'ANATOMY', label: 'Joke anatomy', short: 'Anatomy', route: '/xray', blurb: 'Seeing setup, assumption and reveal' },
  { key: 'ASSOCIATION', label: 'Association', short: 'Association', route: '/associate', blurb: 'Connecting distant ideas' },
  { key: 'FORMULAS', label: 'Formulas', short: 'Formulas', route: '/gym', blurb: 'Rule of three, reversals, misdirection' },
  { key: 'POINT_OF_VIEW', label: 'Point of view', short: 'POV', route: '/learn/POINT_OF_VIEW', blurb: 'Having a take worth hearing' },
  { key: 'ECONOMY', label: 'Economy', short: 'Economy', route: '/punchup', blurb: 'Cutting to the funny' },
  { key: 'HEIGHTENING', label: 'Heightening', short: 'Heighten', route: '/riff', blurb: 'Pushing an idea further' },
  { key: 'REAL_TIME_WIT', label: 'Real-time wit', short: 'Wit', route: '/banter', blurb: 'Funny on the spot' },
  { key: 'DELIVERY', label: 'Delivery', short: 'Delivery', route: '/delivery', blurb: 'Timing, pause, punch' },
  { key: 'FEEDBACK', label: 'Feedback', short: 'Feedback', route: '/arena', blurb: 'Knowing why a joke works' },
]

export const SKILL_BY_KEY = Object.fromEntries(SKILLS.map((s) => [s.key, s]))
