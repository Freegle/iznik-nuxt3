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

# Create git hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
info "Installing pre-commit hook..."
cp .git/hooks/pre-commit .git/hooks/pre-commit.bak 2>/dev/null || true
cp ./pre-commit .git/hooks/pre-commit

# Make files executable (platform-specific)
if [ "$IS_WINDOWS" -eq 1 ]; then
  # On Windows, set git config core.fileMode false to ignore executable bit
  git config core.fileMode false
  info "On Windows, executable permissions are handled by Git"
else
  # On Unix-like systems, use chmod
  chmod +x ./run-lint-on-changed.sh
  chmod +x ./pre-commit
  chmod +x .git/hooks/pre-commit
  success "File permissions set correctly"
fi

# Ensure the pre-commit hook script can run on Windows (convert line endings if needed)
if [ "$IS_WINDOWS" -eq 1 ]; then
  info "Converting line endings for Windows compatibility..."
  # Use temporary files to avoid issues with in-place editing
  tr -d '\r' < ./pre-commit > ./pre-commit.tmp && mv ./pre-commit.tmp ./pre-commit
  tr -d '\r' < .git/hooks/pre-commit > .git/hooks/pre-commit.tmp && mv .git/hooks/pre-commit.tmp .git/hooks/pre-commit
  tr -d '\r' < ./run-lint-on-changed.sh > ./run-lint-on-changed.sh.tmp && mv ./run-lint-on-changed.sh.tmp ./run-lint-on-changed.sh
fi

success "Git hooks installed successfully!"