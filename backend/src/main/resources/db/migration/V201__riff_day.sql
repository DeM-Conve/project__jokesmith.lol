-- Pins each calendar day to the prompt it was first shown with, so appending
-- prompts to the catalog (which changes the date -> prompt permutation) never
-- changes a day someone has already riffed. Index into practice/riff/prompts-*.txt
-- (append-only, so a stored index stays valid).
CREATE TABLE riff_day (
  prompt_date   DATE PRIMARY KEY,
  prompt_index  INTEGER NOT NULL CHECK (prompt_index >= 0),
  pinned_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
