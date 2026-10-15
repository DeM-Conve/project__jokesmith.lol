-- Workshop feature (punch-up coach, joke arena, bit notebook).
-- Never alters the shared `joke` table: per-joke data lives in workshop_* tables keyed by joke_id.

-- ---------------------------------------------------------------- notebook

-- A user's own labels for their jokes ("work", "family", "closer").
CREATE TABLE workshop_tag (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  name        VARCHAR(32) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX workshop_tag_user_name_uq ON workshop_tag (user_id, lower(name));

CREATE TABLE workshop_joke_tag (
  joke_id  BIGINT NOT NULL REFERENCES joke(id) ON DELETE CASCADE,
  tag_id   BIGINT NOT NULL REFERENCES workshop_tag(id) ON DELETE CASCADE,
  PRIMARY KEY (joke_id, tag_id)
);
CREATE INDEX workshop_joke_tag_tag_idx ON workshop_joke_tag (tag_id);

-- Presence of a row = the owner starred the joke.
CREATE TABLE workshop_favourite (
  joke_id     BIGINT PRIMARY KEY REFERENCES joke(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A bit: an ordered run of jokes on one topic.
CREATE TABLE workshop_bit (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  title       VARCHAR(80) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX workshop_bit_user_idx ON workshop_bit (user_id, created_at DESC);

CREATE TABLE workshop_bit_joke (
  bit_id    BIGINT NOT NULL REFERENCES workshop_bit(id) ON DELETE CASCADE,
  joke_id   BIGINT NOT NULL REFERENCES joke(id) ON DELETE CASCADE,
  position  SMALLINT NOT NULL CHECK (position >= 0),
  PRIMARY KEY (bit_id, joke_id)
);

-- ---------------------------------------------------------------- arena

-- Explicit arena opt-in/out. Without a row, eligibility defaults by source:
-- drafts (NOTEBOOK, PUNCH_UP) stay private, everything else is in.
CREATE TYPE workshop_arena_status AS ENUM ('ENTERED', 'WITHDRAWN');

CREATE TABLE workshop_arena_entry (
  joke_id     BIGINT PRIMARY KEY REFERENCES joke(id) ON DELETE CASCADE,
  status      workshop_arena_status NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Elo per joke, created lazily on its first duel (absent = 1200, 0-0).
CREATE TABLE workshop_joke_rating (
  joke_id     BIGINT PRIMARY KEY REFERENCES joke(id) ON DELETE CASCADE,
  rating      DOUBLE PRECISION NOT NULL DEFAULT 1200,
  wins        INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses      INTEGER NOT NULL DEFAULT 0 CHECK (losses >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX workshop_joke_rating_idx ON workshop_joke_rating (rating DESC);

CREATE TYPE workshop_vote_outcome AS ENUM ('PICK', 'SKIP');

-- One row per duel a voter judged (or skipped). One vote per voter per unordered pair.
CREATE TABLE workshop_vote (
  id              BIGSERIAL PRIMARY KEY,
  voter_id        UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  left_joke_id    BIGINT NOT NULL REFERENCES joke(id) ON DELETE CASCADE,
  right_joke_id   BIGINT NOT NULL REFERENCES joke(id) ON DELETE CASCADE,
  outcome         workshop_vote_outcome NOT NULL,
  winner_joke_id  BIGINT REFERENCES joke(id) ON DELETE CASCADE,
  -- Elo points that moved from loser to winner (0 for a skip).
  delta           DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (left_joke_id <> right_joke_id),
  CHECK ((outcome = 'SKIP' AND winner_joke_id IS NULL)
      OR (outcome = 'PICK' AND winner_joke_id IN (left_joke_id, right_joke_id)))
);
CREATE UNIQUE INDEX workshop_vote_pair_uq
  ON workshop_vote (voter_id, LEAST(left_joke_id, right_joke_id), GREATEST(left_joke_id, right_joke_id));
CREATE INDEX workshop_vote_created_idx ON workshop_vote (created_at);
CREATE INDEX workshop_vote_left_idx ON workshop_vote (left_joke_id);
CREATE INDEX workshop_vote_right_idx ON workshop_vote (right_joke_id);

-- ---------------------------------------------------------------- punch-up

CREATE TYPE workshop_punchup_stage AS ENUM ('DIAGNOSED', 'REWRITTEN');

-- One coaching session. Its versions are joke rows with source PUNCH_UP and
-- prompt_ref 'punchup:<id>'; a session started from an existing joke points at it.
CREATE TABLE workshop_punchup (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  origin_joke_id  BIGINT REFERENCES joke(id) ON DELETE SET NULL,
  stage           workshop_punchup_stage NOT NULL DEFAULT 'DIAGNOSED',
  rewrites        SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX workshop_punchup_user_idx ON workshop_punchup (user_id, created_at DESC);
