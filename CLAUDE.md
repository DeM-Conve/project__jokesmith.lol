# jokesmith.lol

A gym for comedy writing: **learn** the mechanics of a joke (curriculum, joke X-ray,
formula drills), **practise** daily (riffs, association maps, timed banter), **workshop**
jokes (punch-up coach, head-to-head arena voting, a joke notebook), then **perform**
(delivery lab) and watch a skill radar grow. Built for someone who "isn't funny" yet:
every screen teaches by doing, not by reading.

## Stack (mirrors tierlist.fm - same conventions)

- **Frontend** `frontend/`: React 19 + Vite 8, JavaScript (`.jsx`), **Mantine 9** as the
  one component library, **TanStack Query** for all server state, **axios** as the
  transport (`src/api/client.js`'s `api`), `lucide-react` icons, `react-router-dom` 7.
  Tests: Vitest + Testing Library (`npm test`), lint `npx oxlint`, build `npx vite build`.
- **Backend** `backend/`: Spring Boot 3.3 (Java 21, Maven), package `app.jokesmith`.
  Tests: `mvn test` (Testcontainers Postgres - Docker is required).
- **Database**: Postgres 17, Spring Data JPA, schema owned by **Flyway**
  (`backend/src/main/resources/db/migration`). Hibernate `ddl-auto: validate` only.
- **No live AI / LLM calls at runtime** (the user's hard constraint). Content may be
  written up front, in bulk and generously (lessons, prompts, annotated jokes, model
  answers, association lists) and shipped as static data. All runtime feedback is that
  curated content + deterministic rule-based heuristics + human feedback from other
  users (Arena votes, peer picks).

## Hard rules

- **No AI anywhere** - no LLM calls, no "AI" in UI copy. Coaching quality comes from
  rich curated content and sharp, specific heuristics (name the exact word to cut, the
  exact buried punch word), never vague scores.
- **Coaching is Socratic**: make the user try first, critique, then reveal a curated
  model answer. The point is to build *their* skill.
- **Schema**: proper typed columns, **no JSON/`jsonb` blob columns**, every closed option
  set is a native Postgres `ENUM` (Java enum constant = label, mapped with
  `@Enumerated(STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(columnDefinition="<type>")`).
  Never edit an applied migration; a change is a new `V<n>__*.sql`.
- **Layering**: thin `@RestController` (HTTP only) -> `@Service` (rules, transactions) ->
  repository. Request/response bodies are records (DTOs), separate from entities.
  Validate with Bean Validation; errors are RFC 9457 ProblemDetail (already enabled).
- **Identity**: anonymous-first. A controller takes `@CurrentUser UUID userId`
  (`pid` cookie, user auto-created). `GET/PUT /api/me` returns `{id, handle}`.
- **Shared core** (`app.jokesmith.core`, migration `V1__core.sql`) - use, don't fork:
  - `JokeBank.save(userId, setup, punchline, JokeSource, promptRef)` - every joke a user
    writes anywhere goes in the `joke` table so the Notebook and Arena can see it.
  - `ActivityLog.record(userId, ComedySkill, xp)` - call once per completed rep.
    xp guide: 10 quick rep, 25 full exercise, 50 lesson/major session. The progress
    feature derives streaks, XP and the radar from `practice_event` only.
- **Frontend**
  - No raw `fetch`/axios in components: each feature has `features/<f>/api.js` with
    TanStack Query hooks (query keys prefixed with the feature name, e.g. `['riff', ...]`).
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

## Feature ownership

Four workstreams build in parallel. Each owns its folders and a Flyway version range;
touch shared files (`App.jsx`, `routes.jsx`, `nav.js`, `themes.js`, `core/`, `V1`) only if
unavoidable, and then only additively.

| Feature | Frontend | Backend package | Migrations | Routes |
|---|---|---|---|---|
| learn | `features/learn/` | `app.jokesmith.learn` | `V100`-`V199` | `/learn`, `/learn/:skill`, `/xray`, `/gym` |
| practice | `features/practice/` | `app.jokesmith.practice` | `V200`-`V299` | `/riff`, `/associate`, `/banter` |
| workshop | `features/workshop/` | `app.jokesmith.workshop` | `V300`-`V399` | `/punchup`, `/arena`, `/notebook` |
| progress | `features/progress/` | `app.jokesmith.progress` | `V400`-`V499` | `/`, `/progress`, `/delivery` |

API paths are prefixed by feature: `/api/learn/**`, `/api/practice/**`,
`/api/workshop/**`, `/api/progress/**`.

## Running locally

```bash
docker compose up -d db                      # Postgres on 127.0.0.1:5433
cd backend && mvn spring-boot:run            # :48200
cd frontend && npm run dev                   # :5200, proxies /api -> :48200
```

Side-by-side dev backends: `SERVER_PORT`, `DB_URL` (one of the `jokesmith_<feature>`
scratch databases), and on the frontend `VITE_PORT` / `VITE_API_PORT`.
