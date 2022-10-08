import config from './config'

export default defineNuxtConfig({
  // We need static rendering for good SEO.
  target: 'static',

  // SSR true means that the pages will be rendered on generate.  SSR false means that the pages are generated but
  // only contain the scripts required to render on the client.
  //
  // TODO SSR This is broken by pinia persist - see https://github.com/Seb-L/pinia-plugin-persist/issues/44
  ssr: false,

  nitro: { prerender: { routes: ['/404.html'] } },

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
  buildModules: [
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore'],
      },
    ],
    'floating-vue/nuxt',
  ],

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
            // TODO MINOR Tried to include these but broke the colours:
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

  app: {
    head: {
      title: "Freegle - Don't throw it away, give it away!",
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'author', name: 'author', content: 'Freegle' },
        { name: 'supported-color-schemes', content: 'light' },
        { name: 'color-scheme', content: 'light' },
        {
          name: 'facebook-domain-verification',
          content: 'zld0jt8mvf06rt1c3fnxvls3zntxj6',
        },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        {
          hid: 'description',
          name: 'description',
          content:
            "Give and get stuff for free in your local community.  Don't just recycle - reuse, freecycle and freegle!",
        },
        {
          hid: 'apple-mobile-web-app-title',
          name: 'apple-mobile-web-app-title',
          content:
            "Give and get stuff for free in your local community.  Don't just recycle - reuse, freecycle and freegle!",
        },

        {
          hid: 'og:image',
          property: 'og:image',
          content: config.USER_SITE + '/icon.png',
        },
        { hid: 'og:locale', property: 'og:locale', content: 'en_GB' },
        {
          hid: 'og:title',
          property: 'og:title',
          content: "Freegle - Don't throw it away, give it away!",
        },
        { hid: 'og:site_name', property: 'og:site_name', content: 'Freegle' },
        {
          hid: 'og:url',
          property: 'og:url',
          content: 'https://www.ilovefreegle.org',
        },
        {
          hid: 'fb:app_id',
          property: 'fb:app_id',
          content: config.FACEBOOK_APPID,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content:
            "Give and get stuff for free in your local community.  Don't just recycle - reuse, freecycle and freegle!",
        },
        {
          hid: 'fb:app_id',
          property: 'og:site_name',
          content: config.FACEBOOK_APPID,
        },

        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: "Freegle - Don't throw it away, give it away!",
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content:
            "Give and get stuff for free in your local community.  Don't just recycle - reuse, freecycle and freegle!",
        },
        {
          hid: 'twitter:image',
          name: 'twitter:image',
          content: config.USER_SITE + '/icon.png',
        },
        {
          hid: 'twitter:image:alt',
          name: 'twitter:image:alt',
          content: 'The Freegle logo',
        },
        {
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        { hid: 'twitter:site', name: 'twitter:site', content: 'thisisfreegle' },
      ],
    },
  },
})
