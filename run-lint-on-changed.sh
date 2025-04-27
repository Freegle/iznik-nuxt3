#!/usr/bin/env bash
# Cross-platform script to run ESLint on changed files
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

info "Finding changed files..."

# Get all changed files that are staged for commit, excluding .ts files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|tsx|vue)$' | grep -v '\.ts$' || true)

# Get all changed files that aren't staged (optional, uncomment if you want these too)
# UNSTAGED_FILES=$(git diff --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|tsx|vue)$' | grep -v '\.ts$' || true)
# Combine files (uniquely)
# ALL_CHANGED_FILES=$(printf "%s\n%s" "$STAGED_FILES" "$UNSTAGED_FILES" | sort | uniq)

# For now, just use staged files
ALL_CHANGED_FILES="$STAGED_FILES"

if [ -z "$ALL_CHANGED_FILES" ]; then
  success "No JavaScript/Vue files to lint (TypeScript files are excluded)."
  exit 0
fi

info "Linting the following files:"
echo "$ALL_CHANGED_FILES"

# Handle files differently based on platform
if [ "$IS_WINDOWS" -eq 1 ]; then
  # For Windows, we need to handle paths and spaces carefully
  info "Running ESLint (Windows mode)..."
  
  # Create a temporary file with the list of files
  TEMP_FILE=$(mktemp -t eslint-files-XXXXXXXX)
  echo "$ALL_CHANGED_FILES" > "$TEMP_FILE"
  
  # Read the file list one by one and run ESLint
  ESLINT_STATUS=0
  while IFS= read -r file; do
    # Skip empty lines
    [ -z "$file" ] && continue
    
    # Run eslint on each file individually to avoid path issues
    if [ -f "$file" ]; then
      info "Linting: $file"
      npx eslint --fix "$file"
      CURRENT_STATUS=$?
      
      # Keep track of any failures
      if [ $CURRENT_STATUS -ne 0 ]; then
        ESLINT_STATUS=$CURRENT_STATUS
      fi
    else
      warn "File not found: $file"
    fi
  done < "$TEMP_FILE"
  
  # Clean up temp file
  rm -f "$TEMP_FILE"
else
  # For Linux/macOS, use xargs which handles this more elegantly
  info "Running ESLint (Unix mode)..."
  # Use null character as delimiter to handle filenames with spaces
  echo "$ALL_CHANGED_FILES" | tr '\n' '\0' | xargs -0 npx eslint --fix
  ESLINT_STATUS=$?
fi

# Check exit code
if [ $ESLINT_STATUS -eq 0 ]; then
  success "ESLint completed successfully!"
  
  # Re-add the fixed files to the git staging area
  if [ -n "$STAGED_FILES" ]; then
    info "Re-staging fixed files..."
    if [ "$IS_WINDOWS" -eq 1 ]; then
      # Handle each file individually for Windows
      echo "$STAGED_FILES" | while IFS= read -r file; do
        [ -z "$file" ] && continue
        if [ -f "$file" ]; then
          git add "$file"
        fi
      done
    else
      # Use null character as delimiter for Unix
      echo "$STAGED_FILES" | tr '\n' '\0' | xargs -0 git add
    fi
  fi
else
  error "ESLint found issues. Please fix them before committing."
  exit 1
fi

success "All done! Your code is ready to commit."