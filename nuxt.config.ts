// DO NOT COPY INTO MASTER
// import eslintPlugin from 'vite-plugin-eslint'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { splitVendorChunkPlugin } from 'vite'
import config from './config'

let isTest = process.env.NODE_ENV === 'test' || process.env.CI
if (config.IS_MT) isTest = false

// @ts-ignore
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Rendering modes are confusing.
  //
  // - target can be:
  //   - static: can host on static hosting such as Azure Static Web Apps
  //   - server: requires a node server.
  // - ssr can be:
  //   - true: renders at
  //     - generate time for https://github.com/nuxt/framework/discussions/4523: static, or
  //     - in node server for target: server)
  //   - false: renders on client.
  //
  // Ideally we'd use SSR so that we could render pages on the server or client depending on our hosting choice.
  // - But not all dependencies we use support SSR.
  // - Crucially, we use Bootstrap and bootstrap-vue-next.
  // - These do not yet support SSR.
  //
  // So we can't render full pages on the server any time soon. Can we just render purely on the client?
  //
  // Crawlers nowadays are smart enough to render pages on the client.  So that would be fine.
  // But Facebook link preview isn't, and we want that to work.
  //
  // However to get that preview working:
  // - We only really need the meta tags which are added in the setup() calls of
  //   individual pages.
  // - We don't need the full DOM rendered.
  // - So we can mask out bootstrap-containing elements using <client-only>, and use async component
  //   loading to avoid pulling in code if need be.
  //
  // We handle most of this in the pages, rather than in the components - pages are where we set the meta tags for
  // preview.
  //
  // Unfortunately:
  // - Nuxt/Vue has issues setting meta tags via useHead() when using the options API, where you can get
  //   an error saying the nuxt instance is not available if you've done an await first.
  // - Sometimes we do want to do that, e.g. to get a group so that we can use the info in the meta tags.
  // - In that case we've reworked the pages to use <script setup>.
  // - For historical reasons and preference we use the options API everywhere else.
  //
  // Sometimes when debugging it's useful to set ssr: false, because the errors are clearer when generated on the client.
  // @ts-ignore
  target: 'server',
  ssr: !isTest,
  spaLoadingTemplate: false,

  // This makes Netlify serve assets from the perm link for the build, which avoids missing chunk problems when
  // a new deploy happens.  See https://github.com/nuxt/nuxt/issues/20950.
  //
  // We still want to serve them below our domain, though, otherwise some security software gets tetchy.  So we
  // do that and then the _redirects file will proxy it to the correct location.
  $production: {
    app: {
      cdnURL: process.env.DEPLOY_URL
        ? '/netlify/' + process.env.DEPLOY_URL.replace('https://', '')
        : '',
    },
  },

  routeRules: {
    // Nuxt3 has some lovely features to do with how routes are generated/cached.  We use:
    //
    // prerender: true - this will be generated at build time.
    // static: true - this is generated on demand, and then cached until the next build
    // isr: 'time' - this is generated on demand each 'time' period.
    // ssr: false - this is client-side rendered.
    //
    // There are potential issues where a deployment happens while a page is partway through loading assets, or
    // later loads assets which are no longer present.  Nuxt3 now has a fallback of reloading the page when
    // it detects a failed chunk load.
    '/': { prerender: true },
    '/explore': { prerender: true },
    '/unsubscribe**': { prerender: true },
    '/about': { prerender: true },
    '/disclaimer': { prerender: true },
    '/donate': { prerender: true },
    '/find': { prerender: true },
    '/forgot': { prerender: true },
    '/give': { prerender: true },
    '/help': { prerender: true },
    '/maintenance': { prerender: true },
    '/mobile': { prerender: true },
    '/privacy': { prerender: true },
    '/unsubscribe': { prerender: true },
    '/yahoologin': { prerender: true },

    // These pages are for logged-in users, or aren't performance-critical enough to render on the server.
    '/birthday/**': { ssr: false },
    '/browse/**': { ssr: false },
    '/chats/**': { ssr: false },
    '/chitchat/**': { ssr: false },
    '/donated': { ssr: false },
    '/giftaid': { ssr: false },
    '/job/**': { ssr: false },
    '/jobs': { ssr: false },
    '/merge/**': { ssr: false },
    '/myposts': { ssr: false },
    '/mypost/**': { ssr: false },
    '/noticeboards/**': { ssr: false },
    '/post': { ssr: false },
    '/profile/**': { ssr: false },
    '/promote': { ssr: false },
    '/settings/**': { ssr: false },
    '/stats/**': { ssr: false },
    '/stories/**': { ssr: false },
    '/teams': { ssr: false },
    '/adtest': { ssr: false },
    '/googlepay': { ssr: false },
    '/stripedonate': { ssr: false },
    '/microvolunteering': { ssr: false },
    '/paypalcompetition': { ssr: false },

    // Render on demand - may never be shown in a given build - then cache for a while.
    '/explore/region/**': { isr: 3600 },
    '/communityevent/**': { isr: 3600 },
    '/communityevents/**': { isr: 3600 },
    '/explore/**': { isr: 3600 },
    '/message/**': { isr: 600 },
    '/story/**': { isr: 3600 },
    '/shortlink/**': { isr: 600 },
    '/volunteering/**': { isr: 3600 },
    '/volunteerings/**': { isr: 3600 },

    // Allow CORS for chunk fetches - required for Netlify hosting.
    '/_nuxt/**': {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      },
    },
  },

  nitro: {
    prerender: {
      routes: ['/404.html', '/sitemap.xml'],

      // Don't prerender the messages - too many.
      ignore: ['/message/'],
      crawlLinks: true,
    },
  },

  render: {
    bundleRenderer: {
      shouldPrefetch: () => false,
      shouldPreload: () => false,
    },
  },

  experimental: {
    emitRouteChunkError: 'reload',
    asyncContext: true,

    // Payload extraction breaks SSR with routeRules - see https://github.com/nuxt/nuxt/issues/22068
    renderJsonPayloads: false,
    payloadExtraction: false,
  },

  webpack: {
    // Reduce size of CSS initial load.
    extractCSS: true,
  },

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
    'nuxt-vite-legacy',
    '@bootstrap-vue-next/nuxt',
    process.env.GTM_ID ? '@zadigetvoltaire/nuxt-gtm' : null,
    // We are using Playwire so we don't load AdSense ourselves.
    // [
    //   '@nuxtjs/google-adsense',
    //   {
    //     id: process.env.GOOGLE_ADSENSE_ID,
    //     test: process.env.GOOGLE_ADSENSE_TEST_MODE === 'true',
    //     hideUnfilled: false,
    //     pauseOnLoad: true,
    //   },
    // ],
  ],

  hooks: {
    'build:manifest': (manifest) => {
      for (const item of Object.values(manifest)) {
        item.dynamicImports = []
        item.prefetch = false
        // Removing preload links is the magic that drops the FCP on mobile
        item.preload = false
      }
    },
    close: (nuxt) => {
      // Required to stop build hanging - see https://github.com/nuxt/cli/issues/193
      if (!nuxt.options._prepare) {
        process.exit()
      }
    },
  },

  // Environment variables the client needs.
  runtimeConfig: {
    public: {
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
      USER_DOMAIN: config.USER_DOMAIN,
      MODTOOLS_SITE: config.MODTOOLS_SITE,
      IMAGE_SITE: config.IMAGE_SITE,
      SENTRY_DSN: config.IS_MT ? config.SENTRY_DSN_MT : config.SENTRY_DSN,
      BUILD_DATE: new Date().toISOString(),
      NETLIFY_DEPLOY_ID: process.env.DEPLOY_ID,
      NETLIFY_SITE_NAME: process.env.SITE_NAME,
      NETLIFY_BRANCH: process.env.BRANCH,
      MATOMO_HOST: process.env.MATOMO_HOST,
      COOKIEYES: config.COOKIEYES,
      TRUSTPILOT_LINK: config.TRUSTPILOT_LINK,
      TUS_UPLOADER: config.TUS_UPLOADER,
      IMAGE_DELIVERY: config.IMAGE_DELIVERY,
      STRIPE_PUBLISHABLE_KEY: config.STRIPE_PUBLISHABLE_KEY,

      CIRCLECI: process.env.CIRCLECI,
      GOOGLE_ADSENSE_ID: config.GOOGLE_ADSENSE_ID,
      GOOGLE_ADSENSE_TEST_MODE: config.GOOGLE_ADSENSE_TEST_MODE,
      PLAYWIRE_PUB_ID: config.PLAYWIRE_PUB_ID,
      PLAYWIRE_WEBSITE_ID: config.PLAYWIRE_WEBSITE_ID,

      ...(process.env.GTM_ID
        ? {
            gtm: {
              id: process.env.GTM_ID,
              defer: true,
              compatibility: true,
              debug: true,
              enabled: !!process.env.GTM_ID,
              enableRouterSync: false,
              devtools: true,
            },
          }
        : {}),
    },
  },

  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '/assets/css/global.scss',
    'leaflet/dist/leaflet.css',
  ],

  vite: {
    build: {
      minify: false,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            // Include some CSS in all components.
            // There are some other Bootstrap files we'd like to include, but doing this breaks the colours in a way
            // I don't understand and can't fix.
            '@import "@/assets/css/_color-vars.scss";',
        },
      },
    },
    plugins: [
      splitVendorChunkPlugin(),
      VitePWA({ registerType: 'autoUpdate' }),
      // Make Lint errors cause build failures.
      // eslintPlugin(),
      sentryVitePlugin({
        org: 'freegle',
        project: config.IS_MT ? 'modtools' : 'nuxt3',
      }),
    ],
  },

  // Note that this is not the standard @vitejs/plugin-legacy, but https://www.npmjs.com/package/nuxt-vite-legacy
  /* legacy: {
    targets: ['chrome 49', 'since 2015', 'ios>=12', 'safari>=12'],
    modernPolyfills: [
      'es.global-this',
      'es.object.from-entries',
      'es.array.flat-map',
      'es.array.flat',
      'es.string.replace-all',
    ],
  }, */

  // Sentry needs sourcemaps.
  sourcemap: {
    client: true,
    server: true,
  },

  // Sometimes we need to change the host when doing local testing with browser stack.
  devServer: {
    host: '127.0.0.1',
    port: 3000,
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      title: "Freegle - Don't throw it away, give it away!",
      script: [
        {
          // This is a polyfill for Safari12.  Can't get it to work using modernPolyfills - needs to happen very
          // early.  Safari12 doesn't work well, but this makes it functional.
          type: 'text/javascript',
          innerHTML: `try { if (!window.globalThis) { window.globalThis = window; } } catch (e) { console.log('Polyfill error', e.message); }`,
        },
      ],
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
        {
          hid: 'OMG-Verify-V1',
          name: 'OMG-Verify-V1',
          content: '954a2917-d603-4df4-8802-f6a78846a9c0',
        },
        {
          hid: 'Awin',
          name: 'Awin',
          content: 'Awin',
        },
      ],
    },
  },
  image: {
    uploadcare: {
      provider: 'uploadcare',
      cdnURL: config.UPLOADCARE_CDN,
    },

    weserv: {
      provider: 'weserv',
      baseURL: config.TUS_UPLOADER,
      weservURL: config.IMAGE_DELIVERY,
    },

    // We want sharp images on fancy screens.
    densities: [1, 2],

    // Uploadcare only supports images upto 3000, and the screen sizes are doubled when requesting because of densities.
    // So we already need to drop the top-level screen sizes, and we also don't want to request images which are too
    // large because this affects our charged bandwidth.  So we only go up to 768.
    screens: {
      xs: 320,
      sm: 576,
      md: 768,
      lg: 768,
      xl: 768,
      xxl: 768,
      '2xl': 768,
    },
  },

  compatibilityDate: '2024-11-29',
})
