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

* Various TODOs to check inc some in base code

* components/ProxyImage.vue Fix up so that NuxtPicture works. Seems to go wrong in MT chats list -->
  <!-- fullSrc comes from src and chat.icon which seems to be different from FD - but raw src seems OK -->

## Upgrade notes

* b-btn to b-button, b-select to b-form-select, date-picker to OurDatePicker, b-input to b-form-input, b-textarea to b-form-textarea
  b-input-group-append -> <slot name="append">
* b-modal <template #default> <template #footer> useOurModal, etc. Do not use v-if on b-modal
  add @hidden="onHide" emits: ['hidden'] onHide() { this.$emit('hidden') }
  add v-if and @hidden <ModLogsModal v-if="showLogsModal" @hidden="showLogsModal = false" />
  and if needed, in modal add show() { this.modal.show() }
* Use icon in <v-icon :icon="['fab', 'discourse']" scale="2" />
* Add extra icons to root plugins/vue-awesome.js
* Change `this.$store.getters['misc/time']` into `this.miscStore.time`
* And... miscStore.get('dashboardShowInfo') and miscStore.set({ key: 'dashboardShowInfo', value: newValue })
* SpinButton has changed params inc icon-name and :handler to @handle which has param callback that must be called when complete
  To have inline use :flex="false"
* const path = computed(() => { return 0 } and access as path.value
* Change pluralize to added pluralise with number and includeNumber as extra params
  import { pluralise } from '../composables/usePluralise'
* For waitForRef refs use this.$refs.modal?.show() etc. Within modal component:
    const { modal, show, hide } = useOurModal()
    defineExpose({ show })

* b-img-lazy to b-img lazy
* float-right to float-end

* npm i leaflet-draw-toolbar --force

    delay(n) {
      return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
      })
    },

      await this.delay(5)

CHECK ALL this.member.userid

REMOVED to get it to build:
    "@vitejs/plugin-legacy": "^5.2.0",
    "nuxt-vite-legacy": "^1.2.0",

this.checkWork(true)
this.deferCheckWork()
this.checkWorkDeferGetMessages()
// SEE WORK EXPLANATION IN useModMessages.js

<b-form-select v-model="whatever" @change="change"> needs v-model and newval is invalid but this.whatever has been updated

npx eslint api/*.js --fix

git reset --hard origin/production

<!-- eslint-disable-next-line -->
// eslint-disable-next-line no-unused-vars