# Code Coverage Setup

This project uses Playwright with monocart-reporter to generate code coverage reports and uploads them to Coveralls.io via CircleCI.

## Coverage Configuration

### Dependencies
- `monocart-reporter`: Generates comprehensive coverage reports
- `coveralls`: Uploads coverage data to Coveralls.io

### Configuration Files
- `playwright.config.js`: Playwright configuration with monocart-reporter
- `.coveralls.yml`: Coveralls configuration for CircleCI
- `.circleci/config.yml`: CircleCI configuration with coverage integration

### Scripts
- `scripts/generate-coverage.js`: Generates LCOV format files from Playwright coverage data
- `scripts/upload-coverage.js`: Uploads coverage to Coveralls

## Available Commands

### Local Development
```bash
# Run tests with coverage collection
npm run test:coverage

# View coverage report locally
npx monocart show-report monocart-report/index.html

# Upload coverage to Coveralls (CI only)
npm run coveralls
```

### CI/CD
```bash
# Run full coverage pipeline
npm run test:coverage:upload
```

## Coverage Reports

### Local Reports
- **HTML Report**: `monocart-report/index.html` - Interactive coverage report
- **LCOV Report**: `coverage/lcov.info` - LCOV format for CI/CD integration

### Online Reports
- **Coveralls**: Automatic upload in CI/CD pipeline via CircleCI

## CircleCI Integration

The CircleCI configuration (`.circleci/config.yml`) automatically:
1. Runs on all branches and pull requests
2. Installs dependencies and Playwright browsers
3. Builds and serves the application
4. Executes tests with coverage collection
5. Uploads coverage to Coveralls.io
6. Archives coverage artifacts and reports

## Coverage Filtering

Coverage collection focuses on:
- `/.nuxt/` - Nuxt.js generated files
- `/components/` - Vue components
- `/pages/` - Nuxt pages
- `/layouts/` - Nuxt layouts
- `/plugins/` - Nuxt plugins
- `/middleware/` - Nuxt middleware
- `/composables/` - Vue composables
- `/utils/` - Utility functions
- `/stores/` - Pinia stores

## Setting Up Coveralls

1. Go to [Coveralls.io](https://coveralls.io)
2. Sign in with GitHub
3. Add your repository
4. Get the repository token
5. Add `COVERALLS_REPO_TOKEN` to CircleCI environment variables (if needed)

Note: For public repositories, the token is usually not required when using CircleCI.

## CircleCI Environment Variables

Add these environment variables in your CircleCI project settings if needed:
- `COVERALLS_REPO_TOKEN`: Repository token from Coveralls (for private repos)
- Additional test environment variables as configured in your CircleCI config