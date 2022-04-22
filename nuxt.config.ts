import { defineNuxtConfig } from 'nuxt'
import constants from './constants'

export default defineNuxtConfig({
  // We need static rendering for good SEO.  It means the users pay for the CPU not Freegle.  Cheapskates.
  target: 'static',

  // SSR true means that the pages will be rendered on generate.  SSR false means that the pages are generated but
  // only contain the scripts required to render on the client.
  ssr: true,

  build: {
    // Reduce size of CSS initial load.
    extractCSS: true,

    transpile: [/bootstrap-vue-3/],
  },

  buildModules: ['@pinia/nuxt'],

  // Environment variables the client needs.
  publicRuntimeConfig: {
    APIv1: constants.APIv1,
    APIv2: constants.APIv2,
    IZNIK_API_V1: constants.IZNIK_API_V1,
    IZNIK_API_V2: constants.IZNIK_API_V2,
    OSM_TILE: constants.OSM_TILE,
    GEOCODE: constants.GEOCODE,
    FACEBOOK_APPID: constants.FACEBOOK_APPID,
    YAHOO_CLIENTID: constants.YAHOO_CLIENTID,
    GOOGLE_MAPS_KEY: constants.GOOGLE_MAPS_KEY,
    GOOGLE_API_KEY: constants.GOOGLE_API_KEY,
    GOOGLE_CLIENT_ID: constants.GOOGLE_CLIENT_ID,
    USER_SITE: constants.USER_SITE,
    IMAGE_SITE: constants.IMAGE_SITE,
    SENTRY_DSN: constants.SENTRY_DSN,
    BUILD_DATE: new Date().toISOString(),
  },

  css: ['@/assets/css/global.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            // Include some CSS in all components.
            // TODO Tried to include these but broke the colours:
            // @import '~bootstrap/scss/functions';
            // @import '~bootstrap/scss/variables';
            // @import '~bootstrap/scss/mixins/_breakpoints';
            //
            '@import "@/assets/css/_color-vars.scss";',
        },
      },
    },
  },

  generate: {
    routes: ['/explore/21496'],
  },

  // TODO Sentry
})
