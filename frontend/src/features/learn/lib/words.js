// Tiny text helpers shared by the learn pages.

/** Strip leading/trailing punctuation and lowercase, for comparing words. */
export function bare(word) {
  return String(word ?? '').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase()
}

/** Split text into display tokens (keeps punctuation on the word). */
export function tokens(text) {
  return String(text ?? '').split(/\s+/).filter(Boolean)
}

/** Index of the last token in `toks` whose bare form equals `word`, or -1. */
export function lastIndexOfWord(toks, word) {
  const target = bare(word)
  if (!target) return -1
  for (let i = toks.length - 1; i >= 0; i--) if (bare(toks[i]) === target) return i
  // Multi-word or partial match ("5am", "self-cleaning"): fall back to contains.
  for (let i = toks.length - 1; i >= 0; i--) if (bare(toks[i]).includes(target)) return i
  return -1
}

/** Parse a gym template ("If {{the topic}} were …") into text and blank parts. */
export function parseTemplate(template) {
  const parts = []
  const re = /\{\{(.+?)\}\}/g
  let last = 0
  let m
  let n = 0
  while ((m = re.exec(template ?? '')) !== null) {
    if (m.index > last) parts.push({ type: 'text', text: template.slice(last, m.index) })
    parts.push({ type: 'blank', label: m[1], id: n++ })
    last = m.index + m[0].length
  }
  if (last < (template ?? '').length) parts.push({ type: 'text', text: template.slice(last) })
  return parts
}

/** Fill a parsed template with values (blank id -> text); empty blanks stay as their label in brackets. */
export function fillTemplate(parts, values) {
  return parts
    .map((p) => (p.type === 'text' ? p.text : values[p.id]?.trim() || `[${p.label}]`))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

export const FORMULA_LABELS = {
  MISDIRECTION: 'Misdirection',
  RULE_OF_THREE: 'Rule of three',
  EXAGGERATION: 'Exaggeration',
  COMPARISON: 'Comparison',
  LITERAL: 'Literal interpretation',
  WORDPLAY: 'Wordplay',
  REVERSAL: 'Reversal',
  MASHUP: 'Mash-up',
  ATTITUDE: 'Attitude',
  CALLBACK: 'Callback',
  OTHER: 'Something else',
}
