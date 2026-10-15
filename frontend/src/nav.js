import {
  BookOpen, Dumbbell, Flame, Gauge, Home, Mic, MessagesSquare, Network, NotebookPen, ScanSearch, Swords, Wand2,
} from 'lucide-react'

// THE navigation: sections of the sidebar, in order. Each route's page is
// owned by one feature folder (CLAUDE.md "Feature ownership").
export const NAV = [
  { section: null, items: [{ to: '/', label: 'Today', icon: Home }] },
  {
    section: 'Learn',
    items: [
      { to: '/learn', label: 'Curriculum', icon: BookOpen },
      { to: '/xray', label: 'Joke X-Ray', icon: ScanSearch },
      { to: '/gym', label: 'Formula Gym', icon: Dumbbell },
    ],
  },
  {
    section: 'Practice',
    items: [
      { to: '/riff', label: 'Daily Riff', icon: Flame },
      { to: '/associate', label: 'Association Mapper', icon: Network },
      { to: '/banter', label: 'Banter Simulator', icon: MessagesSquare },
    ],
  },
  {
    section: 'Workshop',
    items: [
      { to: '/punchup', label: 'Punch-Up Coach', icon: Wand2 },
      { to: '/arena', label: 'Joke Arena', icon: Swords },
      { to: '/notebook', label: 'Bit Notebook', icon: NotebookPen },
    ],
  },
  {
    section: 'Stage',
    items: [
      { to: '/delivery', label: 'Delivery Lab', icon: Mic },
      { to: '/progress', label: 'Funny Radar', icon: Gauge },
    ],
  },
]
