import { createTheme, defaultVariantColorsResolver, localStorageColorSchemeManager, rem } from '@mantine/core'

// THE single source of truth for every color, space and font size.
// Components never hard-code a color: use var(--token) or Mantine color props
// (c="dimmed", color="gray"). A new color = a new token in BOTH schemes here
// (+ its dark fallback in index.css :root), never a literal.
//
// Two looks, same club:
//   dark  - after hours: warm near-black stage, one amber spotlight, brick-red mic
//   light - the matinee: warm paper, deep amber ink (light enough to read on
//           cream at small sizes), the same brick-red mic
// cssVariablesResolver writes each set under its color scheme, so switching
// scheme (ThemeToggle) needs no JS beyond Mantine's own.
export const SCHEMES = {
  dark: {
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
    '--accent-hover': '#ffc566', // filled buttons on hover
    '--mic': '#e5533d', // secondary: live / record / "on stage"
    '--mic-soft': 'rgba(229, 83, 61, 0.14)',
    '--good': '#7bc47f',
    '--warn': '#f0c050',
    '--bad': '#e5533d',
    '--shadow': '0 8px 30px rgba(0, 0, 0, 0.45)',
  },
  light: {
    '--bg': '#fbf7f0',
    '--surface': '#ffffff',
    '--surface-2': '#f4eee4',
    '--surface-3': '#ebe3d6',
    '--border': '#e4dacb',
    '--border-strong': '#cdbfaa',
    '--text': '#1d1813',
    '--text-muted': '#665a4b',
    '--text-faint': '#968a79',
    '--accent': '#9a5800', // amber ink: 5:1 on --bg, so it works as text too
    '--accent-ink': '#fffaf2',
    '--accent-soft': 'rgba(214, 140, 30, 0.14)',
    '--accent-hover': '#7d4f06',
    '--mic': '#c23a25',
    '--mic-soft': 'rgba(194, 58, 37, 0.10)',
    '--good': '#2f7d3a',
    '--warn': '#946c00',
    '--bad': '#c23a25',
    '--shadow': '0 8px 30px rgba(80, 55, 20, 0.12)',
  },
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

// Mantine palettes. Filled (primary) amber is shade 5 in dark (= dark --accent)
// and shade 8 in light (= light --accent). `stage` replaces Mantine's dark
// grays, `paper` its light grays, so neutral components match each scheme.
const amber = ['#fff6e6', '#ffe9c4', '#ffd796', '#ffc566', '#ffbb52', '#ffb547', '#f0a536', '#d18b22', '#9a5800', '#7d4f06']
const stage = ['#f3ece2', '#d9cfc2', '#a99d8d', '#8a7f71', '#6f6558', '#4a4238', '#332d26', '#231f1a', '#1a1713', '#110f0c']
const paper = ['#fbf7f0', '#f4eee4', '#ebe3d6', '#e4dacb', '#cdbfaa', '#a89a86', '#8a7d6b', '#665a4b', '#463d33', '#1d1813']

// Filled amber (every primary button) reads the scheme's tokens directly, so the
// fill and its ink always match --accent / --accent-ink in light and dark alike
// (Mantine's autoContrast judged the dark fill by the light shade).
const variantColorResolver = (input) => {
  const resolved = defaultVariantColorsResolver(input)
  const amber = !input.color || input.color === 'amber' || input.color === input.theme.primaryColor
  if (input.variant === 'filled' && amber) {
    return { ...resolved, background: 'var(--accent)', hover: 'var(--accent-hover)', color: 'var(--accent-ink)' }
  }
  return resolved
}

export const theme = createTheme({
  variantColorResolver,
  primaryColor: 'amber',
  primaryShade: { light: 8, dark: 5 },
  colors: { amber, dark: stage, gray: paper },
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

// Mantine's own surface/text variables point at our tokens in both schemes.
const MANTINE_VARS = {
  '--mantine-color-body': 'var(--bg)',
  '--mantine-color-text': 'var(--text)',
  '--mantine-color-dimmed': 'var(--text-muted)',
  '--mantine-color-default': 'var(--surface-2)',
  '--mantine-color-default-hover': 'var(--surface-3)',
  '--mantine-color-default-border': 'var(--border)',
}

export const cssVariablesResolver = () => ({
  variables: {},
  light: { ...SCHEMES.light, ...MANTINE_VARS },
  dark: { ...SCHEMES.dark, ...MANTINE_VARS },
})

// Our own localStorage key (Mantine's default is shared by every Mantine app on the
// origin). index.html reads it before first paint and migrates the old key once.
export const colorSchemeManager = localStorageColorSchemeManager({ key: 'jokesmith.color-scheme' })
