#!/usr/bin/env bash
# Docker Sandboxes — live demo script
# Requires: Docker Desktop 4.58+ and ANTHROPIC_API_KEY in your shell profile

set -euo pipefail

SANDBOX_NAME="sandbox-demo-$(date +%s)"
PROJECT_DIR="$(cd "$(dirname "$0")/project" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

step() { echo -e "\n${CYAN}==>${NC} $*"; }
info() { echo -e "${YELLOW}    $*${NC}"; }
ok()   { echo -e "${GREEN}    ✓ $*${NC}"; }

# ──────────────────────────────────────────────
# DEMO 1: Filesystem Isolation
# ──────────────────────────────────────────────
step "DEMO 1 — Filesystem Isolation"

info "The secrets/ folder sits next to project/ on the host:"
ls -1 "$(dirname "$PROJECT_DIR")"

echo ""
info "Unsafe: mounting the whole repo lets the agent see secrets/"
echo "    docker sandbox run claude $(dirname "$PROJECT_DIR")"

echo ""
info "Safe: only mount project/ — secrets/ never enters the microVM"
echo "    docker sandbox run --name $SANDBOX_NAME claude $PROJECT_DIR"

echo ""
read -rp "    Press Enter to create the sandbox now, or Ctrl-C to skip... "

docker sandbox run --name "$SANDBOX_NAME" claude "$PROJECT_DIR" &
SANDBOX_PID=$!

# Give the sandbox a moment to start
sleep 3

ok "Sandbox '$SANDBOX_NAME' created."
info "The agent now has NO access to the secrets/ directory — it does not exist inside the VM."

# ──────────────────────────────────────────────
# DEMO 2: Network Policies
# ──────────────────────────────────────────────
step "DEMO 2 — Network Policies (deny-by-default + allowlist)"

info "Setting default policy to DENY and allowing only required hosts..."

docker sandbox network proxy "$SANDBOX_NAME" \
  --policy deny \
  --allow-host api.anthropic.com \
  --allow-host api.github.com \
  --allow-host pypi.org \
  --allow-host files.pythonhosted.org

ok "Network policy applied."
info "Allowed hosts:"
echo "    • api.anthropic.com  (Claude API)"
echo "    • api.github.com     (GitHub API)"
echo "    • pypi.org           (Python packages)"
echo "    • files.pythonhosted.org"
info "Everything else is BLOCKED — including unknown APIs and internal hosts."

# ──────────────────────────────────────────────
# DEMO 3: Inspect network logs
# ──────────────────────────────────────────────
step "DEMO 3 — Viewing Network Logs"

info "You can audit exactly what the agent tried to reach:"
echo ""
docker sandbox network log "$SANDBOX_NAME" || true

# ──────────────────────────────────────────────
# Cleanup prompt
# ──────────────────────────────────────────────
echo ""
read -rp "    Remove sandbox '$SANDBOX_NAME'? [y/N] " REMOVE
if [[ "${REMOVE,,}" == "y" ]]; then
  kill "$SANDBOX_PID" 2>/dev/null || true
  docker sandbox rm "$SANDBOX_NAME"
  ok "Sandbox removed."
else
  info "Sandbox left running. Remove it later with:"
  echo "    docker sandbox rm $SANDBOX_NAME"
fi
