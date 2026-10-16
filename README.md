# jokesmith.lol

**A gym for comedy writing, built for people who say "I'm not funny."**

Being funny isn't a personality trait you either have or don't. It's a craft, with a
handful of learnable mechanics and a lot of reps. jokesmith.lol teaches those mechanics by
making you *do* them: every screen is an exercise, not an article. You learn how a joke
works, practise every day, workshop your jokes until they land, then step up to a
microphone and nail the timing. Along the way you watch a skill radar grow.

No talent required. Just fifteen minutes a day.

## The method

Comedy writers don't wait for inspiration. They use repeatable tools:

1. **Learn the machine.** A joke is a setup that builds an *assumption* and a punchline
   that breaks it. Once you can see the setup, the hidden assumption and the reveal,
   you can build jokes on purpose: rule of three, misdirection, reversal, heightening,
   and the rest.
2. **Practise in small daily reps.** Funny is a muscle. A daily riff on one prompt,
   association maps that connect distant ideas, and timed banter train the generating
   side: quantity first, quality later.
3. **Workshop.** Most of comedy is rewriting. Cut every word that isn't pulling weight,
   put the punch word last, and test jokes head to head against other people's.
4. **Perform.** Half of funny is how you say it. The pause before the punch, a steady
   pace, no "um"s, and stopping dead on the punch word.

Every exercise trains one of **nine skills**: Joke anatomy, Association, Formulas, Point
of view, Economy, Heightening, Real-time wit, Delivery and Feedback.

All coaching comes from hand-written curriculum content and deterministic, rule-based
heuristics. There are no live AI calls at runtime.

## Features

| Area | Page | What you do |
|---|---|---|
| Home | **Today** `/` | Your daily set: greeting, streak, today's XP vs a daily goal, rank, and a checklist plan (the Daily Riff, 1-2 drills for your weakest skills, your next lesson). New users get a 3-step welcome and a "start with lesson 1" button. Plus a comedy tip of the day from 120+ hand-written tips. |
| Learn | **Curriculum** `/learn`, `/learn/:skill` | Short lessons, one mechanism at a time. |
| | **Joke X-Ray** `/xray` | Take jokes apart: setup, assumption, reveal. |
| | **Formula Gym** `/gym` | Reps on proven joke shapes. |
| Practice | **Daily Riff** `/riff` | One prompt a day, as many angles as you can. |
| | **Association Mapper** `/associate` | Map a topic's connections, then find the collision. |
| | **Banter Simulator** `/banter` | Timed comebacks: quick wit under pressure. |
| Workshop | **Punch-Up Coach** `/punchup` | Tighten a joke: cut words, move the punch word last. |
| | **Joke Arena** `/arena` | Vote on head-to-head jokes; yours get voted on too. |
| | **Bit Notebook** `/notebook` | Every joke you've written, in one bank. |
| Stage | **Delivery Lab** `/delivery` | Tell a joke into your mic. Get your pace (wpm), the pause before the punch, filler words, whether you ended on the punch word, and vocal energy, with a waveform showing the pause and specific coaching notes. Play back and compare takes. **Audio never leaves your browser**: only the numbers are saved. |
| | **Funny Radar** `/progress` | A spider chart of your nine skills, a streak calendar, reps per day, total XP, jokes written, and a career ladder from *Open-Mic Newbie* to *Headliner*. |

### How progress is counted

- Every completed rep anywhere in the app records an event (skill + XP: ~10 for a quick
  rep, 25 for a full exercise, 50 for a lesson or a big session).
- **Skill level** (0-100) has diminishing returns: `100 * (1 - e^(-xp/400))`. Your first
  reps move the needle most; mastery takes a while.
- **Streak** = consecutive days with at least one rep, counted in *your* time zone. A
  streak stays alive until midnight if you practised yesterday.
- **Today's plan** picks your weakest skills based on XP *before* today, so the plan stays
  put while you tick it off.

### Delivery Lab analysis (all in the browser)

- `MediaRecorder` records the take for playback (a local blob URL, never uploaded).
- Web Audio `AnalyserNode` samples loudness every 50 ms. Speech segments are found with
  a threshold that adapts to the room's noise floor.
- The Web Speech API (`SpeechRecognition`, Chrome and Edge) gives a live transcript for
  filler counting and the "ended on the punch word" check. Without it, timing, pace
  (estimated from the written joke) and energy still work.
- The pause before the punch is the longest silence that ends in the last 2.5 s of
  speech. Pace targets 120-165 wpm, pause targets 0.3-1.2 s, and energy is the
  coefficient of variation of loudness while speaking.

## Running it

### Everything in Docker

```bash
docker compose up -d --build
```

Then open http://localhost:8200. This starts Postgres (`db`), the Spring Boot API
(`backend`, internal port 48200) and nginx serving the built frontend (`frontend`), which
proxies `/api` to the backend so the identity cookie stays same-origin. Postgres data
lives in the `pgdata` volume.

### Self-hosting

```bash
git clone <this repo> jokesmith && cd jokesmith
cp .env.example .env        # then edit: JOKESMITH_URL, DB_PASSWORD (and JOKESMITH_BIND / JOKESMITH_PORT)
docker compose up -d --build
```

`.env.example` documents every setting (`JOKESMITH_URL`, `JOKESMITH_BASE_PATH`, `JOKESMITH_BIND` / `JOKESMITH_PORT`,
`DB_*`, `TZ`); with no `.env` at all you get exactly the previous hardcoded defaults, so an
existing install keeps its data and URL after `git pull`. Only the `frontend` container
needs to be reachable: it serves the app and proxies `/api` to the backend, so the browser
only ever talks to one origin (`JOKESMITH_URL`). Postgres is not published to the host;
`docker-compose.dev.yml` does that for local development only.

- **Data**: everything lives in Postgres, in the `pgdata` named volume by default
  (`DB_DATA_LOCATION=pgdata`). Set `DB_DATA_LOCATION` to a path (e.g. `./data/pgdata`) to
  use a bind mount instead. Set `DB_PASSWORD` before the first start; it only takes effect
  when the data directory is created.
- **Backups**: `docker compose exec -T db pg_dump -U jokesmith jokesmith | gzip > jokesmith-$(date +%F).sql.gz`
  (restore into a fresh stack with `gunzip -c <file> | docker compose exec -T db psql -U jokesmith jokesmith`;
  use your `DB_USERNAME` / `DB_DATABASE_NAME` if you changed them).
- **Updating**: `git pull && docker compose up -d --build`. Flyway migrates the schema
  on backend start.
- **Behind a reverse proxy** (Caddy, Traefik, nginx): point it at `JOKESMITH_BIND:JOKESMITH_PORT`
  (keep `JOKESMITH_BIND=127.0.0.1` when the proxy runs on the same host) and set `JOKESMITH_URL` to the
  public URL, e.g. `https://jokesmith.example.com`. The proxy should send
  `X-Forwarded-Proto`; on https the `pid` identity cookie is then marked `Secure`.
- **Under a sub-path** (e.g. `https://example.com/jokesmith.lol/`): set `JOKESMITH_BASE_PATH=/jokesmith.lol`
  (leading slash, no trailing slash) and `JOKESMITH_URL` to the full URL including it. Serve the app under
  a sub-path. The reverse proxy in front must strip this prefix before forwarding and send
  `X-Forwarded-Prefix: <prefix>` (Traefik's StripPrefix middleware does both). Rebuild the frontend after
  changing it (`docker compose up -d --build`): the prefix is baked into the build. The `pid` cookie is then
  scoped to the prefix (an existing one set at `/` is still read, so nobody loses their id).

### Local development

Requirements: Java 21, Maven 3.9, Node 22, Docker (for Postgres and the backend tests).

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db   # Postgres on 127.0.0.1:5433
cd backend && mvn spring-boot:run       # API on :48200
cd frontend && npm install && npm run dev   # app on :5200, proxies /api -> :48200
```

`docker-compose.dev.yml` publishes Postgres on `DB_BIND:DB_PORT` (default `127.0.0.1:5433`).

Tests and checks:

```bash
cd backend && mvn test                  # integration tests on a throwaway Postgres (Testcontainers)
cd frontend && npm test && npx oxlint && npx vite build
```

There are no accounts. Your identity is an anonymous id in a long-lived `pid` cookie, and
you get a random stage name (which you can change on the Today page).

## Configuration

Docker Compose: see `.env.example` (self-hosting above).

Backend (environment variables, when running it directly):

| Variable | Default | Purpose |
|---|---|---|
| `SERVER_PORT` | `48200` | HTTP port |
| `DB_URL` | `jdbc:postgresql://localhost:5433/jokesmith` | JDBC URL |
| `DB_USER` / `DB_PASSWORD` | `jokesmith` / `jokesmith` | Database credentials |
| `FRONTEND_URL` | `http://localhost:5200` | Allowed CORS origin for `/api/**`; a path is ignored (in Docker: `JOKESMITH_URL`) |
| `BASE_PATH` | *(empty)* | Sub-path the `pid` cookie is scoped to (in Docker: `JOKESMITH_BASE_PATH`) |

Frontend dev server:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_PORT` | `5200` | Dev server port |
| `VITE_API_PORT` | `48200` | Backend port that `/api` is proxied to |
| `BASE_PATH` | *(empty)* | Build-time sub-path (`vite build`), e.g. `/jokesmith.lol` |

The dev database container also creates scratch databases (`jokesmith_learn`,
`jokesmith_practice`, `jokesmith_workshop`, `jokesmith_progress`) so several backends can
run side by side: point each at one with `DB_URL` and give it its own `SERVER_PORT`.

## Stack

- **Frontend**: React 19, Vite, Mantine, TanStack Query, axios, lucide icons. Charts are
  hand-written SVG components.
- **Backend**: Spring Boot 3.3 (Java 21), Spring Data JPA, Bean Validation, RFC 9457
  problem details.
- **Database**: PostgreSQL 17 with Flyway migrations, typed columns and native enums.

See `CLAUDE.md` for code conventions and how the four feature workstreams (learn,
practice, workshop, progress) split the codebase.
