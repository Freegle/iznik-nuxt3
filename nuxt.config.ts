import { defineNuxtConfig } from 'nuxt3'
import * as constants from './constants'

export default defineNuxtConfig({
  // We use a static target with no SSR:
  // - We need static rendering for good SEO.
  // - It means the users pay for the CPU not Freegle.
  ssr: false,
  target: 'static',

  build: {
    // Reduce size of CSS initial load.
    extractCSS: true,
  },

  // Environment variables the client needs.
  publicRuntimeConfig: {
    API: constants.API,
    IZNIK_API: constants.IZNIK_API,
    OSM_TILE: constants.OSM_TILE,
    GEOCODE: constants.GEOCODE,
    FACEBOOK_APPID: constants.FACEBOOK_APPID,
    YAHOO_CLIENTID: constants.YAHOO_CLIENTID,
    GOOGLE_MAPS_KEY: constants.GOOGLE_MAPS_KEY,
    GOOGLE_API_KEY: constants.GOOGLE_API_KEY,
    GOOGLE_CLIENT_ID: constants.GOOGLE_CLIENT_ID
      ,
    USER_SITE: constants.USER_SITE,
    IMAGE_SITE: constants.IMAGE_SITE,
    SENTRY_DSN: constants.SENTRY_DSN,
    BUILD_DATE: new Date().toISOString()

  },
  css: [
    '@/assets/css/global.scss',
  ],
})
