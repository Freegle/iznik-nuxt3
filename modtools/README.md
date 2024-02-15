# iznik-nuxt3 modtools

The app exists as a branch of the main nuxt3 app, with minimal modifications of the main codebase, with additions in a `modtools` directory.

The modtools app in `modtools` has the parent directory as a layer, ie modtools extends or inherits from `..` ie the base nuxt3 app. 
These files/directories are extended:

* components/* - Extend the default components
* composables/* - Extend the default composables
* layouts/* - Extend the default layouts
* pages/* - Extend the default pages
* plugins/* - Extend the default plugins
* server/* - Extend the default server endpoints & middleware
* utils/* - Extend the default utils
* nuxt.config.ts- Extend the default nuxt config
* app.config.ts - Extend the default app config

A fairly minimal `package.json` is needed as `nuxt.config.ts` extends `../` and so brings in the required packages.

## Not extended:

* api/*
* assets/* - ADDED

## Changes

* modtools/layouts/default.vue overrides ./layouts/default.vue
* modtools/components/NoticeMessage.vue overrides ./components/NoticeMessage.vue

## Amended:

* `modtools\assets\css\bootstrap-custom.scss` now has `~/../` at start twice

