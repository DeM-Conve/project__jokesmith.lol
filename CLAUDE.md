# jokesmith.lol

A gym for comedy writing, for people who say "I'm not funny": **learn** the mechanics of a
joke (curriculum, joke X-ray, formula drills), **practise** daily (riffs, association maps,
timed banter), **workshop** jokes (punch-up coach, head-to-head arena voting, a joke notebook),
then **perform** (delivery lab) and watch a skill radar grow. Every screen teaches by doing.
Anonymous-first (no accounts), no AI at runtime, open-source and self-hostable with Docker.

## Read next

| Doc | Read it when |
|---|---|
| [PRODUCT.md](PRODUCT.md) | Before any product or UX change: audience, the owner's product decisions (principles), business requirements R1-R22, non-goals, **open questions**. |
| [docs/features.md](docs/features.md) | Working on a page: exact flows, rules, XP, limits and content counts for every page. |
| [docs/architecture.md](docs/architecture.md) | Touching the stack, schema, API, deployment or tests: topology, code layout, data model, endpoints, known issues. |
| [README.md](README.md) | User-facing pitch, self-hosting, `.env` / reverse proxy / sub-path setup, configuration variables. |

## Hard rules

- **No AI anywhere** (the owner's hard constraint) - no LLM calls, no "AI" in UI copy.
  Content may be written up front, in bulk and generously, and shipped as static data. Runtime
  feedback is that curated content + deterministic rule-based heuristics + human feedback
  (Arena votes, peer picks). Coaching names the exact word to cut, the exact buried punch
  word; never vague scores.
- **Coaching is Socratic**: make the user try first, critique, then reveal a curated model
  answer. Never write the joke for them. The point is to build *their* skill.
- **Real examples are verified and credited** (comedian, source, a `sourceUrl` that verifies
  the wording; official clips only for "watch the masters"). Never invent a quote or attribute
  an original joke to a real comic.
- **Delivery Lab audio never leaves the browser**; only numbers and the transcript are stored.
- **Schema**: proper typed columns, **no JSON/`jsonb` blob columns**, every closed option
  set is a native Postgres `ENUM` (Java enum constant = label, mapped with
  `@Enumerated(STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(columnDefinition="<type>")`).
  Never edit an applied migration; a change is a new `V<n>__*.sql` in the feature's range.
- **Curated text files are append-only** where something stores an index into them
  (`practice/riff/prompts-*.txt`: `riff_day` pins indexes). Content-integrity tests guard the
  JSON/text content; keep them green.
- **Layering**: thin `@RestController` (HTTP only) -> `@Service` (rules, transactions) ->
  repository. Request/response bodies are records (DTOs), separate from entities.
  Validate with Bean Validation; errors are RFC 9457 ProblemDetail (already enabled).
  Another user's row is a 404, not a 403.
- **Identity**: anonymous-first. A controller takes `@CurrentUser UUID userId`
  (`pid` cookie, user auto-created). `GET/PUT /api/me` returns `{id, handle}`.
- **Shared core** (`app.jokesmith.core`, migration `V1__core.sql`) - use, don't fork:
  - `JokeBank.save(userId, setup, punchline, JokeSource, promptRef)` - every joke a user
    writes anywhere goes in the `joke` table so the Notebook and Arena can see it.
  - `ActivityLog.record(userId, ComedySkill, xp)` - call once per completed rep.
    xp guide: 10 quick rep, 25 full exercise, 50 lesson/major session. The progress
    feature derives streaks, XP and the radar from `practice_event` only.
  - A new `JokeSource` decides Arena visibility: `NOTEBOOK`/`PUNCH_UP` are private drafts,
    every other source is in the Arena by default (`ArenaRepository.ELIGIBLE`).
- **Frontend**
  - No raw `fetch`/axios in components: each feature has `features/<f>/api.js` with
    TanStack Query hooks (query keys prefixed with the feature name, e.g. `['riff', ...]`).
  - Every URL the app builds for itself goes through `src/basePath.js` (`appPath`, `appUrl`),
    so sub-path hosting keeps working.
  - **Every color is a token** in `src/themes.js` `SCHEMES` (`var(--accent)`, `var(--surface-2)`,
    ...) or a Mantine color prop. Never a hex literal in a component. There are two
    schemes, **dark** (default) and **light** (`components/ThemeToggle.jsx`: Light / Dark /
    System, per device in localStorage); a new token needs a value in both, and never
    `c="white"`/`color="dark"` - they break one scheme.
  - Spacing/font sizes are the scale keys in `themes.js` (`gap="2xs"`, `fz="sm"`), never raw px
    (exempt: icon sizes, intrinsic widths/heights, geometry).
  - Every page starts with `components/PageHeader.jsx` (eyebrow = the skill it trains).
  - Buttons: primary = Mantine default (filled amber), at most one per view;
    secondary `variant="default"`; quiet `variant="subtle" color="gray"`; danger
    `variant="light" color="red"`. Primary last (rightmost).
  - Tests stub HTTP with `src/test/http.js` and render with `src/test/render.jsx`.
  - Design feel: a comedy club after hours (dark) / the matinee (light: warm paper, deep
    amber ink) - one amber spotlight either way.
    Big confident display type (Bricolage Grotesque) for prompts and punchlines; the
    joke text is the hero of every screen. Keyboard-first (Enter submits, timers visible).
- **Self-hosting**: every new setting goes in `.env.example` with a default that keeps
  existing installs working unchanged; never publish Postgres in `docker-compose.yml`.

## Stack (mirrors tierlist.fm - same conventions)

- **Frontend** `frontend/`: React 19 + Vite 8, JavaScript (`.jsx`), **Mantine 9** as the
  one component library, **TanStack Query** for all server state, **axios** as the
  transport (`src/api/client.js`'s `api`), `lucide-react` icons, `react-router-dom` 7.
- **Backend** `backend/`: Spring Boot 3.3 (Java 21, Maven), package `app.jokesmith`.
- **Database**: Postgres 17, Spring Data JPA, schema owned by **Flyway**
  (`backend/src/main/resources/db/migration`, `out-of-order: true`). Hibernate `ddl-auto: validate` only.

Details (topology, layout, data model, API): [docs/architecture.md](docs/architecture.md).

## Feature ownership

Four workstreams, each owning its folders and a Flyway version range. Touch shared files
(`App.jsx`, `routes.jsx`, `nav.js`, `themes.js`, `basePath.js`, `core/`, `V1`) only if
unavoidable, and then only additively.

| Feature | Frontend | Backend package | Migrations | Routes |
|---|---|---|---|---|
| learn | `features/learn/` | `app.jokesmith.learn` | `V100`-`V199` | `/learn`, `/learn/:skill`, `/xray`, `/gym` |
| practice | `features/practice/` | `app.jokesmith.practice` | `V200`-`V299` | `/riff`, `/associate`, `/banter` |
| workshop | `features/workshop/` | `app.jokesmith.workshop` | `V300`-`V399` | `/punchup`, `/arena`, `/notebook` |
| progress | `features/progress/` | `app.jokesmith.progress` | `V400`-`V499` | `/`, `/progress`, `/delivery` |

API paths are prefixed by feature: `/api/learn/**`, `/api/practice/**`,
`/api/workshop/**`, `/api/progress/**`. Used so far: `V1`, `V100`, `V200`-`V201`,
`V300`-`V301`, `V400`.

## Running, testing, deploying

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db   # Postgres on 127.0.0.1:5433
cd backend && mvn spring-boot:run            # :48200
cd frontend && npm run dev                   # :5200, proxies /api -> :48200
```

Side-by-side dev backends: `SERVER_PORT`, `DB_URL` (one of the `jokesmith_<feature>`
scratch databases), and on the frontend `VITE_PORT` / `VITE_API_PORT`.

Checks (all must pass before a commit that touches code):

```bash
cd backend && mvn test                         # Testcontainers Postgres - Docker required
cd frontend && npm test && npx oxlint && npx vite build
```

**Deploy only with `scripts/deploy.sh`**: it runs every check above, then
`docker compose up -d --build`, then verifies the served bundle and the API on
`http://localhost:8200`. Never deploy by hand around a failing test.

## Current state (as of 2026-10-22)

- All four workstreams are built and merged on `main`: 12 pages, 9 lessons, full curated
  content (see docs/features.md for counts). Rename from the working title "punchl.in" to
  jokesmith.lol is done (Java package `app.jokesmith`; the comedy word "punchline" stays).
- Self-hosting is done: `.env.example`, `JOKESMITH_*` / `DB_*` vars, Secure cookie behind
  https, optional `JOKESMITH_BASE_PATH` sub-path.
- **In progress, not on `main`:** branch `feat/backup-restore` (local only) adds a nightly
  `backup` service (7 daily / 4 weekly / 6 monthly), `scripts/backup.sh`,
  `scripts/restore.sh` and README "Backup & restore". Until it is merged, `main`'s README
  documents a manual `pg_dump`. When merging it, also update the Backups line in
  docs/architecture.md and R22 in PRODUCT.md.
- **Known issues** and **open questions**: docs/architecture.md "Known issues" and
  PRODUCT.md "Open questions" (Point-of-view drill, Arena defaults/privacy, moderation,
  identity recovery, riff prompts after year one, licence, health-check users).

## Git workflow

- Default branch `main`, tracking `origin` (GitHub `DeM-Conve/project__jokesmith.lol`).
  Work on a branch (`feat/*`, `fix/*`, `docs/*`), then fast-forward merge into `main` locally
  and push. There is no PR flow and no CI; `scripts/deploy.sh` is the test gate.
- Commit messages: a short imperative subject. Older history uses `Area: what changed`
  (e.g. `Learn: ...`, `Self-hosting: ...`); newer docs commits use Conventional Commits
  (`docs: ...`). Either is fine; be consistent within a branch.
- Public repo: no real names, work emails, home paths or personal data in commits or files.

## Commits

- Author and committer are always `DeM-Conve <154665057+DeM-Conve@users.noreply.github.com>`
  (this repo's local git config). Never commit under any other name or email.
- No `Co-Authored-By:` trailer (no Claude co-author line) and no "Generated with Claude" line in
  commit messages or PR descriptions.
