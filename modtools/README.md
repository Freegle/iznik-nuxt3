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

* `modtools/assets/css/bootstrap-custom.scss` now has `~/../` at start twice
* `api/BaseAPI.js` add config.params.modtools
* `stores/group.js` has confirmAffiliation() added
* `stores/auth.js` has work&discourse added; session.fetchv2
* `stores/misc.js` add modtools
* `config.js` has modtools SENTRY_DSN

## TODO

* Loads of TODOs to check inc some in base code
* Cope on mobile ie left menu

## Upgrade notes

* b-btn to b-button, b-select to b-form-select, date-picker to OurDatePicker, b-input to b-form-input, b-textarea to b-form-textarea
* b-modal <template #default> <template #footer> useModal, etc. Do not use v-if on b-modal
  add v-if and @hidden <ModLogsModal v-if="showLogsModal" @hidden="showLogsModal = false" />
  and if needed, in modal add show() { this.modal.show() }
* Use icon in <v-icon :icon="['fab', 'discourse']" scale="2" />
* Add extra icons to root plugins/vue-awesome.js
* Change `this.$store.getters['misc/time']` into `this.miscStore.time`
* And... miscStore.get('dashboardShowInfo') and miscStore.set({ key: 'dashboardShowInfo', value: newValue })
* SpinButton has changed params inc icon-name and :handler to @handle which has param callback that must be called when complete
* const path = computed(() => { return 0 } and access as path.value
* Change pluralize to added withplural with number and includeNumber as extra params
* For refs use this.$refs.modal?.show() etc
* b-img-lazy to b-img lazy
* float-right to float-end