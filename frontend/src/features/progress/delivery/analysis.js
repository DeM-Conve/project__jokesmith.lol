// Delivery Lab analysis: pure functions over what the browser measured.
//   samples:    [{ t: ms since start, level: RMS loudness 0..1 }], ~every 50 ms (AnalyserNode)
//   transcript: what SpeechRecognition heard ('' when unsupported)
//   jokeText:   the joke as written
// Nothing here touches audio APIs, so it is all unit-testable.

/** Thresholds a coach would use. Stand-up sits a bit slower than conversation. */
export const NORMS = {
  wpm: { tooSlow: 95, slow: 120, fast: 165, tooFast: 185 },
  pauseMs: { none: 150, short: 300, long: 1200, tooLong: 2000 },
  energy: { flat: 0.25, spiky: 0.95 },
  /** Gaps shorter than this are inside a phrase, not a pause. */
  minPauseMs: 150,
  /** Speech blips shorter than this are clicks / breaths. */
  minSpeechMs: 60,
  /** The punch is "the last bit": pauses ending this close to the end of speech count as pre-punch. */
  punchWindowMs: 2500,
}

export const FILLER_WORDS = ['um', 'umm', 'uh', 'uhh', 'er', 'erm', 'hmm', 'like', 'so', 'you know', 'i mean', 'basically']

const STOPWORDS = new Set(
  ('a an the and or but so of to in on at by for with from as is are was were be been am i me my you your he she it its we us our they them their this that these those there here then than too very just really not no do does did have has had will would can could should what who when where why how if up out about into over again all any some more most such only own same s t').split(' '),
)

// ---- text ----------------------------------------------------------------------------

/** Lower-case words, apostrophes kept ("don't"), punctuation dropped. */
export function tokenize(text) {
  return (text ?? '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .match(/[\p{L}\p{N}']+/gu)
    ?.map((w) => w.replace(/^'+|'+$/g, ''))
    .filter(Boolean) ?? []
}

export function countWords(text) {
  return tokenize(text).length
}

// "so" and "like" are real words too ("so lazy", "I like it", "looks like rain"). They only
// count as fillers where speech habits put them: opening a sentence, after another filler,
// or ("like") anywhere it isn't a verb or comparison.
const LIKE_AS_WORD = new Set(
  ("i you we they he she would i'd you'd we'd they'd do does did don't doesn't didn't to not looks look looked " +
    'feel feels felt sound sounds sounded seem seems seemed something nothing anything just more less much really').split(' '),
)

function isFiller(word, prev) {
  if (word === 'so') return prev === undefined || FILLER_WORDS.includes(prev)
  if (word === 'like') return prev === undefined || FILLER_WORDS.includes(prev) || !LIKE_AS_WORD.has(prev)
  return FILLER_WORDS.includes(word)
}

/** Filler words and phrases: { total, byWord: { um: 2, like: 1 } }. */
export function countFillers(text) {
  const words = tokenize(text)
  const byWord = {}
  let total = 0
  for (let i = 0; i < words.length; i++) {
    const two = i + 1 < words.length ? `${words[i]} ${words[i + 1]}` : null
    let hit = null
    if (two && FILLER_WORDS.includes(two)) {
      hit = two
      i++
    } else if (isFiller(words[i], words[i - 1])) {
      hit = words[i]
    }
    if (hit) {
      byWord[hit] = (byWord[hit] ?? 0) + 1
      total++
    }
  }
  return { total, byWord }
}

function stem(w) {
  return w.replace(/'s$/, '').replace(/(ing|ed|es|s)$/, '')
}

function levenshtein(a, b) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

/** Same word, allowing plurals/tenses and one misheard letter on longer words. */
export function sameWord(a, b) {
  if (!a || !b) return false
  if (a === b || stem(a) === stem(b)) return true
  return Math.min(a.length, b.length) >= 4 && levenshtein(a, b) <= 1
}

/**
 * The punch word: the last word of the joke that carries meaning (not a stopword).
 * endsOnPunch says whether the written joke already ends on it (good structure).
 */
export function punchWord(jokeText) {
  const words = tokenize(jokeText)
  if (!words.length) return { word: null, endsOnPunch: false, trailing: [] }
  let i = words.length - 1
  while (i > 0 && STOPWORDS.has(words[i])) i--
  return { word: words[i], endsOnPunch: i === words.length - 1, trailing: words.slice(i + 1) }
}

/**
 * Did the take end on the punch word? Ignores fillers after it, but "yeah", "get it?"
 * and other trailing words count against it. null when there's no transcript.
 */
export function punchCameLast(transcript, jokeText) {
  const { word } = punchWord(jokeText)
  const spoken = tokenize(transcript)
  if (!word || !spoken.length) return { punchLast: null, punchWord: word, after: [] }
  const lastIdx = spoken.findLastIndex((w) => sameWord(w, word))
  if (lastIdx === -1) return { punchLast: false, punchWord: word, after: [], missing: true }
  const after = spoken.slice(lastIdx + 1).filter((w) => !FILLER_WORDS.includes(w))
  // Words the written joke itself has after the punch word don't count as trailing.
  const { trailing } = punchWord(jokeText)
  const extra = after.filter((w, k) => !sameWord(w, trailing[k]))
  return { punchLast: extra.length === 0, punchWord: word, after: extra }
}

// ---- audio -----------------------------------------------------------------------------

function percentile(sorted, p) {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)))
  return sorted[idx]
}

/** Typical gap between samples (ms). */
export function frameMs(samples) {
  if (samples.length < 2) return 50
  const gaps = samples.slice(1).map((s, i) => s.t - samples[i].t).sort((a, b) => a - b)
  return Math.max(1, percentile(gaps, 0.5))
}

/**
 * Loudness above which a frame counts as speech: adapts to the room's noise floor
 * (10th percentile) and the speaker's peak (95th percentile).
 */
export function speechThreshold(samples) {
  const sorted = samples.map((s) => s.level).sort((a, b) => a - b)
  const floor = percentile(sorted, 0.1)
  const peak = percentile(sorted, 0.95)
  return Math.max(0.012, floor + (peak - floor) * 0.3)
}

/** Speech segments [{start, end}] (ms), small gaps merged and blips dropped. */
export function speechSegments(samples, opts = {}) {
  const { minPauseMs = NORMS.minPauseMs, minSpeechMs = NORMS.minSpeechMs } = opts
  if (!samples.length) return []
  const threshold = opts.threshold ?? speechThreshold(samples)
  const dt = frameMs(samples)
  const raw = []
  let cur = null
  for (const s of samples) {
    if (s.level >= threshold) {
      if (cur) cur.end = s.t + dt
      else cur = { start: s.t, end: s.t + dt }
    } else if (cur) {
      raw.push(cur)
      cur = null
    }
  }
  if (cur) raw.push(cur)

  const merged = []
  for (const seg of raw) {
    const last = merged[merged.length - 1]
    if (last && seg.start - last.end < minPauseMs) last.end = seg.end
    else merged.push({ ...seg })
  }
  return merged.filter((s) => s.end - s.start >= minSpeechMs)
}

/** Silent gaps between speech segments [{start, end, ms}]. */
export function pausesBetween(segments) {
  return segments.slice(1).map((s, i) => ({ start: segments[i].end, end: s.start, ms: s.start - segments[i].end }))
}

/**
 * "The pause before the punch": the longest pause that ends within the final stretch of
 * speech (the punchline). null when there's no pause there.
 */
export function prePunchPause(segments, windowMs = NORMS.punchWindowMs) {
  if (segments.length < 2) return null
  const speechEnd = segments[segments.length - 1].end
  const candidates = pausesBetween(segments).filter((p) => speechEnd - p.end <= windowMs)
  if (!candidates.length) return null
  return candidates.reduce((best, p) => (p.ms > best.ms ? p : best))
}

/** Loudness variation while speaking (coefficient of variation: std / mean). 0 = monotone. */
export function energyVariance(samples, segments) {
  const inSpeech = samples.filter((s) => segments.some((g) => s.t >= g.start && s.t < g.end)).map((s) => s.level)
  if (inSpeech.length < 2) return 0
  const mean = inSpeech.reduce((a, b) => a + b, 0) / inSpeech.length
  if (mean <= 0) return 0
  const variance = inSpeech.reduce((a, b) => a + (b - mean) ** 2, 0) / inSpeech.length
  return Math.sqrt(variance) / mean
}

export function wordsPerMinute(words, ms) {
  if (!words || !ms) return 0
  return (words * 60_000) / ms
}

// ---- ratings & score -----------------------------------------------------------------

/** Each metric's outcome, the key into coaching copy. */
export function rate(m) {
  const { wpm, pauseMs, energy } = NORMS
  const pace = !m.wordCount ? 'unknown'
    : m.wordsPerMinute > wpm.tooFast ? 'tooFast'
    : m.wordsPerMinute > wpm.fast ? 'fast'
    : m.wordsPerMinute >= wpm.slow ? 'good'
    : m.wordsPerMinute >= wpm.tooSlow ? 'slow' : 'tooSlow'
  const p = m.prePunchPauseMs
  const pause = p < pauseMs.none ? 'none' : p < pauseMs.short ? 'short' : p <= pauseMs.long ? 'good' : p <= pauseMs.tooLong ? 'long' : 'tooLong'
  const fillers = !m.hasTranscript ? 'unknown' : m.fillerCount === 0 ? 'zero' : m.fillerCount <= 2 ? 'few' : 'many'
  const punch = m.punchLast === null ? 'unknown' : m.punchMissing ? 'missing' : m.punchLast ? 'last' : 'trailing'
  const en = m.energyVariance < energy.flat ? 'flat' : m.energyVariance > energy.spiky ? 'spiky' : 'good'
  return { pace, pause, fillers, punch, energy: en, structure: m.jokeEndsOnPunch ? 'endsOnPunch' : 'buried' }
}

const POINTS = {
  pace: { good: 25, fast: 17, slow: 17, tooFast: 8, tooSlow: 8, unknown: 12 },
  pause: { good: 30, long: 20, short: 15, tooLong: 10, none: 5 },
  fillers: { zero: 15, few: 10, many: 3, unknown: 10 },
  punch: { last: 15, trailing: 5, missing: 6, unknown: 9 },
  energy: { good: 15, flat: 6, spiky: 9 },
}

/** 0..100 "mic score": pause 30, pace 25, fillers 15, ending on the punch 15, energy 15. */
export function score(ratings) {
  return Object.entries(POINTS).reduce((sum, [k, table]) => sum + (table[ratings[k]] ?? 0), 0)
}

/**
 * Everything about one take. durationMs is the recording length.
 * Returns the metrics the backend stores, plus segments/pause spans for the timeline.
 */
export function analyseTake({ samples = [], transcript = '', jokeText = '', durationMs }) {
  const segments = speechSegments(samples)
  const duration = Math.round(durationMs ?? (samples.length ? samples[samples.length - 1].t : 0))
  const speechMs = segments.length ? segments[segments.length - 1].end - segments[0].start : 0
  const hasTranscript = tokenize(transcript).length > 0
  // Without a transcript, estimate words from the written joke (people say roughly what they wrote).
  const wordCount = hasTranscript ? countWords(transcript) : speechMs ? countWords(jokeText) : 0
  const pre = prePunchPause(segments)
  const pauses = pausesBetween(segments)
  const fillers = countFillers(transcript)
  const punch = punchCameLast(transcript, jokeText)
  const metrics = {
    durationMs: duration,
    speechMs: Math.round(speechMs),
    wordCount,
    wordsPerMinute: Math.round(wordsPerMinute(wordCount, speechMs) * 10) / 10,
    prePunchPauseMs: Math.round(pre?.ms ?? 0),
    longestPauseMs: Math.round(pauses.reduce((m, p) => Math.max(m, p.ms), 0)),
    fillerCount: fillers.total,
    punchLast: punch.punchLast,
    energyVariance: Math.round(energyVariance(samples, segments) * 1000) / 1000,
  }
  const written = punchWord(jokeText)
  const ratings = rate({
    ...metrics,
    hasTranscript,
    punchMissing: Boolean(punch.missing),
    jokeEndsOnPunch: written.endsOnPunch,
  })
  return {
    metrics: { ...metrics, score: segments.length ? score(ratings) : 0 },
    ratings,
    silent: segments.length === 0,
    estimatedWords: !hasTranscript,
    segments,
    prePunch: pre,
    fillers,
    punch,
    written,
  }
}
