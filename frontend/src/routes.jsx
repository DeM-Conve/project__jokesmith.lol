import { lazy } from 'react'

// Route table. Pages are lazy so each feature is its own chunk.
// Feature folders own their pages; add a route here only for a new page.
const page = (load) => lazy(load)

export const ROUTES = [
  { path: '/', Component: page(() => import('./features/progress/TodayPage.jsx')) },
  { path: '/progress', Component: page(() => import('./features/progress/ProgressPage.jsx')) },
  { path: '/delivery', Component: page(() => import('./features/progress/DeliveryLabPage.jsx')) },

  { path: '/learn', Component: page(() => import('./features/learn/CurriculumPage.jsx')) },
  { path: '/learn/:skill', Component: page(() => import('./features/learn/LessonPage.jsx')) },
  { path: '/xray', Component: page(() => import('./features/learn/XRayPage.jsx')) },
  { path: '/gym', Component: page(() => import('./features/learn/FormulaGymPage.jsx')) },

  { path: '/riff', Component: page(() => import('./features/practice/DailyRiffPage.jsx')) },
  { path: '/associate', Component: page(() => import('./features/practice/AssociationPage.jsx')) },
  { path: '/banter', Component: page(() => import('./features/practice/BanterPage.jsx')) },

  { path: '/punchup', Component: page(() => import('./features/workshop/PunchUpPage.jsx')) },
  { path: '/arena', Component: page(() => import('./features/workshop/ArenaPage.jsx')) },
  { path: '/notebook', Component: page(() => import('./features/workshop/NotebookPage.jsx')) },
]
