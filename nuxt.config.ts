import eslintPlugin from 'vite-plugin-eslint2'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { splitVendorChunkPlugin } from 'vite'
import config from './config'

// Mobile version change:
// - config.js: MOBILE_VERSION eg 3.1.9
// - android\app\build.gradle
//    - versionCode eg 1202
//    - versionName eg "3.2.0"
// - ios\App\App.xcodeproj\project.pbxproj
//    - CURRENT_PROJECT_VERSION eg 1200 TWICE
//    - MARKETING_VERSION eg 3.1.9 TWICE
//
// If npm reinstall, comment out line 40 of node_modules\@capacitor\cli\dist\android\run.js //await common_1.runTask
// Ensure in here android\app\src\main\AndroidManifest.xml
//  <uses-permission android:name="android.permission.CAMERA" />
//
// node_modules/tus-js-client/lib.esm/upload.js
//         console.log('tus: failed to upload chunk at offset',_this8._offset, err)

// console.log("CHECK PREBID SCRIPT CHANGES")
// const prebidCurrent = fs.readFileSync('public/js/prebid.js')
// const prebidBase = fs.readFileSync('public/js/prebid-base.js')
// if (prebidCurrent.compare(prebidBase) !== 0) {
//  console.error('public/js/prebid.js NOT THE SAME AS public/js/prebid-base.js', prebidCurrent.length, prebidBase.length)
//  process.exit(1)
// }
console.log('config.STRIPE_PUBLISHABLE_KEY', config.STRIPE_PUBLISHABLE_KEY)
console.log('config.NODE_ENV', config.NODE_ENV)
console.log('config.APP_ENV', config.APP_ENV)
console.log('config.USE_COOKIES', config.USE_COOKIES)
const production = config.APP_ENV ? config.APP_ENV === 'production' : true

// Detect if we're on Netlify (need legacy builds for old browser support)
// vs CI/Docker (skip legacy for faster builds - users have modern browsers)
const isNetlify = !!process.env.NETLIFY || !!process.env.DEPLOY_URL
console.log('isNetlify:', isNetlify)

// Detect if prerendering should be disabled (for CI/Docker builds)
// This is set in docker-compose.yml to avoid prerender failures during container builds
const prerenderRoutes = process.env.NUXT_NITRO_PRERENDER_ROUTES !== 'false'
console.log('prerenderRoutes:', prerenderRoutes)


/* if (config.COOKIEYES) { // cookieyesapp.js NO LONGER NEEDED AS HOSTNAME IS https://ilovefreegle.org
  console.log('CHECK COOKIEYES SCRIPT CHANGES')
  const cookieyesBase = fs.readFileSync('public/js/cookieyes-base.js').toString()

  https.get(config.COOKIEYES, (res) => {
    let cookieyesCurrent = '';
    res.on('data', (chunk) => { cookieyesCurrent += chunk; });
    res.on('end', () => {
      try {
        if (cookieyesCurrent !== cookieyesBase) {
          console.error('config.COOKIEYES NOT THE SAME AS public/js/cookieyes-base.js', config.COOKIEYES)
          process.exit(1)
        }
      } catch (error) { console.error(error.message) }
    })

  }).on("error", (error) => { console.error(error.message) })
} else { console.error('config.COOKIEYES not set') }
 */

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
  target: config.ISAPP ? 'static' : 'server',

  ssr: !config.ISAPP,
  spaLoadingTemplate: false,

  // This makes Netlify serve assets from the perm link for the build, which avoids missing chunk problems when
  // a new deploy happens. See https://github.com/nuxt/nuxt/issues/20950.
  //
  // We still want to serve them below our domain, though, otherwise some security software gets tetchy. So we
  // do that and then the _redirects file will proxy it to the correct location.
  //
  // Note: This works now that we've disabled experimental.appManifest (see below), which was causing
  // 404 errors during prerendering when the crawler tried to access build metadata from the CDN.
  $production: {
    app: {
      cdnURL: process.env.DEPLOY_URL,
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
    //
    // In CI/Docker, prerenderRoutes is set to false via NUXT_NITRO_PRERENDER_ROUTES=false to avoid
    // prerender failures during container builds (API may not be accessible).
    ...(prerenderRoutes
      ? {
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
        }
      : {}),

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
    prerender: prerenderRoutes
      ? {
          routes: ['/404.html', '/sitemap.xml'],

          // Don't prerender the messages - too many.
          // Also ignore asset paths and CDN URLs - these are built separately and don't need prerendering
          ignore: [
            '/message/',
            '/_nuxt/**', // Nuxt assets (JS, CSS, etc)
            '/netlify/**', // CDN URLs for Netlify permanent links
          ],
          crawlLinks: true,
        }
      : {
          // In CI/Docker, disable all prerendering to avoid failures when API is not accessible
          routes: [],
          crawlLinks: false,
        },

    // Disable HTTPS enforcement for development
    httpsRedirect: false,
    security: {
      httpsRedirect: false,
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

    // Disable app manifest to prevent 404 errors during prerendering
    // The app manifest feature (introduced in Nuxt 3.8) creates /_nuxt/builds/meta/<buildId>.json files
    // During prerendering with cdnURL configured, the crawler tries to access these from the CDN
    // path before they exist, causing 404 errors. See: https://github.com/nuxt/nuxt/discussions/27624
    appManifest: false,
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
    // @nuxt/test-utils/module is added automatically by vitest config
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
      // Skip in test mode to avoid killing vitest
      if (!nuxt.options._prepare && config.NODE_ENV !== 'test') {
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
      FACEBOOK_CLIENTID: config.FACEBOOK_CLIENTID,
      YAHOO_CLIENTID: config.YAHOO_CLIENTID,
      GOOGLE_MAPS_KEY: config.GOOGLE_MAPS_KEY,
      GOOGLE_API_KEY: config.GOOGLE_API_KEY,
      GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
      GOOGLE_IOS_CLIENT_ID: config.GOOGLE_IOS_CLIENT_ID,
      USER_SITE: config.USER_SITE,
      USER_DOMAIN: config.USER_DOMAIN,
      MODTOOLS_SITE: config.MODTOOLS_SITE,
      IMAGE_SITE: config.IMAGE_SITE,
      SENTRY_DSN: config.IS_MT ? config.SENTRY_DSN_MT : config.SENTRY_DSN,
      BUILD_DATE: new Date().toISOString(),
      ISAPP: config.ISAPP,
      MOBILE_VERSION: config.MOBILE_VERSION,
      NETLIFY_DEPLOY_ID: process.env.DEPLOY_ID,
      NETLIFY_SITE_NAME: process.env.SITE_NAME,
      NETLIFY_BRANCH: process.env.BRANCH,
      MATOMO_HOST: process.env.MATOMO_HOST,
      COOKIEYES: config.COOKIEYES,
      USE_COOKIES: config.USE_COOKIES,
      TRUSTPILOT_LINK: config.TRUSTPILOT_LINK,
      TUS_UPLOADER: config.TUS_UPLOADER,
      IMAGE_DELIVERY: config.IMAGE_DELIVERY,
      STRIPE_PUBLISHABLE_KEY: config.STRIPE_PUBLISHABLE_KEY,

      CIRCLECI: process.env.CIRCLECI,
      SITE: 'FD', // Freegle site identifier for logging context. ModTools overrides to 'MT'.
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
  ],

  build: {
    transpile: [
      '@fortawesome/vue-fontawesome',
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-brands-svg-icons',
    ],
  },

  vite: {
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('add-'),
        },
      },
    },
    optimizeDeps: {
      include: [
        'add-to-calendar-button',
        'resize-observer-polyfill',
        'jwt-decode',
        'leaflet',
        'leaflet/dist/leaflet-src.esm',
        'leaflet-gesture-handling',
        'wicket/wicket-leaflet',
        '@vue-leaflet/vue-leaflet',
        'leaflet-control-geocoder/src/control',
        'leaflet-control-geocoder/src/geocoders/photon',
        'supercluster/dist/supercluster',
        'dayjs/plugin/utc',
        'dayjs/plugin/timezone',
        '@vueuse/core',
        'zoompinch',
        'bootstrap-vue-next/components/BAlert',
        'bootstrap-vue-next/components/BBadge',
        'bootstrap-vue-next/components/BButton',
        'bootstrap-vue-next/components/BCard',
        'bootstrap-vue-next/components/BCarousel',
        'bootstrap-vue-next/components/BCollapse',
        'bootstrap-vue-next/components/BContainer',
        'bootstrap-vue-next/components/BForm',
        'bootstrap-vue-next/components/BFormCheckbox',
        'bootstrap-vue-next/components/BFormGroup',
        'bootstrap-vue-next/components/BFormInput',
        'bootstrap-vue-next/components/BFormSelect',
        'bootstrap-vue-next/components/BFormTextarea',
        'bootstrap-vue-next/components/BImg',
        'bootstrap-vue-next/components/BInputGroup',
        'bootstrap-vue-next/components/BModal',
        'bootstrap-vue-next/components/BNav',
        'bootstrap-vue-next/components/BNavbar',
        'bootstrap-vue-next/components/BPopover',
        'bootstrap-vue-next/components/BProgress',
        'bootstrap-vue-next/components/BTable',
        'bootstrap-vue-next/components/BTabs',
        'vee-validate',
        '@vee-validate/rules',
        'vue-plugin-load-script',
        '@stripe/stripe-js',
        'turf-distance',
        'turf-point',
        'turf-buffer',
        '@vueform/toggle',
        'save-file',
        '@formatjs/intl-locale/should-polyfill',
        '@formatjs/intl-pluralrules/should-polyfill',
        '@uppy/core',
        '@uppy/vue',
        '@uppy/tus',
        '@uppy/compressor',
        'object.hasown',
        '@formatjs/intl-locale/polyfill',
        '@formatjs/intl-pluralrules/polyfill-force',
        '@formatjs/intl-pluralrules/locale-data/en',
        'vuedraggable',
        'vue-highlight-words',
        '@chenfengyuan/vue-number-input',
        'twemoji',
        '@vue-leaflet/vue-leaflet',
        'leaflet/dist/leaflet-src.esm',
        'leaflet-gesture-handling',
        'wicket/wicket-leaflet',
        '@vueup/vue-quill',
        'quill-html-edit-button',
        'vue-datepicker-next',
        'vue-google-charts',
        'vue-letter',
        'letterparser',
        'csv-writer',
        'pluralize',
        'diff',
      ],
    },
    build: {
      // Enable minification for production builds to reduce bundle size
      minify: production ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@sentry')) return 'vendor-sentry'
              if (id.includes('leaflet') || id.includes('supercluster'))
                return 'vendor-maps'
              if (id.includes('tus-js-client')) return 'vendor-upload'
              if (id.includes('@formatjs') || id.includes('intl-'))
                return 'vendor-intl'
              if (id.includes('quill') || id.includes('parchment'))
                return 'vendor-editor'
            }
          },
        },
      },
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
    plugins:
      // Skip heavy plugins during unit testing for faster test startup
      config.NODE_ENV === 'test'
        ? []
        : config.ISAPP && production
          ? [
              // App builds with Sentry: include chunk splitting for better loading
              splitVendorChunkPlugin(),
              sentryVitePlugin({
                org: 'freegle',
                project: 'capacitor',
                authToken: config.SENTRY_AUTH_TOKEN,
                // For non-strict mode (debug builds), log errors but don't fail the build
                errorHandler: config.SENTRY_STRICT
                  ? undefined // Use default (throw on error)
                  : (err) => {
                      console.warn('⚠️ Sentry error (non-fatal in debug mode):', err.message)
                    },
                // Disable release management for non-strict mode to avoid API timeouts
                release: config.SENTRY_STRICT
                  ? undefined // Use default release management
                  : { create: false, finalize: false },
              }),
            ]
          : config.ISAPP
            ? [
                // App builds without Sentry: still need chunk splitting
                splitVendorChunkPlugin(),
              ]
            : [
                splitVendorChunkPlugin(),
                VitePWA({
                  registerType: 'autoUpdate',
                  workbox: {
                    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
                  },
                }),
                eslintPlugin({
                  exclude: ['**/node_modules/**', '**/dist/**', '**/.nuxt/**'],
                }),
                sentryVitePlugin({
                  org: 'freegle',
                  // ModTools layer overrides this to 'modtools', base config uses 'nuxt3'
                  project: config.IS_MT ? 'modtools' : 'nuxt3',
                  // Handle Sentry API timeouts (504s) gracefully - sourcemaps upload is the critical part
                  errorHandler: (err) => {
                    // Only log warning for gateway timeouts, fail for other errors
                    if (err.message && err.message.includes('504')) {
                      console.warn('⚠️ Sentry release finalize timed out (504) - sourcemaps were uploaded successfully')
                    } else {
                      throw err
                    }
                  },
                }),
              ],
  },

  // Note that this is not the standard @vitejs/plugin-legacy, but https://www.npmjs.com/package/nuxt-vite-legacy
  // Only enable legacy builds on Netlify where we need old browser support.
  // Skip in CI/Docker for faster builds (40-50% improvement).
  legacy: isNetlify
    ? {
        targets: ['chrome 49', 'since 2015', 'ios>=12', 'safari>=12'],
        modernPolyfills: [
          'es.global-this',
          'es.object.from-entries',
          'es.array.flat-map',
          'es.array.flat',
          'es.string.replace-all',
          'es.promise.any',
        ],
      }
    : false,

  // Sentry needs sourcemaps.
  sourcemap: {
    client: true,
    server: true,
  },

  // Sometimes we need to change the host when doing local testing with browser stack.
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    https: false,
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
        // The ecosystem of advertising is complex.
        //
        // We might use AdSense.  That's fairly simple.
        //
        // Or we might use prebid:
        // - The underlying ad service is Google Tags (GPT).
        // - We use prebid (pbjs), which is some kind of ad broker which gives us a pipeline of ads to use.
        //   We can also define our own ads in GPT.
        // - Google and prebid both require use of a Consent Management Platform (CMP) so that the
        //   user has indicated whether we have permission to show personalised ads.  We use CookieYes.
        // - So we need to signal to Google and prebid which CMP we're using, which we do via window.dataLayer,
        //   window.gtag and window.pbjs.
        // - We also have to define the possible advertising slots available to prebid so that it knows what to bid on.
        //   We do this once, here, for all slots. Only some slots may appear on any given page - they are
        //   defined and added in ExternalDa.
        // - When using prebid, we disable the initial ad load because it doesn't happen until after the prebid,
        //   inside ExternalDa.
        //
        // During development we don't have a CMP because CookieYes doesn't work on localhost.  So in that case we
        // don't disable initial ad load - so Google will load ads immediately.
        //
        // The order in which we load scripts is excruciatingly and critically important - see below.
        //
        // But we want to reduce LCP, so we defer all this by loading with async.
        {
          type: 'text/javascript',
          body: true,
          async: true,
          innerHTML:
            `try {
              window.dataLayer = window.dataLayer || [];
              function ce_gtag() {
                  window.dataLayer.push(arguments);
              }
              ce_gtag("consent", "default", {
                  ad_storage: "denied",
                  ad_user_data: "denied", 
                  ad_personalization: "denied",
                  analytics_storage: "denied",
                  functionality_storage: "denied",
                  personalization_storage: "denied",
                  security_storage: "granted",
                  // wait_for_update shouldn't apply because we force the CMP to load before gtag.
                  wait_for_update: 2000,
              });
              ce_gtag("set", "ads_data_redaction", true);
              ce_gtag("set", "url_passthrough", true);

              console.log('Initialising pbjs and googletag...');
              window.googletag = window.googletag || {};
              window.googletag.cmd = window.googletag.cmd || [];
              window.googletag.cmd.push(function() {
                // On the dev server, where COOKIEYES is not set, we want ads to load immediately.
              ` +
            (config.COOKIEYES
              ? `window.googletag.pubads().disableInitialLoad()`
              : '') +
            `
                window.googletag.pubads().enableSingleRequest()
                window.googletag.enableServices()
              });
            
              window.pbjs = window.pbjs || {};
              window.pbjs.que = window.pbjs.que || [];
              
              window.pbjs.que.push(function() {
                 // Custom rounding function recommended by Magnite.
                 const roundToNearestEvenIncrement = function (number) {
                   let ceiling = Math.ceil(number);
                   let ceilingIsEven = ceiling % 2 === 0;
                   if (ceilingIsEven) {
                     return ceiling;
                   } else {
                     return Math.floor(number);
                   }
                 }
                
                 window.pbjs.setConfig({
                   consentManagement: {
                     // We only need GDPR config.  We are interested in UK users, who are (for GDPR purposes if not
                     // political purposes) inside the EU. 
                     gdpr: {
                      cmpApi: 'iab',
                      allowAuctionWithoutConsent: false,
                      timeout: 3000
                     },
                     // usp: {
                     //  timeout: 8000 
                     // },
                     // gpp: {
                     //  cmpApi: 'iab',
                     //  timeout: 8000
                     // }
                   },
                   cache: {
                      url: 'https://prebid-server.rubiconproject.com/vtrack?a=26548',
                      ignoreBidderCacheKey: true,
                      vasttrack: true 
                   },
                   s2sConfig: [{
                      accountId: '26548',
                      bidders: ['mgnipbs'],   // PBS ‘bidder’ code that triggers the call to PBS
                      defaultVendor: 'rubicon',
                      coopSync: true,
                      userSyncLimit: 8,       // syncs per page up to the publisher
                      defaultTtl: 300,        // allow Prebid.js to cache bids for 5 minutes
                      allowUnknownBidderCodes: true,  // so PBJS doesn't reject responses
                      extPrebid: {
                        cache: {      // only needed if you're running video
                           vastxml: { returnCreative: false }
                        },
                        bidders: {
                          mgnipbs: {
                            wrappername: "26548_Freegle"
                          }
                        }
                      }
                    }],
                    targetingControls: {
                      addTargetingKeys: ['SOURCE']
                    },
                    cpmRoundingFunction : roundToNearestEvenIncrement,
                    useBidCache: true
                 });
                 
                 // Gourmetads requires schain config.
                 pbjs.setBidderConfig({
                  "bidders": ['gourmetads'],   
                  "config": {
                   "schain": {
                     "validation": "relaxed",
                     "config": {
                       "ver":"1.0",
                       "complete": 1,
                       "nodes": [
                         {
                           "asi":"gourmetads.com",
                           "sid":"16593",
                           "hp":1
                         }
                       ]
                     }
                   },
                 }
                });
              });  
                 
              window.pbjs.que.push(function() {
                 console.log('Add PBJS ad units', ` +
            JSON.stringify(config.AD_PREBID_CONFIG) +
            `);
                 window.pbjs.addAdUnits(` +
            JSON.stringify(config.AD_PREBID_CONFIG) +
            `)
              });

            function loadScript(url, block) {
              if (url && url.length) {
                console.log('Load script:', url);
                var script = document.createElement('script');
                script.defer = true;
                script.type = 'text/javascript';
                script.src = url;
                
                if (block) {
                  // Block loading of this script until CookieYes has been authorised.
                  // It's not clear that this blocking works, but it does no harm to 
                  // ask for it.
                  console.log('Set CookieYes script block', url);
                  script.setAttribute('data-cookieyes', 'cookieyes-advertisement')
                }
                
                document.head.appendChild(script);
              }
            }

            window.postCookieYes = function() {
              try {
                window.cookieYesComplete = true;
                console.log('Consider load of GPT and prebid');
  ` +
            (config.PLAYWIRE_PUB_ID
              ? `
                console.log('Load playwire code')
                window.ramp = window.ramp || {}
                window.ramp.que = window.ramp.que || []
                window.ramp.passiveMode = true
      
                // Load the Ramp configuration script
                const pubId = '` +
                config.PLAYWIRE_PUB_ID +
                `' 
                const websiteId = '` +
                config.PLAYWIRE_WEBSITE_ID +
                `'
      
                const configScript = document.createElement('script')
                configScript.src =
                  'https://cdn.intergient.com/' + pubId + '/' + websiteId + '/ramp.js'
  
                configScript.onload = () => {
                  console.log('Playwire script loaded')
                  window.playwireScriptLoaded = true;
                }
      
                configScript.onerror = (e) => {
                  console.log('Error loading Playwire script', e)
                }
  
                document.head.appendChild(configScript)
                console.log('Appended Playwire script to DOM')
                
                // Currently using Playwire so don't need to load GPT and prebid.`
              : `
                console.log('Playwire not configured, skipping script load')
                // Using AdSense or other ad solution instead of Playwire`) +
            `
                              
                // if (!window.weHaveLoadedGPT) {
                //   window.weHaveLoadedGPT = true;
                  
                  // We need to load:
                  // - GPT, which needs to be loaded before prebid.
                  // - Prebid.
                  // The ordering is ensured by using defer and appending the script.
                  //
                  // prebid isn't compatible with older browsers which don't support Object.entries.
                  // if (Object.fromEntries) {
                    // console.log('Load GPT and prebid');
                    // loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js', true)
                    // loadScript('/js/prebid.js', true)
                //   }
                // } else {
                //   console.log('GPT and prebid already loaded');
                // }
              } catch (e) {
                console.error('Error in postCookieYes:', e.message);
              }
            };

            // CookieYes and GSI load in parallel for faster startup.
            // CookieYes has no dependency on GSI - they serve unrelated purposes:
            //   - GSI: Google One Tap sign-in
            //   - CookieYes: cookie consent banner and TCF compliance
            // Previously CookieYes was loaded inside postGSI(), creating an unnecessary
            // sequential bottleneck (GSI download must finish before CookieYes even starts).
            ` +
            ((!config.ISAPP || config.USE_COOKIES)
              ? (config.COOKIEYES
                ? `
            // Load CookieYes immediately (no longer waits for GSI)
            console.log('Load CookieYes');
            loadScript('` + config.COOKIEYES + `', false)

            // Wait until CookieYes has set its cookie and TCF consent is available.
            var retries = 10

            function checkCookieYes() {
              if (document.cookie.indexOf('cookieyes-consent') > -1) {
                console.log('CookieYes cookie is set, so CookieYes is loaded');

                // Check that we have set the TCF string.  This only happens once the user
                // has responded to the cookie banner.
                if (window.__tcfapi) {
                  window.__tcfapi('getTCData', 2, (tcData, success) => {
                    if (success && tcData && tcData.tcString) {
                      console.log('TC data loaded and TC String set', tcData.tcString);
                      window.postCookieYes();
                    } else {
                      console.log('Failed to get TC data or string, retry.')
                      setTimeout(checkCookieYes, 100);
                    }
                  }, [1,2,3]);
                } else {
                  console.log('TCP API not yet loaded')
                  setTimeout(checkCookieYes, 100);
                }
              } else {
                console.log('CookieYes not yet loaded', retries)
                retries--

                if (retries > 0) {
                  setTimeout(checkCookieYes, 100);
                } else {
                  // It's not loaded within a reasonable length of time.  This may be because it's
                  // blocked by a browser extension.  Try to fetch the script here - if this fails with
                  // an exception then it's likely to be because it's blocked.
                  console.log('Try fetching script')
                  fetch('` + config.COOKIEYES + `').then((response) => {
                    console.log('Fetch returned', response)

                    if (response.ok) {
                      console.log('Worked, maybe just slow?')
                      retries = 10
                      setTimeout(checkCookieYes, 100);
                    } else {
                      console.log('Failed - assume blocked and proceed')
                      window.postCookieYes()
                    }
                  })
                  .catch((error) => {
                    // Assume blocked and proceed.
                    console.log('Failed to fetch CookieYes script:', error.message)
                    window.postCookieYes()
                  });
                }
              }
            }

            checkCookieYes();
            `
                : `
            // No CookieYes configured (dev environment) - defer ad loading until
            // after initial page render so PSI/performance is comparable to production
            // where CookieYes consent introduces a natural delay.
            console.log('No CookieYes to load, deferring ads until page idle')
            window.addEventListener('load', function() {
              requestIdleCallback
                ? requestIdleCallback(window.postCookieYes)
                : setTimeout(window.postCookieYes, 2000);
            });
            `)
              : `
            // App build without cookies - no consent or ads needed
            `) +
            (!config.ISAPP
              ? `
            // Web builds: Load GSI for Google One Tap sign-in (parallel with CookieYes)
            loadScript('https://accounts.google.com/gsi/client')
            `
              : `
            // App builds: GSI not needed (apps use Capacitor plugin for Google login)
            `) +
            `
          } catch (e) {
            console.error('Error initialising ads and consent:', e.message);
          }`,
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
      link: [
        {
          rel: 'preconnect',
          href: config.IMAGE_DELIVERY,
          crossorigin: 'anonymous',
        },
        {
          rel: 'dns-prefetch',
          href: config.IMAGE_DELIVERY,
        },
        {
          rel: 'preconnect',
          href: config.APIv2.replace('/apiv2', ''),
          crossorigin: 'anonymous',
        },
        {
          rel: 'dns-prefetch',
          href: config.APIv2.replace('/apiv2', ''),
        },
        ...(config.COOKIEYES
          ? [
              {
                rel: 'preconnect',
                href: 'https://cdn-cookieyes.com',
              },
              {
                rel: 'dns-prefetch',
                href: 'https://cdn-cookieyes.com',
              },
            ]
          : []),
        ...(!config.ISAPP
          ? [
              {
                rel: 'preconnect',
                href: 'https://accounts.google.com',
                crossorigin: 'anonymous',
              },
              {
                rel: 'dns-prefetch',
                href: 'https://accounts.google.com',
              },
            ]
          : []),
        ...(config.PLAYWIRE_PUB_ID
          ? [
              {
                rel: 'dns-prefetch',
                href: 'https://cdn.intergient.com',
              },
            ]
          : []),
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
      baseURL: config.TUS_UPLOADER.replace(':8080', ''),
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

  // Disable HTTPS redirects for development
  security: {
    headers: {
      strictTransportSecurity: false,
    },
  },

  // Disable security features that force HTTPS
  routerOptions: {
    strictSSL: false,
  },
})
