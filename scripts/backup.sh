#!/usr/bin/env bash
# Take a backup of jokesmith.lol now, while it keeps running.
#
#   scripts/backup.sh                  -> <BACKUP_LOCATION>/jokesmith-YYYYmmdd-HHMMSS.sql.gz
#   scripts/backup.sh --tag pre-restore -> <BACKUP_LOCATION>/jokesmith-pre-restore-YYYYmmdd-HHMMSS.sql.gz
#
# All of the app's state is in its Postgres database (there are no uploaded files: Delivery
# Lab audio never leaves the browser), so one backup is one gzipped plain-SQL pg_dump
# (--no-owner --no-privileges), the same format the nightly `backup` service writes.
# pg_dump reads one consistent snapshot, so nothing is stopped. Secrets (.env) are not in it.
# Progress goes to stderr; the last line on stdout is the new file's path.
# Restore one with scripts/restore.sh.
#
# Uses `docker compose` as you would from the repo root: the project name, compose files and
# env files come from COMPOSE_PROJECT_NAME / COMPOSE_FILE / COMPOSE_ENV_FILES (or .env), so
# it works the same for a plain checkout and for a stack run by a tool such as hl.
set -euo pipefail

tag=""
while [ $# -gt 0 ]; do
  case "$1" in
    --tag) tag="${2:?--tag needs a name}"; shift 2 ;;
    -h|--help) sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "!! Unknown argument: $1 (see scripts/backup.sh --help)" >&2; exit 2 ;;
  esac
done
[[ -z "$tag" || "$tag" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "!! --tag: use a-z, 0-9 and '-'" >&2; exit 2; }

cd "$(dirname "$0")/.."
app=jokesmith
compose=(docker compose)
say() { echo "$*" >&2; }

# Where backups go: the folder the `backup` service writes to, as Compose resolves it
# (BACKUP_LOCATION from the environment or the env files, default ./backups).
backup_location() {
  local dir
  dir="$("${compose[@]}" config backup 2>/dev/null | awk '
    $1 == "source:" { src = substr($0, index($0, ":") + 2) }
    $1 == "target:" && $2 == "/backups" { gsub(/^["\x27]|["\x27]$/, "", src); print src; exit }')" || true
  echo "${dir:-${BACKUP_LOCATION:-./backups}}"
}

if [ -z "$("${compose[@]}" ps --status running -q db 2>/dev/null)" ]; then
  say "!! The database (service 'db') is not running - nothing to back up."
  say "   Start it with: docker compose up -d db"
  exit 1
fi

backups="$(backup_location)"
mkdir -p "$backups"
# Time stamp in the stack's TZ, like the backup service's file names, so they sort together.
tz="$("${compose[@]}" exec -T db sh -c 'printf %s "${TZ:-UTC}"')"
name="$app${tag:+-$tag}-$(TZ="$tz" date +%Y%m%d-%H%M%S).sql.gz"
out="$backups/$name"
tmp="$backups/.$name.partial"
trap 'rm -f "$tmp"' EXIT

say "==> Backing up the database to $out"
"${compose[@]}" exec -T db sh -c \
  'pg_dump --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip -6 > "$tmp"
gzip -t "$tmp"
gzip -dc "$tmp" | tail -n 5 | grep -q 'PostgreSQL database dump complete' \
  || { say "!! The dump looks incomplete - not keeping it"; exit 1; }
mv "$tmp" "$out"
say "==> Backup done ($(du -h "$out" | cut -f1))"
echo "$out"
