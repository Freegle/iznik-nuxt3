# Plan: Merge app-ci-fd Branch into master

## Executive Summary

**Goal**: Consolidate the app-ci-fd branch into master to eliminate code divergence and enable building both web and mobile app from a single branch.

**Current Problem**:
- app-ci-fd contains fixes (e.g., calendar functionality) not present in master
- This creates maintenance overhead and bugs when fixes are only applied to one branch
- Separate branches make it harder to ensure feature parity

**Proposed Solution**:
- Merge app-ci-fd into master
- Use runtime/build-time configuration switches (`ISAPP` environment variable) to handle platform differences
- Build both web (Docker) and mobile (CircleCI) from master branch

**Key Finding**: After analysis, there is **NO fundamental technical reason** to maintain separate branches. The codebase already has the infrastructure (ISAPP flag) to support both platforms from a single branch.

---

## Current State Analysis

### Branch Divergence

**Commits in app-ci-fd NOT in master** (as of 2025-11-12):
1. `80fa0a72` - Restore fastlane directory for iOS/Android builds
2. `728839ca` - Restore app-specific files (android, ios, VERSION.txt, etc)
3. `34ee356d` - Restore CircleCI config for app builds
4. `660a5db1` - Use fdapilive API endpoint instead of fdapidbg
5. `2bc605de` - Use dayjs timezone support for proper BST/timezone handling
6. `95240d22` - Fix calendar functionality to use new API format

**Commits in master NOT in app-ci-fd**:
1. `b8b39edb` - Use dayjs timezone support for proper BST/timezone handling (DUPLICATE)
2. `74e78195` - Fix calendar functionality to use new API format (DUPLICATE)
3. `59db4256` - Use fdapilive API endpoint instead of fdapidbg (DUPLICATE)

**Analysis**: The calendar and API fixes were applied to both branches, but app-ci-fd has additional commits for app infrastructure that master lacks.

### File Differences

**Files ONLY in app-ci-fd** (not in master):
1. `.circleci/config.yml` (822 lines) - CircleCI pipeline for iOS/Android builds
2. `android/` directory (96+ files) - Complete Android native project
3. `ios/` directory (multiple files) - Complete iOS native project
4. `fastlane/` directory (4 files) - Deployment automation for app stores
5. `Gemfile` + `Gemfile.lock` - Ruby dependencies for fastlane
6. `VERSION.txt` - Mobile app version tracking
7. `capacitor.config.ts` - Capacitor native bridge configuration
8. `README-APP.md` - Mobile app documentation

**Files with NO differences**:
- `package.json` - Same dependencies on both branches ✅
- `nuxt.config.ts` - Already has ISAPP support on both branches ✅
- All `.vue` components - No differences in actual application code ✅
- `config.js` - Same on both branches ✅

**Critical Finding**: The actual application code (Vue components, composables, stores) is IDENTICAL between branches. The only differences are build artifacts and native platform files.

---

## Technical Architecture Analysis

### How ISAPP Works

The codebase already has a mature system for supporting both web and mobile from the same code:

**Environment Variable**:
```javascript
// config.js
ISAPP: process.env.ISAPP === 'true'
```

**Build Configuration** (nuxt.config.ts):
```typescript
target: config.ISAPP ? 'static' : 'server',  // Static for app, SSR for web
ssr: !config.ISAPP,  // Disable SSR for mobile app
```

**Runtime Checks** (components can detect app vs web):
```javascript
// Components can check:
if (config.ISAPP) {
  // App-specific behavior
} else {
  // Web-specific behavior
}
```

**Usage Count**: Only 8 references to ISAPP in entire codebase, indicating minimal platform-specific code.

### Why Separate Branches Were Created

Based on README-APP.md, the app branch was originally created for:

1. **SSR Disabled**: Mobile apps use Static Site Generation instead of Server-Side Rendering
2. **Different Build Target**: `static` vs `server`
3. **Native Code**: Android/iOS platform-specific files
4. **CircleCI Configuration**: App builds run in CircleCI, web builds in Docker

**However**: All of these can coexist in a single branch:
- ISAPP flag already handles SSR/static differences ✅
- Native files (android/, ios/) don't interfere with web builds ✅
- .circleci/config.yml can live alongside Docker setup ✅
- Different build commands can be run from same source ✅

---

## Merge Strategy

### Phase 1: Pre-Merge Preparation

**1.1 Sync Common Fixes**
- Verify calendar fixes are identical on both branches
- Ensure API endpoint (fdapilive) is consistent
- Check for any other code divergence in .vue/.js files

**1.2 Document App-Specific Files**
- Update .gitignore if needed (ensure build artifacts ignored)
- Verify app files don't conflict with web build process
- Document which files are app-only vs shared

**1.3 Test Current State**
- ✅ Web build on master still works
- ✅ App build on app-ci-fd still works
- Document exact build commands for both

### Phase 2: Merge Execution

**2.1 Create Backup Branch**
```bash
git checkout app-ci-fd
git branch app-ci-fd-backup
git push origin app-ci-fd-backup
```

**2.2 Merge app-ci-fd into master**
```bash
git checkout master
git merge app-ci-fd --no-ff -m "Merge app-ci-fd into master: Consolidate web and mobile app into single branch"
```

**Expected Conflicts**: NONE
- No overlapping file changes (app files are all new to master)
- Common fixes already applied to both branches
- package.json is identical

**2.3 Verify Merge Result**
- All app files present: android/, ios/, fastlane/, .circleci/config.yml ✅
- All web files intact: Docker configs, nuxt.config.ts ✅
- No unexpected file changes ✅

### Phase 3: Update Build Infrastructure

**3.1 Update CircleCI Trigger**
```yaml
# In iznik-nuxt3 GitHub Actions (if exists)
# Change branch trigger from 'app-ci-fd' to 'master'
```

**3.2 Update Documentation**
- README.md: Update to mention both web and mobile build from master
- README-APP.md: Update branch references from app-ci-fd to master
- CLAUDE.md: Update branch strategy documentation

**3.3 Update Build Commands**
```bash
# Web (unchanged):
npm run dev    # Development
npm run build  # Production

# Mobile (now from master):
ISAPP=true npm run generate  # Build static site
npx cap sync                 # Sync to native projects
# Then use CircleCI or local fastlane
```

### Phase 4: Testing & Validation

**4.1 Web Build Testing**
```bash
# On master after merge
docker-compose build freegle-dev
docker-compose up freegle-dev
# Verify: http://freegle-dev.localhost works
```

**4.2 Mobile Build Testing**
```bash
# On master after merge
ISAPP=true npm run generate
# Verify: .output/public exists with static files
npx cap sync android
npx cap sync ios
# Verify: Native projects updated successfully
```

**4.3 CircleCI Pipeline Testing**
- Push master to GitHub
- Verify CircleCI picks up .circleci/config.yml
- Verify iOS and Android builds succeed
- Confirm builds deploy to TestFlight/Play Store

**4.4 Feature Parity Testing**
- Test calendar functionality on both web and mobile ✅
- Test API connections (fdapilive) on both platforms ✅
- Test any ISAPP-conditional features ✅

### Phase 5: Cleanup & Deprecation

**5.1 Deprecate app-ci-fd Branch**
```bash
# Add to branch description
git branch --edit-description app-ci-fd
# "DEPRECATED: Merged into master on 2025-11-12. Do not use."

# Or delete after verification period:
# git push origin --delete app-ci-fd
```

**5.2 Update CI/CD**
- Remove any app-ci-fd branch protections
- Add branch protection to master for app builds
- Update deployment keys/secrets if needed

**5.3 Team Communication**
- Announce branch consolidation
- Update developer documentation
- Provide migration guide for any local dev setups

---

## Risk Analysis & Mitigation

### Risk 1: Web Build Breaks
**Likelihood**: Very Low
**Impact**: High
**Mitigation**:
- App files (android/, ios/) don't interfere with web builds
- package.json is identical (no dependency conflicts)
- Docker build process unchanged (still targets web)
- Test web build immediately after merge

**Rollback Plan**:
```bash
git revert -m 1 <merge-commit-hash>
```

### Risk 2: Mobile Build Breaks
**Likelihood**: Very Low
**Impact**: High
**Mitigation**:
- All app files being merged from working app-ci-fd branch
- CircleCI config proven to work
- ISAPP flag already exists in master

**Rollback Plan**:
```bash
# Temporarily use app-ci-fd-backup branch
git push origin app-ci-fd-backup:app-ci-fd --force
```

### Risk 3: Future Code Divergence
**Likelihood**: Medium (if not managed)
**Impact**: Medium
**Mitigation**:
- Single branch eliminates divergence possibility
- All PRs now apply to both web and mobile automatically
- CI/CD tests both platforms on every commit

**Prevention**:
- Add CI check to build both web AND mobile on every PR
- Document ISAPP usage patterns for developers
- Code review checklist for platform compatibility

### Risk 4: Build Confusion (Web vs Mobile)
**Likelihood**: Low
**Impact**: Low
**Mitigation**:
- Clear documentation of build commands
- Environment variables make distinction explicit (ISAPP=true)
- Different output directories (.output/ vs android/ios builds)

**Prevention**:
- Update package.json with clear scripts:
  ```json
  {
    "scripts": {
      "dev": "nuxt dev",
      "build:web": "nuxt build",
      "build:app": "ISAPP=true nuxt generate"
    }
  }
  ```

---

## Configuration Switches Required

### Existing Switches (Already in place)

**1. ISAPP Environment Variable**
- **Location**: config.js, nuxt.config.ts
- **Purpose**: Distinguish mobile app from web
- **Usage**: Set to 'true' for mobile builds
- **Status**: ✅ Already working in both branches

**2. SSR Toggle**
- **Location**: nuxt.config.ts
- **Code**: `ssr: !config.ISAPP`
- **Purpose**: Disable server-side rendering for mobile
- **Status**: ✅ Already working

**3. Build Target**
- **Location**: nuxt.config.ts
- **Code**: `target: config.ISAPP ? 'static' : 'server'`
- **Purpose**: Static generation for mobile vs SSR for web
- **Status**: ✅ Already working

### New Switches Needed

**NONE** - The existing infrastructure is sufficient!

### Component-Level Switches (Minimal)

Current ISAPP usage in components (only 4 files):
1. `config.js` - Defines ISAPP flag
2. `nuxt.config.ts` - Build configuration
3. `LayoutCommon.vue` - Layout adjustments (likely status bar)
4. `ExternalDa.vue` - External data/ads handling

**Best Practice Pattern**:
```vue
<script setup>
import config from '~/config'

// Use config.ISAPP for conditional logic
if (config.ISAPP) {
  // Mobile-specific code (e.g., Capacitor plugins)
} else {
  // Web-specific code (e.g., PWA features)
}
</script>

<template>
  <!-- Use v-if for conditional rendering -->
  <div v-if="!config.ISAPP" class="web-only">
    <!-- Web-only UI -->
  </div>
  <div v-else class="app-only">
    <!-- Mobile-only UI -->
  </div>
</template>
```

---

## Build Process Documentation

### Web Build (Docker - Current, Unchanged)

**Development**:
```bash
# In iznik-nuxt3 directory
npm run dev
# Serves on http://localhost:3002 with hot reload
```

**Production**:
```bash
# In FreegleDocker root
docker-compose build freegle-prod
docker-compose up freegle-prod
# Serves optimized build with SSR
```

**Environment**:
- `ISAPP=false` (default)
- SSR enabled
- Server target

### Mobile Build (CircleCI - After Merge)

**Local Development** (testing):
```bash
# In iznik-nuxt3 directory
ISAPP=true npm run generate
npx cap sync android
npx cap sync ios
npx cap open android  # Or 'ios' for iOS
```

**CI/CD Production** (CircleCI):
```yaml
# .circleci/config.yml automatically:
# 1. Sets ISAPP=true
# 2. Runs npm run generate
# 3. Syncs to android/ios projects
# 4. Builds signed APK/IPA
# 5. Deploys to Play Store/TestFlight
```

**Environment**:
- `ISAPP=true`
- SSR disabled
- Static target
- Output: `.output/public/`

### Key Differences

| Aspect | Web (Docker) | Mobile (CircleCI) |
|--------|-------------|-------------------|
| Branch | master | master (after merge) |
| ISAPP | false | true |
| SSR | Enabled | Disabled |
| Target | server | static |
| Output | .nuxt/ | .output/public/ |
| Runtime | Node.js server | Static files in native wrapper |
| Build Tool | Docker | npm + Capacitor + fastlane |
| Deploy | Docker Registry / Netlify | App Store / Play Store |

---

## Success Criteria

### Immediate Post-Merge

- [ ] Git merge completes without conflicts
- [ ] All app files present in master: android/, ios/, fastlane/, .circleci/
- [ ] All web files unchanged: Docker configs, nuxt.config.ts
- [ ] No unexpected file deletions or modifications

### Web Platform Validation

- [ ] Docker build succeeds: `docker-compose build freegle-dev`
- [ ] Docker container runs: `docker-compose up freegle-dev`
- [ ] Web app accessible: http://freegle-dev.localhost
- [ ] All web features functional (login, post creation, chat, etc.)
- [ ] No console errors related to mobile-specific code
- [ ] Playwright tests pass: `npm run test`

### Mobile Platform Validation

- [ ] Static build succeeds: `ISAPP=true npm run generate`
- [ ] Output directory created: `.output/public/` exists and populated
- [ ] Capacitor sync succeeds: `npx cap sync android && npx cap sync ios`
- [ ] Android project opens: `npx cap open android`
- [ ] iOS project opens: `npx cap open ios`
- [ ] CircleCI pipeline triggers on master branch push
- [ ] CircleCI Android build completes successfully
- [ ] CircleCI iOS build completes successfully
- [ ] Android APK/AAB uploaded to Play Store
- [ ] iOS IPA uploaded to TestFlight

### Feature Parity

- [ ] Calendar "Add to Calendar" works on web (downloads .ics file)
- [ ] Calendar "Add to Calendar" works on mobile (native calendar integration)
- [ ] API calls use fdapilive on both platforms
- [ ] Timezone handling (dayjs) works correctly on both platforms
- [ ] Login works on both platforms
- [ ] Chat works on both platforms
- [ ] Image upload works on both platforms

### Documentation

- [ ] README.md updated with build instructions for both platforms
- [ ] README-APP.md updated to reference master branch
- [ ] CLAUDE.md updated to remove app-ci-fd references
- [ ] package.json scripts clear (build:web, build:app)
- [ ] Inline code comments explain ISAPP usage where relevant

### Cleanup

- [ ] app-ci-fd branch marked as deprecated (or deleted after grace period)
- [ ] app-ci-fd-backup branch exists as safety net
- [ ] GitHub branch protection updated for master
- [ ] CI/CD triggers updated to use master
- [ ] Team notified of branch consolidation

---

## Timeline & Execution

### Recommended Schedule

**Day 1 (Preparation)**:
- [ ] Review this plan with team
- [ ] Verify current state: both branches build successfully
- [ ] Create app-ci-fd-backup branch
- [ ] Communicate planned merge to team

**Day 2 (Merge & Initial Testing)**:
- [ ] Execute merge: `git merge app-ci-fd into master`
- [ ] Immediate smoke tests: Git status, file presence
- [ ] Test web build locally: Docker containers
- [ ] Test mobile build locally: `ISAPP=true npm run generate`
- [ ] Push to master

**Day 3 (CI/CD Validation)**:
- [ ] Verify CircleCI pipeline triggers
- [ ] Monitor iOS build completion
- [ ] Monitor Android build completion
- [ ] Verify Play Store / TestFlight uploads
- [ ] Test deployed mobile apps

**Day 4 (Integration Testing)**:
- [ ] Full feature testing on web platform
- [ ] Full feature testing on mobile app
- [ ] Cross-platform testing (calendar, chat, etc.)
- [ ] Performance testing

**Day 5 (Cleanup & Documentation)**:
- [ ] Update all documentation
- [ ] Deprecate/delete app-ci-fd branch
- [ ] Team retrospective
- [ ] Monitor for issues

### Rollback Triggers

**Immediate Rollback** if:
- Web build fails and cannot be fixed within 2 hours
- Mobile build fails and cannot be fixed within 2 hours
- Critical feature broken on either platform
- Data loss or corruption occurs

**Rollback Procedure**:
```bash
# If issues found immediately:
git revert -m 1 <merge-commit-hash>
git push origin master

# If need to restore app-ci-fd temporarily:
git push origin app-ci-fd-backup:app-ci-fd --force
# Update CircleCI to use app-ci-fd again temporarily
```

### Grace Period

- Keep app-ci-fd-backup branch for **30 days** after successful merge
- Monitor error rates and user reports for **7 days** post-merge
- If no issues after 30 days, delete app-ci-fd and app-ci-fd-backup branches

---

## Post-Merge Development Workflow

### For Developers

**Before merge** (current state):
```bash
# Web development
git checkout master
npm run dev

# Mobile development
git checkout app-ci-fd
ISAPP=true npm run generate
```

**After merge** (new workflow):
```bash
# Both web AND mobile from master
git checkout master

# Web development
npm run dev

# Mobile development
ISAPP=true npm run generate
```

**Benefits**:
- Single source of truth
- Fixes automatically apply to both platforms
- No branch synchronization overhead
- Easier code review (one PR for both platforms)

### For CI/CD

**Before merge**:
- Web: Docker builds from master
- Mobile: CircleCI builds from app-ci-fd
- Separate branch protection rules
- Risk of divergence

**After merge**:
- Web: Docker builds from master (unchanged)
- Mobile: CircleCI builds from master (changed)
- Single branch protection rule
- No divergence possible

### For Testing

**Before merge**:
- Must test web changes on master
- Must test mobile changes on app-ci-fd
- Must manually sync fixes between branches
- Risk of missing platform-specific bugs

**After merge**:
- Single PR tests both web and mobile
- Playwright tests run for web automatically
- Can add mobile-specific tests to CI
- Platform-specific bugs caught earlier

---

## Alternatives Considered

### Alternative 1: Keep Separate Branches
**Pros**:
- Status quo, no migration work
- "Safer" perception (isolation)

**Cons**:
- Continued maintenance overhead
- Code divergence continues (as evidenced by calendar bug)
- Duplicate work applying fixes to both branches
- Confusion about which branch has latest code
- Higher risk of bugs due to inconsistency

**Verdict**: ❌ Not recommended - problems will only worsen over time

### Alternative 2: Separate Repositories
**Pros**:
- Complete isolation
- Independent versioning

**Cons**:
- Even worse than separate branches
- Massive code duplication
- Shared components require sync mechanism
- npm packages or git submodules add complexity
- Much harder to maintain feature parity

**Verdict**: ❌ Not recommended - compounds the problems

### Alternative 3: Mono-repo with Workspaces
**Pros**:
- Clean separation of web vs mobile
- Shared code in common workspace
- Industry standard pattern

**Cons**:
- Major restructuring required
- Migration complexity very high
- Overkill for this use case (code is 95% shared)
- Doesn't solve the core issue (they're the same app!)

**Verdict**: ❌ Not recommended - too complex for minimal benefit

### Alternative 4: **Merge into Master (Recommended)**
**Pros**:
- Single source of truth ✅
- ISAPP flag already exists and works ✅
- No code duplication ✅
- Fixes automatically apply to both platforms ✅
- Simpler development workflow ✅
- No migration complexity (just a merge) ✅
- Future-proof (no divergence possible) ✅

**Cons**:
- Small initial merge effort (1-2 days)
- Developers must be aware of ISAPP flag
- Slightly larger repository (native files included)

**Verdict**: ✅ **RECOMMENDED** - Best balance of simplicity and maintainability

---

## Implementation Checklist

### Pre-Merge
- [ ] Read and understand this entire plan
- [ ] Verify web build works on master: `docker-compose build freegle-dev`
- [ ] Verify app build works on app-ci-fd: `ISAPP=true npm run generate`
- [ ] Create backup branch: `git branch app-ci-fd-backup && git push origin app-ci-fd-backup`
- [ ] Notify team of upcoming merge

### Merge Execution
- [ ] Checkout master: `git checkout master`
- [ ] Ensure master is up-to-date: `git pull origin master`
- [ ] Merge app-ci-fd: `git merge app-ci-fd --no-ff`
- [ ] Verify no conflicts occurred
- [ ] Check git status for unexpected changes
- [ ] Review merged files: `git diff HEAD~1`

### Initial Validation
- [ ] Verify app files present: `ls -la android ios fastlane .circleci`
- [ ] Verify web files intact: `ls -la docker nuxt.config.ts`
- [ ] Check package.json unchanged: `git diff HEAD~1 package.json`
- [ ] Test web build: `docker-compose build freegle-dev && docker-compose up freegle-dev`
- [ ] Test mobile build: `ISAPP=true npm run generate && npx cap sync`

### Push & CI/CD
- [ ] Push to master: `git push origin master`
- [ ] Monitor GitHub Actions (if any)
- [ ] Monitor CircleCI pipeline
- [ ] Check CircleCI detects .circleci/config.yml
- [ ] Wait for Android build completion
- [ ] Wait for iOS build completion
- [ ] Verify Play Store upload
- [ ] Verify TestFlight upload

### Testing
- [ ] Web smoke test: Login, create post, send chat message
- [ ] Mobile smoke test: Same actions in TestFlight/Play Store beta
- [ ] Calendar test: Web (download .ics) and Mobile (native calendar)
- [ ] API test: Verify fdapilive used on both platforms
- [ ] Playwright tests: `npm run test` passes
- [ ] Monitor Sentry for errors (both platforms)

### Documentation
- [ ] Update README.md: Build instructions for both platforms
- [ ] Update README-APP.md: Change app-ci-fd → master
- [ ] Update CLAUDE.md: Remove app-ci-fd references
- [ ] Add package.json scripts: `build:web` and `build:app`
- [ ] Update any other docs mentioning app-ci-fd

### Cleanup
- [ ] Mark app-ci-fd as deprecated in GitHub
- [ ] Update CircleCI to use master (if not automatic)
- [ ] Update branch protection rules on GitHub
- [ ] Communicate merge completion to team
- [ ] Schedule app-ci-fd deletion for 30 days out

### Monitoring (First Week)
- [ ] Day 1: Check error rates (Sentry)
- [ ] Day 2: Monitor user reports
- [ ] Day 3: Check mobile app reviews (Play Store / App Store)
- [ ] Day 7: Team retrospective on merge
- [ ] Day 30: Delete app-ci-fd and app-ci-fd-backup if all clear

---

## Conclusion

**Recommendation**: ✅ **PROCEED WITH MERGE**

The analysis shows overwhelming benefits and minimal risks:

1. **Technical Feasibility**: The ISAPP infrastructure already exists and works perfectly
2. **No Dependencies Issues**: package.json is identical between branches
3. **No Code Conflicts**: Application code (.vue files) are the same
4. **Proven Pattern**: ISAPP flag already successfully separates web vs mobile
5. **Low Risk**: Native files (android/, ios/) don't interfere with web builds
6. **High Reward**: Eliminates code divergence permanently

The recent calendar bug is a perfect example of why this merge is necessary: fixes had to be applied to both branches separately, and there's always a risk of them being different or one being forgotten.

**Next Step**: Execute the merge following the checklist above, starting with the backup branch creation and team notification.

---

## Appendix: Command Reference

### Git Commands
```bash
# Create backup
git branch app-ci-fd-backup
git push origin app-ci-fd-backup

# Execute merge
git checkout master
git pull origin master
git merge app-ci-fd --no-ff
git push origin master

# Rollback if needed
git revert -m 1 <merge-commit-hash>
```

### Build Commands
```bash
# Web development
npm run dev

# Web production
docker-compose build freegle-prod
docker-compose up freegle-prod

# Mobile development
ISAPP=true npm run generate
npx cap sync android ios
npx cap open android  # or ios

# Mobile production (CircleCI)
# Automatically triggered on push to master
```

### Testing Commands
```bash
# Web tests
npm run test              # Playwright
docker-compose up status  # Full test suite

# Mobile tests
ISAPP=true npm run generate  # Verify build
npx cap sync                 # Verify native sync
```

### Verification Commands
```bash
# Check merged files
git diff HEAD~1 --name-only | grep -E "(android|ios|fastlane|circleci)"

# Verify ISAPP in code
grep -r "ISAPP" . --include="*.vue" --include="*.js" --include="*.ts"

# Check for divergence
git diff origin/master origin/app-ci-fd -- '*.vue' '*.js' '*.ts'
```

---

**Document Version**: 1.0
**Created**: 2025-11-12
**Last Updated**: 2025-11-12
**Status**: Ready for Review → Execute
