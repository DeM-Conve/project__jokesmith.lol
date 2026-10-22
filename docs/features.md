# Features

Page-by-page behaviour as the code implements it today: flows, rules, XP and limits. The
requirements and the reasons behind them are in [PRODUCT.md](../PRODUCT.md); the tables,
endpoints and code layout are in [architecture.md](architecture.md).

Conventions used below:

- **XP / skill** = the `practice_event` row the action records (`ActivityLog.record`).
- **Banked** = saved to the shared `joke` table with the given `source` and `prompt_ref`.
- **Arena default**: jokes from `NOTEBOOK` and `PUNCH_UP` are private until entered; every
  other source is in the Arena unless withdrawn.

## Navigation

Sidebar sections (`frontend/src/nav.js`), each page owned by one feature:

| Section | Page | Route | Feature |
|---|---|---|---|
| - | Today | `/` | progress |
| Learn | Curriculum, Lesson | `/learn`, `/learn/:skill` | learn |
| Learn | Joke X-Ray | `/xray` | learn |
| Learn | Formula Gym | `/gym` | learn |
| Practice | Daily Riff | `/riff` (`?date=YYYY-MM-DD` for past days) | practice |
| Practice | Association Mapper | `/associate` | practice |
| Practice | Banter Simulator | `/banter` | practice |
| Workshop | Punch-Up Coach | `/punchup` | workshop |
| Workshop | Joke Arena | `/arena` | workshop |
| Workshop | Bit Notebook | `/notebook` | workshop |
| Stage | Delivery Lab | `/delivery` | progress |
| Stage | Funny Radar | `/progress` | progress |

The header has the logo, a burger on mobile and the Light / Dark / System theme switch.

## Identity

- First request without a `pid` cookie creates a user with a random stage name
  (adjective + noun + two digits, e.g. `DeadpanOtter42`).
- The stage name is shown and editable on Today (2-32 chars: letters, digits, space, `_ . -`).
- `pid` cookie: `HttpOnly`, `SameSite=Lax`, 10 years, `Secure` on https, path = the base path.

## Today (`/`)

- Greeting with the stage name; streak (current, best, done today); today's XP vs the daily
  goal of **75** (a riff plus two 25-XP drills); reps today; total XP; current rank and the
  next one.
- **Set list (daily plan)**, built server-side:
  1. Daily Riff (ticked when a `DAILY_RIFF` joke was written today).
  2. Drills for the weakest skills (2, or 1 for a new user), Heightening excluded because the
     riff covers it. Weakest = least XP before today, then least recently practised, then
     curriculum order. Ticked when that skill got any event today. Each skill maps to a page
     (`SkillDrills`): Anatomy `/xray`, Association `/associate`, Formulas `/gym`, Point of view
     `/learn/POINT_OF_VIEW`, Economy `/punchup`, Real-time wit `/banter`, Delivery `/delivery`,
     Feedback `/arena`.
  3. The next incomplete lesson in curriculum order (a lesson finished today stays, ticked;
     all done means "Revisit the curriculum").
- **New user** (no events and no jokes): a 3-step onboarding hero and "start with lesson 1".
- **Tip of the day** from 123 hand-written tips in categories (`progress/data/tips.js`).
- Days are counted in the browser's IANA time zone (`?tz=`); an unknown zone falls back to UTC.

## Learn

### Curriculum (`/learn`) and lessons (`/learn/:skill`)

- 9 lessons in three acts (*see the machine*, *the tools*, *live*), order: Anatomy, Point of
  view, Association, Formulas, Economy, Heightening, Real-time wit, Delivery, Feedback. Slugs
  like `/learn/point-of-view` (upper-case enum names are accepted too).
- Lesson content is static frontend data (`features/learn/content/lessons-{1,2,3}.js`), each
  with: tagline, minutes, credited lineage (frameworks), concept cards, worked examples (real
  credited jokes with step-by-step breakdowns), "watch the masters" cards (official clips),
  common mistakes, a quiz, and a "your turn" exercise with model answers, plus a link to the
  skill's drill.
- Completing: posts the quiz score and the optional "your turn" joke. The joke is banked as
  `NOTEBOOK`, `prompt_ref = lesson:<SKILL>` (so private by default) and checked with the craft
  checklist. **First completion: 50 XP** on that skill; later runs only keep the best quiz.
- The curriculum page shows completion per lesson, the next lesson, and counts of X-rays and
  gym reps.

### Joke X-Ray (`/xray`)

- **Gallery**: 50 hand-annotated famous jokes (43 comedians, English and Indian / South
  Asian), each with difficulty, tags, credit (comedian, source, verification URL, translation
  for Hindi/Hinglish), the formula, the target assumption, connector, reinterpretation, punch
  word and why it works.
- **Auto X-Ray** of any pasted joke (at least 2 words): the analyser splits setup and punch at
  the last sentence boundary, takes the punch word as the last content word, and names a
  formula from cues. Labelled as an estimate. **10 XP, Anatomy.**
- **Self-annotate**: the user marks the split, punch word, formula and writes the assumption;
  four checks (split within 2 words, punch word, formula incl. "also accept", assumption
  overlaps the answer). Compared with the hand annotation (gallery) or the estimate (own joke).
  **10 XP, Anatomy.**
- History: the last 10 X-ray runs.

### Formula Gym (`/gym`)

- 9 formulas (misdirection, rule of three, exaggeration, comparison, literal, wordplay,
  reversal, mash-up, attitude), each with a one-liner, how it works, a credited example, a
  fill-in template, tips and a stretch goal. 66 premises (with keywords), 72 curated model
  answers.
- A rep: pick a formula, get a random premise (re-roll avoids repeats), write setup +
  punchline. Feedback: a checklist of craft rules (punch word last, economy, a real turn, the
  formula's signature move, staying on the premise) with a tip for every miss, a headline by
  pass ratio, a "next rep" tip, and up to 3 model answers (this premise first, then others).
- Banked as `FORMULA_GYM`, `prompt_ref = gym:<FORMULA>:<premiseId>`. **25 XP, Formulas.**
- Per-formula stats: reps and best checklist score.

## Practice

### Daily Riff (`/riff`)

- One setup per calendar day, the same for everyone. Riff #1 is 2026-01-01. 365 prompts in
  `practice/riff/prompts-*.txt` (append-only), each with 4-5 curated model punchlines. Days map
  to prompts through a fixed permutation, and the first prompt shown for a date is pinned in
  `riff_day`, so appending prompts never changes a past day.
- Playable dates: launch day up to server today + 1 (slack for time zones ahead of UTC).
- Timer: 3, 5 (default) or 10 minutes. Goal: **10 punchlines**.
- Submit: every punchline banked as `DAILY_RIFF`, `prompt_ref = <ISO date>`. **XP = 5 per
  punchline, max 50.** Skill: **Heightening** if 10 or more, else **Real-time wit**. A user may
  riff a day more than once.
- After riffing: the model punchlines are revealed; the user picks their **best** (one per
  user per day, can re-pick); a feed shows up to 50 best picks from everyone that day with the
  writer's stage name.
- Archive drawer: past days (up to 365), marked if riffed; they can be riffed retroactively.

### Association Mapper (`/associate`)

- Pick a topic (48 curated topics, or any free text). Brainstorm into five columns: People,
  Places, Things, Phrases, Feelings (duplicates per column ignored). Brainstorming tips shown.
- The map shows up to 4 curated suggestions per column (curated topics only) and **5
  collisions**: pairs from different columns, each item used once, rated 1-5 for surprise
  (no shared words, far-apart column pairs and multi-word specifics score higher), with a
  "why" and a writing prompt. A thin brainstorm (fewer than 6 items or one column) borrows
  curated items. Collisions can be re-rolled.
- Write a joke from a collision: banked as `ASSOCIATION`, `prompt_ref = assoc:<sessionId>`.
  **First joke of a map: 25 XP, Association.**

### Banter Simulator (`/banter`)

- Persona: Friend, Coworker or Date (32 curated lines each, each with technique-tagged example
  replies). Countdown per reply: 15, 10 or 5 seconds. 5 rounds per session, avoiding the
  persona's lines from the user's last 6 sessions where possible.
- Each reply is scored 1-5 on **wit, surprise and kindness** by `BanterScorer` (regex cues for
  agreeing, exaggerating, twisting, reversing, role-play, self-deprecation, meanness, warmth,
  call-backs to the line's words; late replies lose points, 1.5 s grace). A crowd verdict
  (*Crickets* to *Applause break*) and one coaching tip.
- Then an example reply using a technique the user did *not* use, the other examples, and a
  self-rating (*Beat it / Matched / Not yet*).
- Banking (`BANTER`, `prompt_ref = line key`): automatic when on time and 11+/15; also when
  the user claims *Beat it* or *Matched*.
- Session complete (all 5 answered): **XP = 10 + 6 per on-time reply + 10 if any reply hit the
  save bar, max 50; Real-time wit.**

## Workshop

### Punch-Up Coach (`/punchup`)

- Start from a new joke or an existing banked joke (from the Notebook). Up to 12 versions per
  session.
- **Diagnose**: `PunchUpAnalyser` measures word counts, fillers, where the punch word sits,
  generic nouns and lists, and turns each finding into a flag (severity Big / Worth fixing /
  Polish) with a Socratic question and a curated before/after example (36 examples), plus
  strengths and a score.
- **Rewrite** (the user's own): saved as a new version; critique with word-level before/after
  diff, word count change and punch-word movement. Same-as-last drafts are rejected. **First
  rewrite of a session: 25 XP, Economy.**
- **Moves** unlock after the first rewrite: concrete instructions with the exact words
  involved; never a rewritten joke.
- **Send to Arena** enters the latest draft. Versions are banked as `PUNCH_UP`,
  `prompt_ref = punchup:<sessionId>` (private by default).
- A standalone analyse endpoint and the examples list are also exposed; recent sessions show
  first vs latest score.

### Joke Arena (`/arena`)

- A duel shows two anonymous jokes (no writer, no rating until after the vote). Pick left /
  right or skip; keyboard ← → ↓. After the vote both ratings are revealed with the change.
- Mode: any jokes, or **Same prompt** (both from one `(source, prompt_ref)` group, labelled,
  e.g. "Daily Riff: 2026-10-15" or "Topic: airports").
- Pairing: never the voter's own joke, never a pair (unordered) the voter already judged;
  favours jokes with few duels, matched to a close rating (with jitter; same-writer pairs
  penalised). From a random sample of up to 3000 eligible jokes.
- Elo: start 1200, K = 32, zero-sum. Skips are recorded and don't move ratings.
- **Every 10th pick: 10 XP, Feedback.**
- Leaderboards: top 20 jokes all-time (rated, at least one duel) or this week (Elo gained from
  votes in the last 7 days); top 20 writers (mean rating of their rated jokes, shrunk towards
  1200 by two virtual 1200-rated jokes; at least 3 duels; The House excluded). "Mine": the user's writer rating and rank, and each of their
  jokes with Arena status, rating, record and win rate.
- **The House** (`00000000-0000-0000-0000-000000000300`) owns 84 original seed jokes in 12
  topics (`prompt_ref = house:<topic>`), entered so a fresh install has duels.

### Bit Notebook (`/notebook`)

- Every banked joke of the user, newest first, with source, tags, favourite, Arena status,
  rating, votes and win rate. Filter by source, text search, tag, favourites.
- Create (banked as `NOTEBOOK`, private), edit, delete; up to 8 tags per joke (32 chars,
  case-insensitive, `#` stripped; unused tags are cleaned up); favourite; enter/withdraw from
  the Arena; open in the Punch-Up Coach.
- **Bits**: titled, ordered runs of up to 40 of the user's jokes.
- **Callback finder**: pairs of the user's jokes sharing a key word, scored, with a hint on
  how to use one as a callback for the other (12 overall or 6 for a focused joke).

## Stage

### Delivery Lab (`/delivery`)

- Pick a joke from the bank (latest 60) or type one. Record a take (max 60 s).
- Measured in the browser: `MediaRecorder` for playback (a local blob URL), Web Audio
  `AnalyserNode` loudness every 50 ms with a noise-adaptive threshold for speech segments, and
  `SpeechRecognition` (Chrome / Edge) for a live transcript when available.
- Metrics: duration, speech time, words, **wpm** (target 120-165), **pause before the punch**
  (longest silence ending in the last 2.5 s of speech; target 0.3-1.2 s), longest pause,
  **filler words** (um, uh, like, so, you know, i mean, basically...; "so"/"like" only where
  they are habits, not words), **ended on the punch word**, **energy** (coefficient of
  variation of loudness while speaking). Without a transcript, word count is estimated from
  the written joke.
- **Mic score 0-100**: pause 30, pace 25, fillers 15, ending on the punch 15, energy 15. A
  waveform marks the pause; coaching notes are ordered worst-first (`progress/data/coaching.js`).
- Saved: the metrics and the transcript (never audio). A typed joke is banked once as
  `DELIVERY`. **25 XP, Delivery** per take. Takes in a visit can be replayed and compared in a
  table; the last 20 saved takes are listed.

### Funny Radar (`/progress`)

- Hand-drawn SVG spider chart of the nine skill levels; stat tiles (total XP, reps, jokes
  written, streak); a 20-week streak calendar; reps per day for the last 30 days; the career
  ladder with all 9 ranks (Open-Mic Newbie 0, Bringer-Show Regular 100, Five-Minute Spot 300,
  Guest Spot 600, Feature Act 1000, Club Regular 1600, Road Dog 2500, Late-Night Writer 4000,
  Headliner 6000 XP).

## XP summary

| Action | Skill | XP |
|---|---|---|
| Lesson, first completion | the lesson's skill | 50 |
| X-Ray (auto or self-annotated) | Anatomy | 10 |
| Formula Gym rep | Formulas | 25 |
| Daily Riff | Heightening (10+) / Real-time wit | 5 per punchline, max 50 |
| Association map, first joke | Association | 25 |
| Banter session | Real-time wit | 10 + 6/on-time reply + 10 bonus, max 50 |
| Punch-Up, first rewrite | Economy | 25 |
| Arena, every 10th pick | Feedback | 10 |
| Delivery take | Delivery | 25 |
