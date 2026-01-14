# ModTools Merge Deployment Plan

This plan covers the safe deployment of the merged modtools branch to production, with rollback procedures for both Freegle and ModTools sites.

## Pre-Deployment Checklist

- [ ] All commits reviewed and ready
- [ ] Local tests passing
- [ ] Netlify CLI logged in and working
- [ ] Access to HA proxy configuration (for emergency rollback)
- [ ] Rollback branch identified (current production commit)

## Current State

- **Freegle site**: Deploys from `production` branch on `golden-caramel-d2c3a7`
- **ModTools site**: Currently deploys as branch deploy from `modtools` branch
- **Goal**: Both sites deploy from `production` branch using separate Netlify sites

## Phase 1: Push to Master and Verify CircleCI

### Steps

1. **Record current production commit** (for rollback):
   ```bash
   git log origin/production --oneline -1
   # Save this commit hash: _______________
   ```

2. **Push master branch**:
   ```bash
   git push origin master
   ```

3. **Monitor CircleCI**:
   - Go to https://app.circleci.com/pipelines/github/Freegle/iznik-nuxt3
   - Wait for all tests to pass (Go API, PHPUnit, Playwright)
   - **DO NOT PROCEED** until all tests are green

4. **Verify auto-merge to production**:
   - After tests pass, CircleCI auto-merges master → production
   - Confirm the merge happened:
     ```bash
     git fetch origin
     git log origin/production --oneline -1
     ```

## Phase 2: Verify Freegle Site Deployment

### Steps

1. **Wait for Netlify deploy**:
   - Go to https://app.netlify.com/projects/golden-caramel-d2c3a7/deploys
   - Wait for production deploy to complete (green checkmark)

2. **Test Freegle site**:
   - Visit https://www.ilovefreegle.org/
   - Test key functionality:
     - [ ] Homepage loads
     - [ ] Can view messages/posts
     - [ ] Login works
     - [ ] Post creation works (test on dev if needed)

3. **Confirm success** before proceeding to Phase 3

### Emergency Rollback - Freegle Site

If Freegle site is broken:

```bash
# Option 1: Revert on production branch
git checkout production
git revert HEAD
git push origin production

# Option 2: Force push previous commit
git push origin <SAVED_COMMIT_HASH>:production --force
```

Then trigger a Netlify deploy:
- Go to https://app.netlify.com/projects/golden-caramel-d2c3a7/deploys
- Click "Trigger deploy" → "Deploy site"

## Phase 3: Create ModTools Netlify Site

### Steps

1. **Create new Netlify site**:
   ```bash
   netlify sites:create --name freegle-modtools --account-slug freegle
   ```

2. **Link to repository**:
   - Go to the new site in Netlify UI
   - Connect to GitHub repo: `Freegle/iznik-nuxt3`
   - Set branch to: `production`

3. **Configure build settings**:
   - Base directory: (leave empty)
   - Build command: `export NODE_OPTIONS=--max_old_space_size=6000 && npx nuxi prepare && cd modtools && npm i && npm run build`
   - Publish directory: `modtools/dist`
   - Or point to `modtools/netlify.toml` in the repository

4. **Configure environment**:
   - NODE_VERSION: 22
   - NPM_FLAGS: --legacy-peer-deps

5. **Trigger first build**:
   - Click "Trigger deploy" → "Deploy site"
   - Wait for build to complete

6. **Get the new site URL**:
   - Note the URL: `https://freegle-modtools.netlify.app` (or similar)

## Phase 4: Verify ModTools Site

### Steps

1. **Test the new ModTools site**:
   - Visit the new Netlify URL directly (not modtools.org yet)
   - Test key functionality:
     - [ ] Login works
     - [ ] Dashboard loads
     - [ ] Message moderation works
     - [ ] Member management works
     - [ ] Work counts display correctly

2. **If tests pass**, proceed to Phase 5

### Emergency Rollback - ModTools Site

If new ModTools site doesn't work:

1. **Keep old modtools branch deploy active** - don't update HA proxy yet
2. The old site at `modtools--golden-caramel-d2c3a7.netlify.app` still works
3. Debug and fix issues before retrying

## Phase 5: Update HA Proxy (modtools.org DNS)

### Steps

1. **Update HA proxy configuration**:
   - Change modtools.org backend from `modtools--golden-caramel-d2c3a7.netlify.app` to new site URL
   - This may involve updating:
     - HAProxy config
     - Or Netlify custom domain settings

2. **Test modtools.org**:
   - Visit https://modtools.org/
   - Verify it's serving the new site (check deploy ID or version)

3. **Configure custom domain on new site** (if not using HA proxy):
   - In Netlify UI: Domain management → Add custom domain → modtools.org
   - Update DNS if needed

### Emergency Rollback - modtools.org

If modtools.org is broken after HA proxy update:

1. **Revert HA proxy** to point back to `modtools--golden-caramel-d2c3a7.netlify.app`
2. The old modtools branch deploy should still be available

## Phase 6: Cleanup

After successful deployment and verification:

1. **Remove modtools from allowed_branches** on golden-caramel site:
   - This stops the old branch deploy from being updated
   - Keeps it available as emergency fallback

2. **Remove iznik-nuxt3-modtools submodule from FreegleDocker**:
   - Since both Freegle and ModTools now deploy from the same branch, the separate submodule is redundant
   - Steps:
     ```bash
     cd /home/edward/FreegleDockerWSL

     # Remove from .gitmodules
     git submodule deinit -f iznik-nuxt3-modtools

     # Remove from .git/modules
     rm -rf .git/modules/iznik-nuxt3-modtools

     # Remove the directory
     git rm -f iznik-nuxt3-modtools

     # Commit the change
     git commit -m "Remove iznik-nuxt3-modtools submodule - now using single iznik-nuxt3 for both sites"
     ```
   - Update any scripts that reference `iznik-nuxt3-modtools` to use `iznik-nuxt3` instead
   - Local ModTools development will use `iznik-nuxt3/modtools/` directory

3. **Update documentation**:
   - Confirm all MD files are updated
   - Update any deployment scripts
   - Update FreegleDocker CLAUDE.md to remove references to iznik-nuxt3-modtools

4. **Monitor for issues**:
   - Watch error logs/Sentry for 24 hours
   - Be ready to rollback if issues emerge

## SSL Certificate Notes

- Current setup: Wildcard cert for `*.modtools.org` on golden-caramel site
- New setup will need SSL configured on new ModTools site
- Options:
  1. Add modtools.org as custom domain on new site (Netlify auto-provisions SSL)
  2. Use existing HA proxy for SSL termination
  3. Transfer wildcard cert if needed

## Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| 1 | 30-45 min | Push, wait for CircleCI |
| 2 | 15 min | Verify Freegle site |
| 3 | 15 min | Create ModTools Netlify site |
| 4 | 15 min | Verify ModTools site |
| 5 | 15 min | Update HA proxy/DNS |
| 6 | 15 min | Cleanup |

**Total: ~2 hours** (plus buffer for issues)

## Contacts

- Netlify: Logged in as geeks@ilovefreegle.org
- HA Proxy: [Who manages this?]
- DNS (modtools.org): Managed via Google Cloud DNS

## Rollback Summary

| Issue | Action |
|-------|--------|
| Freegle site broken | Revert production branch, trigger Netlify deploy |
| ModTools new site broken | Don't update HA proxy, debug on new site |
| modtools.org broken | Revert HA proxy to old branch deploy URL |
