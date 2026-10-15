-- Scratch databases so several dev backends (one per feature workstream) can
-- run side by side without fighting over one Flyway history.
CREATE DATABASE jokesmith_learn OWNER jokesmith;
CREATE DATABASE jokesmith_practice OWNER jokesmith;
CREATE DATABASE jokesmith_workshop OWNER jokesmith;
CREATE DATABASE jokesmith_progress OWNER jokesmith;
