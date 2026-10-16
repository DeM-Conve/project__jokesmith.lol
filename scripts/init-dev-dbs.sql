-- Scratch databases so several dev backends (one per feature workstream) can
-- run side by side without fighting over one Flyway history.
-- No OWNER clause: they belong to POSTGRES_USER, whatever DB_USERNAME is set to.
CREATE DATABASE jokesmith_learn;
CREATE DATABASE jokesmith_practice;
CREATE DATABASE jokesmith_workshop;
CREATE DATABASE jokesmith_progress;
