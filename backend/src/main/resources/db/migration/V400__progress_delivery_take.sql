-- Progress feature (V400-V499): Delivery Lab takes.
-- Audio never leaves the browser; only the numeric analysis and the transcript land here.
CREATE TABLE delivery_take (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  -- The banked joke that was performed (NULL when typed ad hoc and not banked).
  joke_id            BIGINT REFERENCES joke(id) ON DELETE SET NULL,
  joke_text          VARCHAR(1000) NOT NULL,
  transcript         VARCHAR(4000) NOT NULL DEFAULT '',
  duration_ms        INTEGER NOT NULL CHECK (duration_ms BETWEEN 0 AND 600000),
  speech_ms          INTEGER NOT NULL CHECK (speech_ms >= 0),
  word_count         SMALLINT NOT NULL CHECK (word_count >= 0),
  words_per_minute   REAL NOT NULL CHECK (words_per_minute >= 0),
  -- Silence immediately before the final spoken segment: "the pause before the punch".
  pre_punch_pause_ms INTEGER NOT NULL CHECK (pre_punch_pause_ms >= 0),
  longest_pause_ms   INTEGER NOT NULL CHECK (longest_pause_ms >= 0),
  filler_count       SMALLINT NOT NULL CHECK (filler_count >= 0),
  -- NULL when no transcript was available to judge it.
  punch_last         BOOLEAN,
  -- Coefficient of variation of loudness while speaking (0 = monotone).
  energy_variance    REAL NOT NULL CHECK (energy_variance >= 0),
  score              SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX delivery_take_user_idx ON delivery_take (user_id, created_at DESC);
