# jokesmith.lol: product

What the product is, who it is for, and the requirements and decisions that shape it. This is
the "what and why". For page-by-page behaviour see [docs/features.md](docs/features.md); for
how it is built see [docs/architecture.md](docs/architecture.md).

## The product in one paragraph

jokesmith.lol is a **gym for comedy writing**. It treats being funny as a craft with a handful
of learnable mechanics plus a lot of repetitions, and it teaches those mechanics by making the
user *do* them. The loop is: **learn** how a joke works, **practise** in small daily reps,
**workshop** jokes until they land (including getting real votes from other people), then
**perform** them out loud. A skill radar, streaks and a career ladder show the user getting
better. Pitch line: *"No talent required. Just fifteen minutes a day."*

## Who it is for

- **Primary user:** someone who believes "I'm not funny" and wants to become funnier in
  everyday life and in writing. Not a working comedian; no prior craft knowledge assumed.
- They have about **15 minutes a day**. The Today page plans that session for them.
- **No sign-up**: they arrive, get a random stage name, and start. Identity is an anonymous
  cookie (see "Identity" below).
- Content deliberately includes **English and Indian / South Asian comics** (Hindi or
  Hinglish lines carry English translations), so the examples are not only Anglo-American.
- It is also an **open-source, self-hostable** app: anyone can run their own instance with
  Docker Compose (see README "Self-hosting").

## Product principles (the user's explicit decisions)

These are owner decisions recorded in the code history and the original CLAUDE.md. Treat them
as requirements; change them only if the owner says so.

1. **No AI at runtime, anywhere.** No LLM calls, no "AI" in UI copy, no "AI offline" fallbacks
   (an early AI client and offline notice were deliberately removed). Content *may* be written
   up front, generously and in bulk (lessons, prompts, annotated jokes, model answers,
   association lists) and shipped as static data. All runtime feedback comes from that curated
   content, from deterministic rule-based heuristics, and from other humans (Arena votes, peer
   picks). *Why:* the owner's hard constraint; coaching should come from craft, not a model.
2. **Teach by doing, not by reading.** Every screen is an exercise. Lessons end in a quiz and a
   "your turn" joke; every other page is a drill.
3. **Socratic coaching.** The user tries first; then they get a critique; only then the
   curated model answer is revealed. Examples: Formula Gym shows model answers after an
   attempt, the Daily Riff reveals model punchlines only after the user has riffed, the
   Punch-Up Coach asks questions and locks its rewrite "moves" until the user has rewritten
   the joke themselves, and it never writes the joke for them. *Why:* the point is to build
   *their* skill.
4. **Specific feedback, never vague scores.** Heuristics must name the exact word to cut, the
   buried punch word, the filler they said. A number on its own is not feedback.
5. **Every joke the user writes is kept.** Whatever page it was written on, it lands in one
   shared joke bank, so the Notebook shows everything and the Arena can use it.
6. **Real, verified, credited examples.** Worked examples, X-Ray gallery jokes and formula
   examples are real jokes by named comedians, each with a source and a URL that verifies the
   wording. "Watch the masters" cards link to **official clips only**. Quizzes, prompts, model
   answers and house jokes are original. Frameworks used are credited (e.g. Greg Dean's joke
   structure).
7. **Privacy of the voice.** Delivery Lab audio **never leaves the browser**; only the numeric
   analysis and the transcript are stored.
8. **Anonymous-first identity.** No accounts, emails or passwords. A random id in a long-lived
   `pid` cookie; the user can rename their stage name.
9. **The Arena must work on day one.** A built-in "The House" writer ships 84 original jokes
   across 12 topics, entered into the Arena, so a fresh install has something to vote on.
10. **Quantity first, quality later.** Practice drills reward volume (the Daily Riff targets
    10 punchlines; XP scales with count), and editing is a separate step (Workshop).
11. **Design feel:** a comedy club after hours (dark, default) / a matinee (light: warm paper,
    deep amber ink), one amber spotlight either way. The joke text is the hero of every screen,
    in big display type. Keyboard-first: Enter submits, timers are visible. Light / Dark /
    System switch, remembered per device.
12. **Self-hosting is a first-class use.** One `docker compose up`, all settings in `.env`, no
    `.env` means the previous defaults, the app can live under a sub-path behind a reverse
    proxy, and an upgrade never loses data or anyone's identity cookie.

## The method and the nine skills

Every exercise trains exactly one of nine skills (`comedy_skill` enum). The curriculum teaches
them in this order, in three acts:

| # | Skill | Act | Mainly trained by |
|---|---|---|---|
| 1 | Joke anatomy (`ANATOMY`) | 1: see the machine | Joke X-Ray |
| 2 | Point of view (`POINT_OF_VIEW`) | 1 | the lesson only (no dedicated drill yet, see open questions) |
| 3 | Association (`ASSOCIATION`) | 1 | Association Mapper |
| 4 | Formulas (`FORMULAS`) | 2: the tools | Formula Gym |
| 5 | Economy (`ECONOMY`) | 2 | Punch-Up Coach |
| 6 | Heightening (`HEIGHTENING`) | 2 | Daily Riff (10+ punchlines) |
| 7 | Real-time wit (`REAL_TIME_WIT`) | 3: live | Banter Simulator, short Daily Riffs |
| 8 | Delivery (`DELIVERY`) | 3 | Delivery Lab |
| 9 | Feedback (`FEEDBACK`) | 3 | Joke Arena voting |

## Business requirements

Grouped by area. Each says what the product must do and why. Exact numbers and flows live in
[docs/features.md](docs/features.md).

### Daily habit and progress

- **R1. A daily plan.** The home page (Today) must tell the user what to do today: the Daily
  Riff, one or two drills for their weakest skills, and their next lesson, as a checklist that
  ticks itself off. New users get a short welcome and a "start with lesson 1" path. *Why:* a
  beginner should never have to decide what to practise.
- **R2. The plan is stable within a day.** Weakest skills are judged on XP from *before*
  today, so finishing a drill doesn't reshuffle the list.
- **R3. Progress is visible.** Streak (current and best), XP today against a daily goal (75),
  total XP, a rank on a 9-step comedy career ladder (*Open-Mic Newbie* to *Headliner*), a skill
  radar, a 20-week activity calendar and reps per day.
- **R4. Progress is derived from one event log.** Every completed rep records one
  `(skill, xp)` event; streaks, XP, levels and the radar are computed from that log only.
  XP guide: ~10 for a quick rep, 25 for a full exercise, 50 for a lesson or big session.
- **R5. Skill levels have diminishing returns** (`100 * (1 - e^(-xp/400))`): early reps move
  the needle most; mastery takes a while.
- **R6. Days are the user's days.** Streaks and "today" are counted in the browser's time zone,
  and a streak stays alive until midnight if the user practised yesterday.
- **R7. A tip of the day** from 120+ hand-written tips.

### Learn

- **R8. A 9-lesson curriculum**, one mechanism per lesson: the idea, credited worked examples,
  "watch the masters" clips, common mistakes, a quiz, and a "your turn" joke with checklist
  feedback. First completion awards XP; re-runs keep the best quiz score.
- **R9. Joke X-Ray:** the user can see a joke's parts (setup, target assumption, connector,
  reinterpretation, punch word, formula), both on a hand-annotated gallery of famous jokes and
  on any joke they paste (honestly labelled as an *estimate*), and can practise annotating a
  joke themselves and be checked against the answer.
- **R10. Formula Gym:** reps on proven joke shapes (9 formulas) against random premises, with
  a craft checklist, a "next rep" tip and curated model answers after each attempt.

### Practice

- **R11. Daily Riff:** one shared setup per calendar day for everyone, a visible timer, as many
  punchlines as possible, then pick your best and see other people's picks. Past days can be
  riffed retroactively. A day's prompt never changes once it has been shown, even when the
  prompt catalogue grows.
- **R12. Association Mapper:** brainstorm a topic in five columns (people, places, things,
  phrases, feelings), get "collisions" between distant associations rated for surprise, and
  write a joke from one. Curated topics top up a thin brainstorm.
- **R13. Banter Simulator:** quick-wit practice against a persona (friend, coworker, date),
  five lines per round with a 15/10/5 s countdown, a rule-based score (wit, surprise,
  kindness) with one coaching tip, then curated example replies that use a *different*
  technique than the user did, and a self-rating. Strong replies go to the joke bank.

### Workshop

- **R14. Punch-Up Coach:** diagnose a joke (wordiness, fillers, a buried punch word, generic
  nouns, lists), ask Socratic questions, let the user rewrite, critique with a before/after
  diff, then unlock concrete rewrite moves. Every draft is kept. The finished draft can be
  sent to the Arena.
- **R15. Joke Arena:** anonymous head-to-head duels; voting moves an Elo rating; weekly and
  all-time joke leaderboards and a writers leaderboard. You can never vote on your own joke or
  judge the same pair twice. Voting is itself practice (Feedback skill).
- **R16. Bit Notebook:** every joke the user has written anywhere, searchable and filterable,
  with tags, favourites, Arena entry/withdrawal, editing and deletion; ordered *bits* (sets of
  jokes); and a callback finder that suggests pairs of jokes sharing a key word.
- **R17. Drafts are private by default.** Notebook and Punch-Up jokes stay out of the Arena
  until the user enters them; jokes from drills are in by default and can be withdrawn.

### Stage

- **R18. Delivery Lab:** tell a joke into the microphone and get pace (wpm), the pause before
  the punch, filler words, whether the take ended on the punch word, and vocal energy, with a
  waveform and specific coaching notes; play back and compare takes. All analysis happens in
  the browser (see principle 7). Works without speech recognition (timing and energy still
  work; pace is estimated from the written joke).

### Self-hosting and operations

- **R19.** One-command Docker Compose stack; everything configurable from `.env`; only one
  container is exposed; the database is never published; safe defaults (loopback bind).
- **R20.** Works behind a TLS reverse proxy (the identity cookie becomes `Secure` on https) and
  under a sub-path, without users losing their identity when either is turned on.
- **R21.** Deploys only after every test passes (`scripts/deploy.sh`).
- **R22. Backups**: nightly automatic database backups with retention, a one-shot backup
  script and a safe, verifiable restore (`backup` compose service, `scripts/backup.sh`,
  `scripts/restore.sh`; see README "Backup & restore"). Merged into `main` 2026-10-23.

## Non-goals (as built)

- No accounts, login, email or social features beyond the Arena and peer picks.
- No live AI, no generated jokes, no "AI coach".
- No uploading or storing audio.
- No mobile app; it is a responsive web app.

## Open questions

Things the code and history do not settle. Ask the owner before building on an assumption.

1. **Point of view drill.** Every other skill has a practice page; Point of view only has its
   lesson, and the Today plan sends the user back to that lesson as its "drill". Is a dedicated
   POV drill planned, or is the lesson enough?
2. **Arena defaults for drill jokes.** Daily Riff, Formula Gym, Banter, Association and
   Delivery Lab jokes enter the Arena automatically (opt-out), and riff best picks are shown to
   everyone with the writer's stage name. Is public-by-default the intended privacy model? In
   particular, a joke *typed* into the Delivery Lab is banked as `DELIVERY` and so is in the
   Arena by default; is that intended, or should it behave like a Notebook draft?
3. **Moderation.** Users see other users' jokes (Arena, peer picks, leaderboards) and stage
   names. There is no report/hide/block flow or word filter. Needed for a public instance?
4. **Identity recovery and data rights.** Losing the `pid` cookie (new browser, cleared
   cookies) loses the user's history; there is no way to move an identity between devices,
   export one's jokes, or delete one's data. Is any of that wanted?
5. **Daily Riff after the first year.** The catalogue holds 365 prompts and day #1 was
   2026-01-01. Pinned days never change, but new days will start reusing prompts once the
   list is exhausted. Plan: keep appending prompts, or accept repeats?
6. **Licence.** The repo is meant to be open-source and self-hostable but has no `LICENSE`
   file yet. Which licence?
7. **Health checks create users** (see "Known issues" in [docs/architecture.md](docs/architecture.md)):
   fix by adding a cookie-free health endpoint? (It is a code change, so it was not made in the
   docs refresh.)
