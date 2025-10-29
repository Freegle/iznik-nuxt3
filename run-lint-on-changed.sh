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

# Get all changed files that are staged for commit, excluding .ts and .tsx files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|vue)$' | grep -v -E '\.(ts|tsx)$' || true)

# Get all changed files that aren't staged (optional, uncomment if you want these too)
# UNSTAGED_FILES=$(git diff --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|vue)$' | grep -v -E '\.(ts|tsx)$' | grep -v '^modtools/' || true)
# Combine files (uniquely)
# ALL_CHANGED_FILES=$(printf "%s\n%s" "$STAGED_FILES" "$UNSTAGED_FILES" | sort | uniq)

# For now, just use staged files
ALL_CHANGED_FILES="$STAGED_FILES"

if [ -z "$ALL_CHANGED_FILES" ]; then
  success "No JavaScript/Vue files to lint (TypeScript .ts/.tsx files are excluded)."
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
  
  # Collect all files into a single array for faster processing
  FILES_TO_LINT=()
  while IFS= read -r file; do
    # Skip empty lines
    [ -z "$file" ] && continue
    
    # Add file to array if it exists
    if [ -f "$file" ]; then
      FILES_TO_LINT+=("$file")
    else
      warn "File not found: $file"
    fi
  done < "$TEMP_FILE"
  
  # Process files in batches to avoid command line length limits on Windows
  ESLINT_STATUS=0
  if [ ${#FILES_TO_LINT[@]} -gt 0 ]; then
    # Batch size - conservative limit for Windows command line
    BATCH_SIZE=50
    TOTAL_FILES=${#FILES_TO_LINT[@]}
    info "Linting $TOTAL_FILES files in batches of $BATCH_SIZE..."
    
    for ((i=0; i<TOTAL_FILES; i+=BATCH_SIZE)); do
      # Calculate end index for this batch
      END_INDEX=$((i + BATCH_SIZE))
      if [ $END_INDEX -gt $TOTAL_FILES ]; then
        END_INDEX=$TOTAL_FILES
      fi
      
      # Get the current batch
      BATCH=("${FILES_TO_LINT[@]:$i:$BATCH_SIZE}")
      BATCH_NUM=$(((i / BATCH_SIZE) + 1))
      TOTAL_BATCHES=$(((TOTAL_FILES + BATCH_SIZE - 1) / BATCH_SIZE))
      
      info "Processing batch $BATCH_NUM/$TOTAL_BATCHES (${#BATCH[@]} files)..."
      
      # Run eslint on this batch
      npx eslint --fix "${BATCH[@]}"
      BATCH_STATUS=$?
      
      # Track overall status (keep first error status)
      if [ $BATCH_STATUS -ne 0 ] && [ $ESLINT_STATUS -eq 0 ]; then
        ESLINT_STATUS=$BATCH_STATUS
      fi
    done
  else
    warn "No valid files found to lint"
  fi
  
  # Clean up temp file
  rm -f "$TEMP_FILE"
else
  # For Linux/macOS, use xargs with smaller batches to avoid command line length issues
  info "Running ESLint (Unix mode)..."
  # Use null character as delimiter to handle filenames with spaces
  # Process in batches of 50 files to avoid command line length limits
  echo "$ALL_CHANGED_FILES" | tr '\n' '\0' | xargs -0 -n 50 npx eslint --fix
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