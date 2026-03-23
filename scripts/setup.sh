#!/usr/bin/env bash
# =============================================================================
# setup.sh – Smart Campus Utility Hub one-command setup script
#
# Usage:
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh
#
# What this script does:
#   1. Checks for required tools (Node.js, npm, PostgreSQL)
#   2. Installs backend and frontend dependencies
#   3. Creates .env files from .env.example (if not already present)
#   4. Runs database migrations
#   5. Prints next steps
# =============================================================================

set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

log()    { echo -e "${BLUE}[setup]${RESET} $*"; }
ok()     { echo -e "${GREEN}  ✔${RESET}  $*"; }
warn()   { echo -e "${YELLOW}  ⚠${RESET}  $*"; }
error()  { echo -e "${RED}  ✖${RESET}  $*" >&2; }
header() { echo -e "\n${BOLD}$*${RESET}"; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── 1. Check Prerequisites ────────────────────────────────────────────────────
header "1. Checking prerequisites…"

check_command() {
  local cmd="$1"
  local install_hint="$2"
  if command -v "$cmd" &>/dev/null; then
    ok "$cmd found: $(command -v "$cmd")"
  else
    error "$cmd is required but not installed. $install_hint"
    exit 1
  fi
}

check_command node  "Install Node.js 18+ from https://nodejs.org/"
check_command npm   "npm comes with Node.js"
check_command psql  "Install PostgreSQL 13+ from https://www.postgresql.org/"

NODE_MAJOR=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if [[ "$NODE_MAJOR" -lt 18 ]]; then
  error "Node.js 18 or higher is required. You have $(node -v)."
  exit 1
fi
ok "Node.js version $(node -v) is supported"

# ── 2. Backend dependencies ───────────────────────────────────────────────────
header "2. Installing backend dependencies…"
cd "$REPO_ROOT/smart-campus-backend"
npm install
ok "Backend dependencies installed"

# ── 3. Frontend dependencies ──────────────────────────────────────────────────
header "3. Installing frontend dependencies…"
cd "$REPO_ROOT/smart-campus-frontend"
npm install
ok "Frontend dependencies installed"

# ── 4. Create .env files ──────────────────────────────────────────────────────
header "4. Setting up environment files…"

copy_env() {
  local dir="$1"
  local src="$dir/.env.example"
  local dst="$dir/.env"
  if [[ -f "$dst" ]]; then
    warn "$dst already exists — skipping (delete it to regenerate)"
  else
    cp "$src" "$dst"
    ok "Created $dst from $src"
  fi
}

copy_env "$REPO_ROOT/smart-campus-backend"
copy_env "$REPO_ROOT/smart-campus-frontend"

# ── 5. Database setup ─────────────────────────────────────────────────────────
header "5. Database setup…"

cd "$REPO_ROOT/smart-campus-backend"

# Source the env file to read DB credentials
# shellcheck source=/dev/null
source .env 2>/dev/null || true

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-smart_campus_unified}"
DB_USER="${DB_USER:-postgres}"

log "Attempting to connect to PostgreSQL at ${DB_HOST}:${DB_PORT}…"

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d\| -f1 | grep -qw "$DB_NAME"; then
  ok "Database '$DB_NAME' already exists"
else
  log "Creating database '$DB_NAME'…"
  if createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null; then
    ok "Database '$DB_NAME' created"
  else
    warn "Could not create database automatically. Please create it manually:"
    warn "  psql -U $DB_USER -c 'CREATE DATABASE $DB_NAME;'"
  fi
fi

log "Running schema migration…"
if npm run db:migrate 2>/dev/null; then
  ok "Database schema applied"
else
  warn "Migration script reported an issue. Check the output above."
  warn "You can run it manually: cd smart-campus-backend && npm run db:migrate"
fi

# ── 6. Done ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════════════╗"
echo -e "║     ✅  Setup complete! Here's what to do next:   ║"
echo -e "╚═══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}1. Review and update your .env files:${RESET}"
echo -e "     • smart-campus-backend/.env  (set DB_PASSWORD, JWT_SECRET)"
echo -e "     • smart-campus-frontend/.env (set VITE_API_BASE_URL)"
echo ""
echo -e "  ${BOLD}2. Start the backend:${RESET}"
echo -e "     cd smart-campus-backend && npm run dev"
echo ""
echo -e "  ${BOLD}3. Start the frontend (new terminal):${RESET}"
echo -e "     cd smart-campus-frontend && npm run dev"
echo ""
echo -e "  ${BOLD}4. Open in browser:${RESET}"
echo -e "     http://localhost:5173"
echo ""
echo -e "  Need help? Read the docs: ${BLUE}README.md${RESET}"
echo ""
