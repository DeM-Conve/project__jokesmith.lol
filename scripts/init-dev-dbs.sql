-- Scratch databases so several dev backends (one per feature workstream) can
-- run side by side without fighting over one Flyway history.
CREATE DATABASE punchline_learn OWNER punchline;
CREATE DATABASE punchline_practice OWNER punchline;
CREATE DATABASE punchline_workshop OWNER punchline;
CREATE DATABASE punchline_progress OWNER punchline;
