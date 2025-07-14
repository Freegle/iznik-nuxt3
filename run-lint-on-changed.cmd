echo @echo off
setlocal enabledelayedexpansion
REM Windows batch script for running ESLint on changed files

echo Finding changed files...

REM Create a temporary file to store the list of changed files
set TEMP_FILE=%TEMP%\eslint-files-%RANDOM%.txt

REM Get staged files, excluding .ts and .tsx files
git diff --name-only --diff-filter=ACMR | findstr /I "\.js \.jsx \.vue" | findstr /V /I "\.ts \.tsx" > %TEMP_FILE%

echo Linting the following files:
type %TEMP_FILE%

REM Process each file
set FILES_TO_LINT=
for /F "usebackq delims=" %%F in (%TEMP_FILE%) do (
  if exist "%%F" (
    set FILES_TO_LINT=!FILES_TO_LINT! "%%F"
  ) else (
    echo File not found: %%F
  )
)

REM Run ESLint on all files
echo Running ESLint...
call npx eslint --fix %FILES_TO_LINT%
set ESLINT_STATUS=%ERRORLEVEL%

REM Clean up temp file
del "%TEMP_FILE%"

REM Check if ESLint succeeded
if %ESLINT_STATUS% == 0 (
  echo ESLint completed successfully!
  
  REM Re-add the fixed files to git staging
  echo Re-staging fixed files...
  git diff --cached --name-only --diff-filter=ACMR | findstr /I /E ".js .jsx .vue" | findstr /V /I /E ".ts .tsx" > %TEMP_FILE%
  
  for /F "usebackq delims=" %%F in (%TEMP_FILE%) do (
    if exist "%%F" (
      git add "%%F"
    )
  )
  
  del "%TEMP_FILE%"
  echo All done! Your code is ready to commit.
  exit /b 0
) else (
  echo ESLint found issues. Please fix them before committing.
  del "%TEMP_FILE%"
  exit /b 1
)