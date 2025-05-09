@echo off
REM Windows batch script for setting up Git hooks
echo Installing Git hooks...

REM Store current directory
set PROJECT_ROOT=%CD%

REM Create hooks directory if it doesn't exist
if not exist .git\hooks mkdir .git\hooks

REM Backup existing pre-commit hook
if exist .git\hooks\pre-commit copy .git\hooks\pre-commit .git\hooks\pre-commit.bak

REM Copy our pre-commit hook
copy /Y pre-commit .git\hooks\pre-commit

REM Configure Git to ignore file mode changes
git config core.fileMode false

REM Convert line endings for bash scripts
type pre-commit | find /v /c "" > nul
type .git\hooks\pre-commit | find /v /c "" > nul
type run-lint-on-changed.sh | find /v /c "" > nul

echo Git hooks installed successfully!