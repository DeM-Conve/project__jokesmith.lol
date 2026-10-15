-- Core schema shared by every feature. Feature migrations live in their own
-- version ranges (CLAUDE.md): never edit this file once applied.

-- Anonymous-first users: a random id in the `pid` cookie, a chosen handle.
CREATE TABLE app_user (
  id          UUID PRIMARY KEY,
  handle      VARCHAR(32) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The nine skills of the curriculum; every practice event trains one.
CREATE TYPE comedy_skill AS ENUM (
  'ANATOMY', 'ASSOCIATION', 'FORMULAS', 'POINT_OF_VIEW', 'ECONOMY',
  'HEIGHTENING', 'REAL_TIME_WIT', 'DELIVERY', 'FEEDBACK'
);

-- Where a joke in the bank came from.
CREATE TYPE joke_source AS ENUM (
  'DAILY_RIFF', 'FORMULA_GYM', 'PUNCH_UP', 'BANTER', 'ASSOCIATION', 'NOTEBOOK', 'DELIVERY'
);

-- The joke bank: every joke a user writes anywhere lands here.
CREATE TABLE joke (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  setup       VARCHAR(500) NOT NULL DEFAULT '',
  punchline   VARCHAR(500) NOT NULL,
  source      joke_source NOT NULL,
  -- Feature-defined grouping key, e.g. the daily riff's date '2026-10-15'.
  prompt_ref  VARCHAR(64),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX joke_user_idx ON joke (user_id, created_at DESC);
CREATE INDEX joke_prompt_idx ON joke (source, prompt_ref);

-- One row per completed rep; streaks, XP and the skill radar are derived from it.
CREATE TABLE practice_event (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  skill       comedy_skill NOT NULL,
  xp          SMALLINT NOT NULL CHECK (xp BETWEEN 0 AND 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX practice_event_user_idx ON practice_event (user_id, created_at DESC);
