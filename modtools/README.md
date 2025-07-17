# iznik-nuxt3 modtools

This `modtools` branch provides an interface for Freegle local and national volunteers to moderate their community and operate Freegle nationally, 
running on separate website https://modtools.org/

ModTools exists as a branch of the main/base `master` iznik-nuxt3 repository, with some modifications of the base code, with additions in a /modtools directory.

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

TO DO: Multiple modifications to the base code have been done in the modtools branch. 
Most - but not all - of these can be incorporated into master.

The base code usually uses `miscStore.modtools` to do any MT-specific actions.
However `process.env.MT` and `config.IS_MT` are also available if need be.

### ModTools crucial base alterations

These alterations to the base code should NOT be incorporated into the base code:

* netlify.toml
* nuxt.config.ts
* components/ChatMessageInterested.vue
* components/ChatMessageText.vue

???
* `stores/group.js`
* `stores/auth.js`

## Usage:

Best have in a separate directory to the main nuxt3 code so node_modules directories are not confused.

Starting from root
```
npm i
cd modtools
npm i
npm run dev
```

You can then debug on http://127.0.0.1:3000/

To debug it often helps to comment out the main content of `/plugins/something-went-wrong.client.js`

## Merging

To catch up with master:
```
git checkout master
git pull
git checkout modtools
git merge master
```

Any changes to `assets/css` must be copied through to `modtools/assets/css`.

## Release:

When this branch is pushed to GitHub it is automatically built at netlify.
If it succeeds it is available at https://modtools--golden-caramel-d2c3a7.netlify.app/

The Freegle ha proxy hides this URL so you can use it at https://modtools.org/

The netlify instructions are in the modtools-branch-specific `netlify.toml`:

```
[build]
command = "export NODE_OPTIONS=--max_old_space_size=6000 && cd modtools && npm i && nuxt build"
publish = "modtools/dist"
```
