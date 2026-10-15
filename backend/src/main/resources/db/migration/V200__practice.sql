-- Practice feature (daily riff, association mapper, banter simulator).
-- Versions V200-V299 belong to the practice workstream (CLAUDE.md).

-- ---------------------------------------------------------------- daily riff
-- One finished timed riff on a day's prompt. The punchlines themselves live in
-- the shared `joke` table (source DAILY_RIFF, prompt_ref = ISO date).
CREATE TABLE riff_session (
  id               BIGSERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  prompt_date      DATE NOT NULL,
  punchline_count  SMALLINT NOT NULL CHECK (punchline_count BETWEEN 1 AND 100),
  seconds_used     SMALLINT NOT NULL CHECK (seconds_used BETWEEN 0 AND 3600),
  xp               SMALLINT NOT NULL CHECK (xp BETWEEN 0 AND 100),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX riff_session_user_idx ON riff_session (user_id, prompt_date);

-- The user's favourite punchline for a day: one per user per day.
CREATE TABLE riff_best_pick (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  prompt_date  DATE NOT NULL,
  joke_id      BIGINT NOT NULL REFERENCES joke(id) ON DELETE CASCADE,
  picked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, prompt_date)
);
CREATE INDEX riff_best_pick_date_idx ON riff_best_pick (prompt_date, picked_at DESC);

-- ------------------------------------------------------- association mapper
CREATE TYPE association_category AS ENUM ('PEOPLE', 'PLACES', 'THINGS', 'PHRASES', 'FEELINGS');

CREATE TABLE association_session (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  topic         VARCHAR(80) NOT NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX association_session_user_idx ON association_session (user_id, created_at DESC);

CREATE TABLE association_item (
  id          BIGSERIAL PRIMARY KEY,
  session_id  BIGINT NOT NULL REFERENCES association_session(id) ON DELETE CASCADE,
  category    association_category NOT NULL,
  text        VARCHAR(80) NOT NULL,
  position    SMALLINT NOT NULL
);
CREATE INDEX association_item_session_idx ON association_item (session_id, position);

-- ---------------------------------------------------------- banter simulator
CREATE TYPE banter_persona AS ENUM ('FRIEND', 'COWORKER', 'DATE');
-- The comedic technique a curated example reply demonstrates.
CREATE TYPE banter_technique AS ENUM (
  'EXAGGERATION', 'MISDIRECTION', 'LITERAL', 'REVERSAL', 'UNDERSTATEMENT',
  'CALLBACK', 'SELF_DEPRECATION', 'ESCALATION', 'ROLE_PLAY'
);
-- After seeing the example, the user judges their own reply against it.
CREATE TYPE banter_self_rating AS ENUM ('BEAT_IT', 'MATCHED', 'NOT_YET');

CREATE TABLE banter_session (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  persona         banter_persona NOT NULL,
  seconds_limit   SMALLINT NOT NULL CHECK (seconds_limit IN (5, 10, 15)),
  xp              SMALLINT CHECK (xp BETWEEN 0 AND 100),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX banter_session_user_idx ON banter_session (user_id, created_at DESC);

-- One of the 5 rounds of a session; the reply columns fill in when it's answered.
CREATE TABLE banter_round (
  id           BIGSERIAL PRIMARY KEY,
  session_id   BIGINT NOT NULL REFERENCES banter_session(id) ON DELETE CASCADE,
  round_no     SMALLINT NOT NULL CHECK (round_no BETWEEN 1 AND 5),
  line_key     VARCHAR(16) NOT NULL,
  line         VARCHAR(300) NOT NULL,
  reply        VARCHAR(300),
  response_ms  INTEGER CHECK (response_ms >= 0),
  timed_out    BOOLEAN,
  wit          SMALLINT CHECK (wit BETWEEN 1 AND 5),
  surprise     SMALLINT CHECK (surprise BETWEEN 1 AND 5),
  kindness     SMALLINT CHECK (kindness BETWEEN 1 AND 5),
  tip          VARCHAR(400),
  example      VARCHAR(300),
  example_technique banter_technique,
  self_rating  banter_self_rating,
  joke_id      BIGINT REFERENCES joke(id) ON DELETE SET NULL,
  answered_at  TIMESTAMPTZ,
  UNIQUE (session_id, round_no)
);
