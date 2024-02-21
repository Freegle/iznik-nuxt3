# iznik-nuxt3 modtools

This branch provides an interface for Freegle volunteers to moderate their group, running on separate website https://modtools.org/

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
* assets/* - ADDED and amended `assets/css/_color-vars.scss`

## Changes

* `app.vue` is a simplified copy of the root version
* `modtools/layouts/default.vue` supersedes `./layouts/default.vue`

## Amended:

* `modtools\assets\css\bootstrap-custom.scss` now has `~/../` at start twice
* base auth.js calls this.$api.session.fetch not this.$api.session.fetchv2

## TODO

* Loads of TODOs to check inc some in base code
* Cope on mobile ie left menu

## Upgrade notes

* b-modal <template #default> <template #footer> useModal, etc. Do not use v-if on b-modal
* Use icon in <v-icon :icon="['fab', 'discourse']" scale="2" />
* Add extra icons to root plugins/vue-awesome.js
* Change `this.$store.getters['misc/time']` into `this.miscStore.time`