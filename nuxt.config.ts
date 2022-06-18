import { defineNuxtConfig } from 'nuxt'
import config from './config'

export default defineNuxtConfig({
  // We need static rendering for good SEO.
  target: 'static',

  // SSR true means that the pages will be rendered on generate.  SSR false means that the pages are generated but
  // only contain the scripts required to render on the client.
  //
  // TODO SSR This is broken by pinia persist - see https://github.com/Seb-L/pinia-plugin-persist/issues/44
  ssr: false,

  build: {
    // Reduce size of CSS initial load.
    extractCSS: true,

    // Need to transpile otherwise SSR fails - see https://github.com/nuxt/framework/discussions/4523.
    transpile: [
      /bootstrap-vue-3/,
      /vue3-lazyload/,
      /vue-image-zoomer/,
      /vue3-draggable-resizable/,
      /pinia-plugin-persist/,
    ],
  },

  // TODO Search for .sync modifier, which is replaced by v-model:.
  buildModules: ['@pinia/nuxt', 'floating-vue/nuxt'],

  // Environment variables the client needs.
  publicRuntimeConfig: {
    APIv1: config.APIv1,
    APIv2: config.APIv2,
    OSM_TILE: config.OSM_TILE,
    GEOCODE: config.GEOCODE,
    FACEBOOK_APPID: config.FACEBOOK_APPID,
    YAHOO_CLIENTID: config.YAHOO_CLIENTID,
    GOOGLE_MAPS_KEY: config.GOOGLE_MAPS_KEY,
    GOOGLE_API_KEY: config.GOOGLE_API_KEY,
    GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
    USER_SITE: config.USER_SITE,
    IMAGE_SITE: config.IMAGE_SITE,
    SENTRY_DSN: config.SENTRY_DSN,
    BUILD_DATE: new Date().toISOString(),
  },

  css: [
    '@/node_modules/@fortawesome/fontawesome-svg-core/styles.css',
    '@/assets/css/global.scss',
    'leaflet/dist/leaflet.css',
  ],

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
    // Don't crawl - we end up with all the messages, which takes too long.
    crawler: false,

    // TODO Do something here.  Hybrid?
  },

  // TODO Sentry
})
