#!/usr/bin/env bash
# Restore jokesmith.lol's full state from a backup, replacing what is there now.
#
#   scripts/restore.sh                   the newest backup in BACKUP_LOCATION (same as `latest`)
#   scripts/restore.sh latest --yes      ... without asking (for scripts)
#   scripts/restore.sh <file.sql.gz>     a specific backup (scripts/backup.sh or the nightly service)
#   scripts/restore.sh --list            just list the backups, newest first
#
# `latest` searches BACKUP_LOCATION and its subfolders (the nightly service's last/, daily/,
# weekly/, monthly/), skipping the pre-restore safety backups. Steps:
#   1. checks the file is a complete dump, starts the database if it is not running
#   2. asks you to confirm (unless --yes)
#   3. stops the backend, then takes a safety backup of the current state
#      (<BACKUP_LOCATION>/jokesmith-pre-restore-<ts>.sql.gz), so the restore can be undone
#   4. loads the dump into a fresh scratch database in one transaction; only if that
#      succeeds is the live database dropped and replaced by it (a bad file changes nothing)
#   5. starts the backend again (Flyway brings an older backup's schema up to date)
#      and prints the row counts of every table
set -euo pipefail

usage() { sed -n '2,19p' "$0" | sed 's/^# \{0,1\}//'; }
target="latest" yes="" list=""
while [ $# -gt 0 ]; do
  case "$1" in
    -y|--yes) yes=1 ;;
    --list) list=1 ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "!! Unknown option: $1" >&2; usage >&2; exit 2 ;;
    *) target="$1" ;;
  esac
  shift
done
# A file path is relative to where you ran the script from, not the repo.
if [ "$target" != latest ] && [ -e "$target" ]; then target="$(readlink -f "$target")"; fi

cd "$(dirname "$0")/.."
app=jokesmith
compose=(docker compose)
say() { echo "$*" >&2; }
die() { say "!! $*"; exit 1; }

backup_location() {
  local dir
  dir="$("${compose[@]}" config backup 2>/dev/null | awk '
    $1 == "source:" { src = substr($0, index($0, ":") + 2) }
    $1 == "target:" && $2 == "/backups" { gsub(/^["\x27]|["\x27]$/, "", src); print src; exit }')" || true
  echo "${dir:-${BACKUP_LOCATION:-./backups}}"
}
backups="$(backup_location)"
# The stack's TZ: the backup service names its files in it, and so does scripts/backup.sh.
tz="$("${compose[@]}" config backup 2>/dev/null | awk '$1 == "TZ:" { gsub(/["\x27]/, "", $2); print $2; exit }')" || true
tz="${tz:-UTC}"

# Every backup under BACKUP_LOCATION, newest first, as "YYYYmmdd-HHMMSS<TAB>path". The time
# comes from the file name (it survives copying to a new machine), else from the file's mtime
# (in the stack's TZ too, so both kinds sort together).
# The nightly service's *-latest.sql.gz symlinks and pre-restore backups are left out.
list_backups() {
  [ -d "$backups" ] || return 0
  TZ="$tz" find "$backups" -type f -name '*.sql.gz' ! -name '.*' ! -name '*-pre-restore-*' \
    -printf '%TY%Tm%Td-%TH%TM%TS\t%p\n' 2>/dev/null |
  while IFS=$'\t' read -r mtime path; do
    name="${path##*/}" key="${mtime:0:15}"
    if [[ "$name" =~ ([0-9]{8}-[0-9]{6})\.sql\.gz$ ]]; then key="${BASH_REMATCH[1]}"
    elif [[ "$name" =~ -([0-9]{8})\.sql\.gz$ ]]; then key="${BASH_REMATCH[1]}-000000"
    fi
    printf '%s\t%s\n' "$key" "$path"
  done | sort -r
}
show_backups() {
  list_backups | head -n "${1:-10}" | while IFS=$'\t' read -r key path; do
    printf '  %s-%s-%s %s:%s  %6s  %s\n' "${key:0:4}" "${key:4:2}" "${key:6:2}" "${key:9:2}" \
      "${key:11:2}" "$(du -h "$path" | cut -f1)" "${path#"$backups"/}"
  done
}

if [ -n "$list" ]; then
  say "Backups in $backups (newest first):"
  show_backups 1000
  exit 0
fi

if [ "$target" = latest ]; then
  file="$(list_backups | head -n 1 | cut -f2)"
  [ -n "$file" ] || die "No backups in $backups - take one with scripts/backup.sh, or pass a file"
else
  file="$target"
  [ -f "$file" ] || [ ! -f "$backups/$file" ] || file="$backups/$file"
  [ -f "$file" ] || die "No such backup: $target"
fi
file="$(readlink -f "$file")"

case "$file" in
  *.sql.gz) ;;
  *) die "Not a jokesmith backup (want a .sql.gz from scripts/backup.sh or the backup service): $file" ;;
esac
say "==> Checking $file"
gzip -t "$file" 2>/dev/null || die "$file is not a valid gzip file (truncated or corrupt?)"
gzip -dc "$file" | tail -n 5 | grep -q 'PostgreSQL database dump complete' \
  || die "$file is not a complete pg_dump (it does not end with 'PostgreSQL database dump complete')"

# The database must be up; on a fresh machine this is the first start.
if [ -z "$("${compose[@]}" ps --status running -q db 2>/dev/null)" ]; then
  if [ -n "$("${compose[@]}" ps -a -q db 2>/dev/null)" ]; then
    say "==> Starting the database"
    "${compose[@]}" start db >&2
  else
    say "==> Creating and starting the database"
    "${compose[@]}" up -d db >&2
  fi
  for _ in $(seq 1 60); do
    "${compose[@]}" exec -T db sh -c 'pg_isready -q -U "$POSTGRES_USER" -d "$POSTGRES_DB"' 2>/dev/null && break
    sleep 2
  done
  "${compose[@]}" exec -T db sh -c 'pg_isready -q -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
    || die "The database did not become ready"
fi

# psql inside the db container, as the app's Postgres user; $1 = database (default: the app's).
psql_db() {
  "${compose[@]}" exec -T -e PSQL_DB="${1:-}" -e PGOPTIONS="-c client_min_messages=warning" db sh -c \
    'psql -X -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "${PSQL_DB:-$POSTGRES_DB}" "$@"' psql "${@:2}"
}
# Rows per table, "<table><TAB><rows>" sorted by table, of a database ($1) ...
table_counts() {
  psql_db "$1" -tA -F $'\t' -c "
    select table_name,
           (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by 1"
}
# ... and of the backup file (one COPY block per table, one line per row).
file_counts() {
  gzip -dc "$file" | awk '
    /^COPY / { t = $2; sub(/^public\./, "", t); gsub(/"/, "", t); n = 0; inside = 1; next }
    inside && $0 == "\\." { printf "%s\t%d\n", t, n; inside = 0; next }
    inside { n++ }' | LC_ALL=C sort
}
db="$("${compose[@]}" exec -T db sh -c 'printf %s "$POSTGRES_DB"')"
project="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$("${compose[@]}" ps -q db)")"
scratch="${db}_restoring"
tables_now="$(psql_db "" -tAc "select count(*) from pg_tables where schemaname = 'public'" | tr -d '[:space:]')"

cat >&2 <<PLAN

  Restore jokesmith.lol (compose project '$project', database '$db') from:
    $file
    ($(du -h "$file" | cut -f1), written $(date -r "$file" '+%Y-%m-%d %H:%M'))

  This REPLACES ALL DATA in the database ($tables_now tables now) with that backup.
  A safety backup of the current state is taken first. The backend is stopped meanwhile.

  Recent backups:
$(show_backups 5)

PLAN
if [ -z "$yes" ]; then
  [ -t 0 ] || die "Not a terminal - pass --yes to restore without asking"
  read -r -p "Restore? [y/N] " answer
  [[ "$answer" =~ ^[Yy]([Ee][Ss])?$ ]] || { say "Aborted - nothing was changed."; exit 1; }
fi

# Stop what writes to the database; whatever was running is started again on exit,
# also when a step below fails (the live database is then untouched).
backend_was_running="$("${compose[@]}" ps --status running -q backend 2>/dev/null || true)"
restarted=""
restart_backend() {
  [ -n "$backend_was_running" ] && [ -z "$restarted" ] || return 0
  restarted=1
  say "==> Starting the backend"
  "${compose[@]}" start backend >&2 || return 1
  local id status=""
  id="$("${compose[@]}" ps -q backend)"
  for _ in $(seq 1 90); do
    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$id")"
    case "$status" in healthy|unhealthy|exited|dead) break ;; esac
    sleep 2
  done
  [ "$status" = healthy ] || { say "!! The backend is '$status' - see: docker compose logs backend"; return 1; }
}
trap 'restart_backend || true; psql_db postgres -c "DROP DATABASE IF EXISTS \"$scratch\"" >/dev/null 2>&1 || true' EXIT
if [ -n "$backend_was_running" ]; then
  say "==> Stopping the backend"
  "${compose[@]}" stop backend >&2
fi

if [ "$tables_now" -gt 0 ]; then
  say "==> Safety backup of the current state"
  safety="$(scripts/backup.sh --tag pre-restore)"
else
  say "==> The database is empty - no safety backup needed"
  safety=""
fi

say "==> Loading the backup into a scratch database ($scratch)"
psql_db postgres -c "DROP DATABASE IF EXISTS \"$scratch\"" -c "CREATE DATABASE \"$scratch\"" >/dev/null
gzip -dc "$file" | psql_db "$scratch" --single-transaction >/dev/null \
  || die "Loading the backup failed - the live database was NOT changed"

say "==> Checking every table holds the rows the backup has"
expected="$(file_counts)"
actual="$(table_counts "$scratch" | LC_ALL=C sort)"
[ -n "$expected" ] || die "The backup has no tables - not restoring it (the live database was NOT changed)"
if [ "$expected" != "$actual" ]; then
  diff <(echo "$expected") <(echo "$actual") >&2 || true
  die "Row counts differ from the backup (above: file < > loaded) - the live database was NOT changed"
fi

say "==> Swapping it in for '$db'"
psql_db postgres -c "DROP DATABASE \"$db\" WITH (FORCE)" -c "ALTER DATABASE \"$scratch\" RENAME TO \"$db\"" >/dev/null

if [ -n "$backend_was_running" ]; then
  restart_backend || die "Restored, but the backend did not come up healthy"
fi

# Summary: the counts verified against the file above, and the schema after Flyway ran.
counts="$(printf '%s\n' "$expected" | grep -v '^flyway_schema_history'$'\t')"
schema="$(psql_db "" -tAc "select coalesce(max(version::int), 0) || ' (' || count(*) || ' migrations)' from flyway_schema_history where success" 2>/dev/null || echo unknown)"

{
  echo
  echo "==> Restored jokesmith.lol from $file (every table's row count matches the file)"
  echo "    Schema version: $schema"
  for t in app_user joke practice_event; do
    printf '    %-28s %s\n' "$t" "$(printf '%s\n' "$counts" | awk -F'\t' -v t="$t" '$1 == t { print $2 }')"
  done
  echo "    All tables: $(printf '%s\n' "$counts" | wc -l), $(printf '%s\n' "$counts" | awk -F'\t' '{ s += $2 } END { print s }') rows"
  [ -z "$safety" ] || echo "    Undo with: scripts/restore.sh $safety"
  [ -n "$backend_was_running" ] || echo "    The app was not running - start it with: docker compose up -d"
} >&2
