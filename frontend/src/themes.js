import { createTheme, rem } from '@mantine/core'

// THE single source of truth for every color, space and font size.
// Components never hard-code a color: use var(--token) or Mantine color props
// (c="dimmed", color="gray"). A new color = a new token here (+ its fallback in
// index.css :root), never a literal.
//
// The look: a comedy club after hours - warm near-black stage, one amber
// spotlight accent, a brick-red "mic" secondary.
export const TOKENS = {
  '--bg': '#110f0c',
  '--surface': '#1a1713',
  '--surface-2': '#231f1a',
  '--surface-3': '#2d2822',
  '--border': '#332d26',
  '--border-strong': '#4a4238',
  '--text': '#f3ece2',
  '--text-muted': '#a99d8d',
  '--text-faint': '#6f6558',
  '--accent': '#ffb547', // the spotlight
  '--accent-ink': '#1a1206', // text on --accent
  '--accent-soft': 'rgba(255, 181, 71, 0.12)',
  '--mic': '#e5533d', // secondary: live / record / "on stage"
  '--mic-soft': 'rgba(229, 83, 61, 0.14)',
  '--good': '#7bc47f',
  '--warn': '#f0c050',
  '--bad': '#e5533d',
  '--shadow': '0 8px 30px rgba(0, 0, 0, 0.45)',
}

// Spacing scale - every margin/padding/gap is one of these keys, never raw px.
//   5xs 2 · 4xs 4 · 3xs 6 · 2xs 8 · xs 10 · sm 12 · md 16 · lg 20 · xl 32 · 2xl 40 · 3xl 48 · 4xl 64
export const SPACING = {
  '5xs': rem(2),
  '4xs': rem(4),
  '3xs': rem(6),
  '2xs': rem(8),
  xs: rem(10),
  sm: rem(12),
  md: rem(16),
  lg: rem(20),
  xl: rem(32),
  '2xl': rem(40),
  '3xl': rem(48),
  '4xl': rem(64),
}

// Type scale - every font size is one of these keys.
//   2xs 11 · xs 12 · sm 13 · md 15 body · lg 17 · xl 20 · 2xl 26 · 3xl 34 · 4xl 46
export const FONT_SIZES = {
  '2xs': rem(11),
  xs: rem(12),
  sm: rem(13),
  md: rem(15),
  lg: rem(17),
  xl: rem(20),
  '2xl': rem(26),
  '3xl': rem(34),
  '4xl': rem(46),
}

// Mantine palette built so shade 5/6 (filled) is the spotlight amber.
const amber = ['#fff6e6', '#ffe9c4', '#ffd796', '#ffc566', '#ffbb52', '#ffb547', '#f0a536', '#d18b22', '#a86c12', '#7d4f06']
const stage = ['#f3ece2', '#d9cfc2', '#a99d8d', '#8a7f71', '#6f6558', '#4a4238', '#332d26', '#231f1a', '#1a1713', '#110f0c']

export const theme = createTheme({
  primaryColor: 'amber',
  primaryShade: 5,
  colors: { amber, dark: stage },
  autoContrast: true,
  luminanceThreshold: 0.45,
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: '"Bricolage Grotesque", Inter, system-ui, sans-serif',
    fontWeight: '800',
    sizes: {
      h1: { fontSize: FONT_SIZES['3xl'], lineHeight: '1.1' },
      h2: { fontSize: FONT_SIZES.xl, lineHeight: '1.25' },
      h3: { fontSize: FONT_SIZES.lg, lineHeight: '1.3' },
    },
  },
  spacing: SPACING,
  fontSizes: FONT_SIZES,
  defaultRadius: 'md',
  cursorType: 'pointer',
})

export const cssVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-body': 'var(--bg)',
    '--mantine-color-text': 'var(--text)',
    '--mantine-color-dimmed': 'var(--text-muted)',
    '--mantine-color-default': 'var(--surface-2)',
    '--mantine-color-default-hover': 'var(--surface-3)',
    '--mantine-color-default-border': 'var(--border)',
  },
})

export function applyTokens(root = document.documentElement) {
  for (const [k, v] of Object.entries(TOKENS)) root.style.setProperty(k, v)
}
