#!/usr/bin/env bash
#
# Setup script for Git hooks
# Works on both Linux and Windows (Git Bash/WSL/MINGW)

# Print colorful messages
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Echo with color and emoji
info() {
  echo -e "${BLUE}ℹ️ $1${NC}"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

# Detect operating system
case "$(uname -s)" in
  CYGWIN*|MINGW*|MSYS*)
    IS_WINDOWS=1
    info "Windows environment detected"
    ;;
  *)
    IS_WINDOWS=0
    info "Unix-like environment detected"
    ;;
esac

# Get the path to the project root
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
info "Project root: $PROJECT_ROOT"

# Change to the project root directory
cd "$PROJECT_ROOT" || {
  error "Failed to cd to $PROJECT_ROOT"
  exit 1
}

# Make sure run-lint-on-changed.sh is executable
chmod +x ./run-lint-on-changed.sh
chmod +x ./pre-commit

# Create git hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
info "Installing pre-commit hook..."
cp .git/hooks/pre-commit .git/hooks/pre-commit.bak 2>/dev/null || true
cp ./pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

success "Git hooks installed successfully!"