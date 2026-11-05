#!/bin/bash
# CloudBridge — Pre-commit secret check
# Scans staged git files for common secret patterns
# Run before every commit: bash scripts/validation/check-secrets.sh
#
# This is a lightweight local check. The CI pipeline also runs TruffleHog.

set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
FAIL=0

log()  { echo "[$SCRIPT_NAME] $*"; }
warn() { echo "[$SCRIPT_NAME] WARN: $*" >&2; }
fail() { echo "[$SCRIPT_NAME] FAIL: $*" >&2; FAIL=1; }

log "Scanning staged files for secrets..."

# Patterns that must never be committed
PATTERNS=(
  'AKIA[0-9A-Z]{16}'                    # AWS access key
  'aws_secret_access_key\s*='           # AWS secret key variable
  'password\s*=\s*["\x27][^\x27"]{8,}' # Hardcoded password
  'BEGIN (RSA|EC|OPENSSH) PRIVATE KEY'  # Private key
  'ghp_[a-zA-Z0-9]{36}'                # GitHub PAT
  'glpat-[a-zA-Z0-9\-]{20}'            # GitLab PAT
)

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || echo "")

if [ -z "$STAGED_FILES" ]; then
  log "No staged files to check."
  exit 0
fi

for f in $STAGED_FILES; do
  if [ ! -f "$f" ]; then
    continue
  fi

  for pattern in "${PATTERNS[@]}"; do
    if grep -qEi "$pattern" "$f" 2>/dev/null; then
      fail "Potential secret in $f — pattern: $pattern"
    fi
  done
done

# Check for gitignored file types that should never be staged
for f in $STAGED_FILES; do
  case "$f" in
    *.tfstate|*.tfstate.backup)
      fail "Terraform state file staged: $f — remove with: git reset HEAD $f"
      ;;
    *.pem|*.key|*_rsa|*_dsa|*_ecdsa|*_ed25519)
      fail "Private key staged: $f — remove with: git reset HEAD $f"
      ;;
    .env)
      fail ".env file staged — remove with: git reset HEAD .env"
      ;;
    terraform.tfvars)
      warn "terraform.tfvars staged — verify it contains no secrets"
      ;;
  esac
done

if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "[$SCRIPT_NAME] ✗ Secret scan FAILED. Fix the issues above before committing."
  exit 1
else
  log "✓ No secrets detected in staged files."
  exit 0
fi
