#!/bin/bash
# CloudBridge — Install security and cloud tools
# Installs: Prowler, Checkov, gh (GitHub CLI)
# Run from project root

set -euo pipefail

SCRIPT_NAME="$(basename "$0")"

log() { echo "[$SCRIPT_NAME] $*"; }
ok()  { echo "[$SCRIPT_NAME] ✓ $*"; }
err() { echo "[$SCRIPT_NAME] ✗ $*" >&2; }

log "CloudBridge tool installer starting..."
log "Python: $(python3 --version)"
log "pip: $(pip3 --version 2>/dev/null || echo 'not found')"

# ── Checkov ──────────────────────────────────────────────────────────────────
if command -v checkov &>/dev/null; then
  ok "Checkov already installed: $(checkov --version 2>&1 | head -1)"
else
  log "Installing Checkov via pip..."
  pip3 install --user checkov
  ok "Checkov installed"
fi

# ── Prowler ──────────────────────────────────────────────────────────────────
if command -v prowler &>/dev/null; then
  ok "Prowler already installed: $(prowler --version 2>&1 | head -1)"
else
  log "Installing Prowler via pip..."
  pip3 install --user prowler
  ok "Prowler installed"
fi

# ── GitHub CLI ───────────────────────────────────────────────────────────────
if command -v gh &>/dev/null; then
  ok "GitHub CLI already installed: $(gh --version | head -1)"
else
  log "Installing GitHub CLI..."
  # Official GitHub CLI install for Debian/Ubuntu
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y gh
  ok "GitHub CLI installed"
fi

# ── Verify PATH ───────────────────────────────────────────────────────────────
MISSING=()
for tool in checkov prowler gh; do
  if ! command -v "$tool" &>/dev/null; then
    # Check ~/.local/bin
    if [ -f "$HOME/.local/bin/$tool" ]; then
      log "WARNING: $tool is in ~/.local/bin but not on PATH"
      log "Add to ~/.zshrc: export PATH=\"\$HOME/.local/bin:\$PATH\""
    else
      MISSING+=("$tool")
    fi
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  err "Some tools still missing: ${MISSING[*]}"
  err "You may need to restart your shell or add ~/.local/bin to PATH"
  exit 1
fi

ok "All tools verified."
log "Run 'checkov --version' and 'prowler --version' to confirm."
