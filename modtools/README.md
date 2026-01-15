# iznik-nuxt3 modtools

ModTools provides the user interface for Freegle local and national volunteers to moderate their community and operate Freegle nationally,
running on separate website https://modtools.org/

ModTools code lives in the `/modtools` directory of the main iznik-nuxt3 repository. Both Freegle and ModTools deploy from the `production` branch, with separate Netlify sites using different build commands.

The ModTools code in /modtools uses the parent directory as a Nuxt3 layer, ie modtools extends or inherits from `..` ie the base nuxt3 code. 
These files/directories are present in /modtools:

* `app.vue`
* `nuxt.config.ts`- Extend the base nuxt config `['../']`
* `package.json` - only extra packages needed for ModTools
* `package-lock.json`
* assets/* - does NOT extend the base assets
* components/* - Extend and add to the base components
* composables/* - Extend and add to the base composables
* layouts/* - ModTools layouts
* middleware/* - `authuser.global.ts` provides user authentication for most routes
* pages/* - Generally replaces the base pages
* public/* - ModTools-specific icons and eg `alert.wav`
* stores/* - Extend and add to the base stores

## Versioning:

`/modtools/package.json` contains `version` which is shown to the volunteer. Bump this for each release.

## Base alterations:

The base code uses `miscStore.modtools` to determine any MT-specific actions, often made available as ref `isMT`.
However `process.env.MT` and `config.IS_MT` are also available if need be.

### ModTools-specific configuration

These files have ModTools-specific configuration that differs from the Freegle build:

* `modtools/nuxt.config.ts` - ModTools Nuxt configuration (extends base)
* `modtools/netlify.toml` - ModTools-specific Netlify build settings (used by ModTools Netlify site)

## Usage:

Best have in a separate directory to the main nuxt3 code so the node_modules directories are not confused.

Starting from root
```
npm i
cd modtools
npm i
npm run dev
```

You can then debug on http://127.0.0.1:3000/

To debug it often helps to comment out the main content of `/plugins/something-went-wrong.client.js`

## Development Workflow

All development happens on `master` branch. Changes are tested via CircleCI and then merged to `production` for deployment.

Any changes to `assets/css` must be copied through to `modtools/assets/css`.

## Release:

Both Freegle and ModTools deploy from the `production` branch:

1. Changes are pushed to `master`
2. CircleCI runs tests (Go API, PHPUnit, Playwright)
3. If tests pass, `master` is auto-merged to `production`
4. Netlify detects the push and builds both sites:
   - **Freegle site** (`golden-caramel-d2c3a7`): builds from root with `npm run build`
   - **ModTools site**: builds from `/modtools` with `cd modtools && npm run build`

The Freegle HA proxy routes `modtools.org` to the ModTools Netlify site.
There is no automatic mechanism to detect changes and reload automatically, so volunteers must reload as required to pick up a new release.

The ModTools netlify build settings use:

```
[build]
command = "export NODE_OPTIONS=--max_old_space_size=6000 && npx nuxi prepare && cd modtools && npm i && npm run build"
publish = "modtools/dist"
```
