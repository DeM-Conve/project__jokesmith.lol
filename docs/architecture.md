# Architecture

How jokesmith.lol is built: stack, runtime topology, code layout, data model, API, curated
content, tests and deployment. Code conventions you must follow are in
[CLAUDE.md](../CLAUDE.md); product behaviour is in [features.md](features.md); operator setup
(`.env`, reverse proxy, sub-path, backups) is in the [README](../README.md).

## Runtime topology

```
browser ──► frontend (nginx :80, published on JOKESMITH_BIND:JOKESMITH_PORT, default 127.0.0.1:8200)
              ├── /            static Vite build (SPA, falls back to index.html)
              ├── /assets/     hashed bundles, cached 1 year
              └── /api/  ────► backend (Spring Boot :48200, internal only)
                                   └──► db (Postgres 17, internal only, volume DB_DATA_LOCATION)
```

- Compose project `jokesmith` (`docker-compose.yml`): `db`, `backend`, `frontend`.
  `docker-compose.dev.yml` only publishes Postgres (default `127.0.0.1:5433`) for local dev.
- The browser talks to **one origin**; nginx proxies `/api` so the `pid` cookie stays
  first-party. nginx passes `X-Forwarded-Proto` (keeping a TLS proxy's value) and leaves
  `X-Forwarded-Host` / `X-Forwarded-Prefix` alone; Spring uses
  `forward-headers-strategy: native`, so `request.isSecure()` reflects the browser's scheme.
- **Sub-path hosting** (`JOKESMITH_BASE_PATH`, e.g. `/jokesmith.lol`): baked into the frontend
  build (Vite `base`, router basename, API base, via `frontend/src/basePath.js`); the proxy in
  front strips the prefix and sends `X-Forwarded-Prefix`; nginx uses relative redirects; the
  backend scopes the `pid` cookie to the prefix (a cookie set earlier at `/` is still read).
  CORS allows only the origin of `JOKESMITH_URL`. `basePath.js` is the same module as in the
  sibling apps (tierlist.fm, pardon.me, lexicon.me).
- Health: backend image `HEALTHCHECK` hits `/api/me`; `frontend` waits for a healthy backend,
  `backend` for a healthy `db`.
- Images: backend `maven:3.9-eclipse-temurin-21` build, `eclipse-temurin:21-jre-alpine` run as
  non-root; frontend `node:22-alpine` build, `nginx:1.27-alpine` run.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite 8, JavaScript (`.jsx`), Mantine 9 (only component library), TanStack Query 5 (all server state), axios (`src/api/client.js`), react-router-dom 7, lucide-react icons. Charts are hand-written SVG. Fonts: Bricolage Grotesque for display. |
| Backend | Spring Boot 3.3 (Java 21, Maven), Spring Web, Data JPA, Bean Validation, RFC 9457 ProblemDetail, `JdbcClient`/`JdbcTemplate` for aggregate SQL. Package `app.jokesmith`. |
| Database | PostgreSQL 17, schema owned by Flyway (`out-of-order: true`), Hibernate `ddl-auto: validate`. |
| Tests | Backend: JUnit 5 + Testcontainers Postgres. Frontend: Vitest + Testing Library (jsdom), oxlint. |

## Code layout

```
backend/src/main/java/app/jokesmith/
  JokesmithApplication.java
  config/WebConfig.java          CORS (origin of FRONTEND_URL), registers @CurrentUser resolver
  user/                          AppUser, UserService (random handles), CurrentUserResolver (pid cookie), MeController (/api/me)
  core/                          shared: Joke + JokeBank, PracticeEvent + ActivityLog, ComedySkill, JokeSource
  learn/                         curriculum completion, X-Ray (XRayAnalyzer), Formula Gym (JokeChecklist, FormulaCues), LearnContent (JSON loader)
  practice/riff|association|banter   Daily Riff, Association Mapper (Collisions), Banter (BanterScorer); CuratedText (txt loader), Words
  workshop/punchup|arena|notebook    Punch-Up (PunchUpAnalyser), Arena (Elo, ArenaRepository SQL), Notebook (CallbackFinder); WorkshopJokes (ownership checks, House user)
  progress/                      Today/Radar (ProgressService, ProgressMath, SkillDrills), Delivery Lab takes (DeliveryService)
backend/src/main/resources/
  application.yml
  db/migration/                  Flyway, per-feature version ranges
  learn/*.json                   gym formulas, premises, model answers, X-Ray gallery
  practice/*.txt, practice/riff/prompts-*.txt   association topics, banter lines, daily riff prompts
  workshop/punchup-examples.json
frontend/src/
  main.jsx, App.jsx (AppShell, nav, header), routes.jsx (lazy pages), nav.js, themes.js (SCHEMES tokens), basePath.js
  api/                           axios client, queryClient, /api/me hooks
  components/                    PageHeader, ThemeToggle, shared bits
  features/<learn|practice|workshop|progress>/   pages, api.js (TanStack hooks), components, lib, content/data
  test/                          setup.js, http.js (HTTP stub), render.jsx
scripts/deploy.sh, scripts/init-dev-dbs.sql
```

Feature ownership (folders, packages, migration ranges, routes) is the table in CLAUDE.md.

## Backend design

- Layering: thin `@RestController` (HTTP only) → `@Service` (rules, transactions) →
  repository. DTOs are records, separate from entities. Errors via `ResponseStatusException`
  rendered as ProblemDetail.
- **Identity**: controllers take `@CurrentUser UUID userId`. `CurrentUserResolver` reads the
  `pid` cookie; if absent or invalid, it mints a UUID and sets the cookie; it always calls
  `UserService.getOrCreate`, so any request to an endpoint with `@CurrentUser` creates the user
  row on first sight.
- **Shared core** (use, don't fork): `JokeBank.save(userId, setup, punchline, source,
  promptRef)` for every joke anywhere; `ActivityLog.record(userId, skill, xp)` once per
  completed rep (xp clamped 0-100). Progress reads only `practice_event` (+ `joke` counts and
  learn lesson completions for the plan).
- **Ownership**: services look up rows by `(id, userId)`; someone else's row is a 404, not a
  403 (existence is not revealed).
- **Curated content** is loaded once at startup from the classpath: JSON (learn, workshop,
  strict: unknown properties fail) and line-based text (practice; `# ` comment lines dropped,
  files read in name order). Duplicate ids or a model answer for an unknown premise fail
  startup. Lesson content is not on the backend; it is static JS in the frontend.
- **Daily Riff prompt choice**: day index × 7919 + 17 mod catalogue size (a permutation), then
  pinned in `riff_day` on first request (`REQUIRES_NEW` transaction, `ON CONFLICT DO NOTHING`).
  Prompt files are **append-only** because `riff_day` stores indexes.
- **Arena**: eligibility is one SQL expression (`ArenaRepository.ELIGIBLE`): explicit
  `workshop_arena_entry` status wins, else in unless source is `NOTEBOOK`/`PUNCH_UP`, and the
  punchline is non-blank. Ratings are created lazily (absent = 1200, 0-0); a vote locks both
  rating rows, applies Elo and inserts the vote (unique per voter and unordered pair).

## Data model

All in one database. Every closed option set is a native Postgres `ENUM`; no JSON columns.
Every user-owned table cascades on `app_user` delete.

| Migration | Tables / types | Notes |
|---|---|---|
| `V1__core.sql` | `app_user(id uuid, handle, created_at)`; enums `comedy_skill`, `joke_source`; `joke(id, user_id, setup, punchline, source, prompt_ref, created_at)`; `practice_event(id, user_id, skill, xp, created_at)` | Shared by all features. `prompt_ref` is a feature-defined grouping key. |
| `V100__learn.sql` | enums `learn_joke_formula`, `learn_xray_mode`; `learn_lesson_completion` (unique user+skill, best quiz, times completed); `learn_xray_run`; `learn_gym_attempt` (→ joke) | |
| `V200__practice.sql` | `riff_session`, `riff_best_pick` (unique user+date); enum `association_category`, `association_session`, `association_item`; enums `banter_persona`, `banter_technique`, `banter_self_rating`; `banter_session` (timer 5/10/15), `banter_round` (5 per session, scores, tip, example, self-rating, → joke) | |
| `V201__riff_day.sql` | `riff_day(prompt_date pk, prompt_index)` | Pins each day's prompt. |
| `V300__workshop.sql` | `workshop_tag` (unique per user, case-insensitive), `workshop_joke_tag`, `workshop_favourite`, `workshop_bit`, `workshop_bit_joke` (ordered); enum `workshop_arena_status`, `workshop_arena_entry`; `workshop_joke_rating` (Elo, W/L); enum `workshop_vote_outcome`, `workshop_vote` (pair unique per voter, winner check); enum `workshop_punchup_stage`, `workshop_punchup` | Never alters `joke`: per-joke data keyed by `joke_id`. |
| `V301__workshop_house_seed.sql` | inserts user "The House" (`…0300`) and 84 jokes, all `ENTERED` | Seed data. |
| `V400__progress_delivery_take.sql` | `delivery_take` (metrics, transcript, score, → joke) | No audio column, by design. |

`prompt_ref` conventions: Daily Riff `YYYY-MM-DD`; Formula Gym `gym:<FORMULA>:<premiseId>`;
lesson "your turn" `lesson:<SKILL>`; Association `assoc:<sessionId>`; Banter the line key;
Punch-Up `punchup:<sessionId>`; house jokes `house:<topic>`; Notebook and Delivery `null`.

## HTTP API

All under `/api`, JSON, identity from the `pid` cookie.

| Area | Endpoints |
|---|---|
| me | `GET /me`, `PUT /me` `{handle}` |
| learn | `GET /learn/progress`; `POST /learn/lessons/{skill}/complete`; `POST /learn/xray`; `GET /learn/xray/gallery`; `POST /learn/xray/annotate`; `GET /learn/xray/history`; `GET /learn/gym`; `GET /learn/gym/premise?exclude=`; `POST /learn/gym/attempts`; `GET /learn/gym/stats` |
| practice | `GET/POST /practice/riff/days/{date}`; `PUT /practice/riff/days/{date}/best`; `GET /practice/riff/days/{date}/picks`; `GET /practice/riff/archive`; `GET /practice/associate/topics`; `POST /practice/associate/sessions`; `GET /practice/associate/sessions/{id}`; `POST …/sessions/{id}/items`; `POST …/sessions/{id}/jokes`; `GET /practice/banter/setup`; `POST /practice/banter/sessions`; `GET /practice/banter/sessions/{id}`; `POST …/sessions/{id}/rounds/{n}/reply`; `PUT …/sessions/{id}/rounds/{n}/self-rating` |
| workshop | `GET/POST /workshop/punchup`; `GET /workshop/punchup/{id}`; `POST …/{id}/rewrites`; `GET …/{id}/moves`; `POST …/{id}/arena`; `POST /workshop/punchup/analyse`; `GET /workshop/punchup/examples`; `GET /workshop/arena/pair`; `POST /workshop/arena/votes`; `GET /workshop/arena/leaderboard`; `GET /workshop/arena/mine`; `GET/POST /workshop/jokes`; `PUT/DELETE /workshop/jokes/{id}`; `PUT /workshop/jokes/{id}/favourite|tags|arena`; `GET /workshop/tags`; `GET /workshop/callbacks`; `GET/POST /workshop/bits`; `PUT/DELETE /workshop/bits/{id}`; `PUT /workshop/bits/{id}/jokes` |
| progress | `GET /progress/today?tz=`; `GET /progress/radar?tz=`; `GET /progress/delivery/jokes`; `GET/POST /progress/delivery/takes` |

The controllers are the source of truth for parameters and bodies.

## Frontend design

- `routes.jsx` lazy-loads each page (one chunk per feature); `nav.js` is the sidebar.
- Server state only through each feature's `features/<f>/api.js` TanStack Query hooks (keys
  prefixed with the feature name); no raw axios/fetch in components.
- Theme: `themes.js` `SCHEMES` holds every colour token for dark and light, written as CSS
  variables by Mantine's `cssVariablesResolver`; the scheme choice is stored per device under
  the `jokesmith.color-scheme` localStorage key and applied before first paint by an inline
  script in `index.html`.
- Delivery Lab analysis is pure functions in `features/progress/delivery/analysis.js` (unit
  tested); `useTakeRecorder.js` wraps MediaRecorder, AnalyserNode and SpeechRecognition.

## Tests

- **Backend** (`mvn test` / `mvn verify`, Docker required): ~100 tests in 25 files.
  Integration tests extend `PostgresTestBase` (one singleton Postgres 17 container per JVM,
  every migration applied); API tests per feature (`*ApiTest`), plus unit tests for pure logic
  (Elo, BanterScorer, Collisions, ProgressMath, PunchUpAnalyser, JokeText, RiffDayPins,
  cookie path) and content-integrity tests (learn content, practice content).
- **Frontend** (`npm test`): ~75 tests in 21 files: page tests per feature with HTTP stubbed
  by `src/test/http.js` and rendering via `src/test/render.jsx`; unit tests for delivery
  analysis, coaching, charts, tips and lesson content (every lesson has every section and
  links to a real route). `npx oxlint` and `npx vite build` are part of the check.

## Deployment

- `scripts/deploy.sh` is **the only way to deploy**: frontend lint + tests + build, backend
  `mvn -q verify`, then `docker compose up -d --build`, then it waits for `/api/me` on
  `http://localhost:8200` and checks the served bundle hash equals the one just built. Any
  failure stops before or fails the deploy. It assumes the default port 8200 and no base path.
- Updating an install: `git pull && docker compose up -d --build`; Flyway migrates on start.
- The owner also runs it in a homelab behind a Traefik reverse proxy under a sub-path
  (`JOKESMITH_BASE_PATH`); that configuration lives outside this repo.
- Backups: see README. Automated backups (`backup` service, `scripts/backup.sh`,
  `scripts/restore.sh`) exist only on the unmerged `feat/backup-restore` branch.

## Known issues

- **Health checks create users.** The backend `HEALTHCHECK` (every 10 s) and `deploy.sh`
  call `GET /api/me` without a cookie, and `CurrentUserResolver` creates a new `app_user`
  for every cookie-less request. A running stack therefore adds roughly 8,600 empty users per
  day. They don't show up anywhere (no jokes, no events), but the table grows. Likely fix: a
  cookie-free health endpoint (or Spring Actuator) for the health check. Not fixed yet (code
  change; see PRODUCT.md open questions).
- `deploy.sh` hard-codes `http://localhost:8200`, so it does not work as-is with a custom
  `JOKESMITH_PORT` or `JOKESMITH_BASE_PATH`.
