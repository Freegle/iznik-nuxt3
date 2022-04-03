import { defineNuxtConfig } from 'nuxt3'
import * as constants from './constants'

// Allow disabling of eslint autofix by setting "DISABLE_ESLINT_AUTOFIX=true" in env (e.g. .env file)
// defaults to enabling autofixing
const DISABLE_ESLINT_AUTOFIX =
  process.env.DISABLE_ESLINT_AUTOFIX &&
  process.env.DISABLE_ESLINT_AUTOFIX !== 'false'
const ESLINT_AUTOFIX = !DISABLE_ESLINT_AUTOFIX

export default defineNuxtConfig({
  // We use a static target with no SSR:
  // - We need static rendering for good SEO.
  // - It means the users pay for the CPU not Freegle.
  ssr: false,
  target: 'static',

  scripts: {
    build: "nuxi generate"
  },

  build: {
    // Reduce size of CSS initial load.
    extractCSS: true,

    extend(config, ctx) {
      if (process.env.NODE_ENV !== 'production') {
        config.devtool = ctx.isClient ? 'eval-source-map' : 'inline-source-map'
      } else {
        // If we put them as files then we don't increase the bundle size.
        config.devtool = 'source-map'
      }

      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
          options: {
            fix: ESLINT_AUTOFIX
          }
        })
      }

      config.resolve.alias['color-vars'] = 'assets/css/_color-vars.scss'

      // Pretend we have fs - needed for OpenCV.
      config.node = {
        fs: 'empty'
      }
    },
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
