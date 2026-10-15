-- learn feature (V100-V199): lesson completion, X-ray runs, Formula Gym attempts.

-- The joke-writing formulas the X-ray detects and the Formula Gym drills.
CREATE TYPE learn_joke_formula AS ENUM (
  'MISDIRECTION', 'RULE_OF_THREE', 'EXAGGERATION', 'COMPARISON', 'LITERAL',
  'WORDPLAY', 'REVERSAL', 'MASHUP', 'ATTITUDE', 'CALLBACK', 'OTHER'
);

-- How an X-ray was produced: the automatic analyser, or the user annotating it themselves.
CREATE TYPE learn_xray_mode AS ENUM ('AUTO', 'SELF_ANNOTATED');

-- One row per (user, lesson): first completion earns the XP, later runs keep the best quiz.
CREATE TABLE learn_lesson_completion (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  skill               comedy_skill NOT NULL,
  best_quiz_correct   SMALLINT NOT NULL CHECK (best_quiz_correct >= 0),
  quiz_total          SMALLINT NOT NULL CHECK (quiz_total > 0 AND best_quiz_correct <= quiz_total),
  times_completed     INT NOT NULL DEFAULT 1 CHECK (times_completed > 0),
  first_completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill)
);

-- Every joke the user put under the X-ray (auto or self-annotated).
CREATE TABLE learn_xray_run (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  mode          learn_xray_mode NOT NULL,
  -- Gallery joke id when the joke came from the curated gallery.
  gallery_ref   VARCHAR(64),
  joke_text     VARCHAR(600) NOT NULL,
  formula       learn_joke_formula NOT NULL,
  punch_word    VARCHAR(64),
  -- SELF_ANNOTATED only: how many guided checks the user's annotation passed.
  checks_passed SMALLINT,
  checks_total  SMALLINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX learn_xray_run_user_idx ON learn_xray_run (user_id, created_at DESC);

-- One Formula Gym rep. The joke itself lives in the shared bank.
CREATE TABLE learn_gym_attempt (
  id             BIGSERIAL PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  joke_id        BIGINT REFERENCES joke(id) ON DELETE SET NULL,
  formula        learn_joke_formula NOT NULL,
  premise_id     VARCHAR(32) NOT NULL,
  checks_passed  SMALLINT NOT NULL CHECK (checks_passed >= 0),
  checks_total   SMALLINT NOT NULL CHECK (checks_total > 0 AND checks_passed <= checks_total),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX learn_gym_attempt_user_idx ON learn_gym_attempt (user_id, formula);
