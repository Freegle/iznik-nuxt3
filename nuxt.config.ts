import { VitePWA } from 'vite-plugin-pwa'
import eslintPlugin from 'vite-plugin-eslint'
import legacy from '@vitejs/plugin-legacy'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import config from './config'

// @ts-ignore
export default defineNuxtConfig({
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
  ssr: true,
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

      // Don't prerender the messages - too many
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
  },

  webpack: {
    // Reduce size of CSS initial load.
    extractCSS: true,
  },

  modules: ['@pinia/nuxt', 'floating-vue/nuxt'],

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
      IMAGE_SITE: config.IMAGE_SITE,
      SENTRY_DSN: config.SENTRY_DSN,
      BUILD_DATE: new Date().toISOString(),
      NETLIFY_DEPLOY_ID: process.env.DEPLOY_ID,
      NETLIFY_SITE_NAME: process.env.SITE_NAME,
      MATOMO_HOST: process.env.MATOMO_HOST,
      COOKIEYES: config.COOKIEYES,
    },
  },

  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '/assets/css/global.scss',
    'leaflet/dist/leaflet.css',
  ],

  vite: {
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
      VitePWA({ registerType: 'autoUpdate' }),
      // Make Lint errors cause build failures.
      eslintPlugin(),
      legacy({
        targets: ['since 2015'],
      }),
      sentryVitePlugin({
        org: 'freegle',
        project: 'nuxt3',
      }),
    ],
  },

  // Sentry needs sourcemaps.
  sourcemap: {
    client: true,
    server: true,
  },

  app: {
    head: {
      title: "Freegle - Don't throw it away, give it away!",
      script: [
        // The ecosystem of advertising is complex.
        // - The underlying ad service is Google Tags (GPT).
        // - We use prebid (pbjs), which gives a pipeline of ads to use.
        // - Google and prebid both require use of a Consent Management Platform (CMP) so that the
        //   user has indicated whether we have permission to show personalised ads.  We use CookieYes.
        // - So we need to signal to Google and prebid which CMP we're using, which we do via window.dataLayer,
        //   window.gtag and window.pbjs.
        // - We also have to define the possible advertising slots available to prebid so that it knows what to bid on.
        //   We do this once, here, for all slots. Only some slots may appear on any given page.
        // - When using prebid, we disable the initial ad load because it doesn't happen until after the prebid, inside ExternalDa
        //
        // During development we don't have a CMP because CookieYes doesn't work on localhost.  So in that case we
        // - don't disable initial ad load.
        // - set the allowAuctionWithoutConsent flag to allow prebid to continue.
        {
          type: 'text/javascript',
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
                 window.pbjs.setConfig({
                   consentManagement: {
                     // We only need GDPR config.  We are interested in UK users, who are (for GDPR purposes if not
                     // political purposes) inside the EU. 
                     gdpr: {
                      cmpApi: 'iab',
                      allowAuctionWithoutConsent: ` +
            (config.COOKIEYES ? 'false' : 'true') +
            `,
                      timeout: 3000
                     },
                     // usp: {
                     //  timeout: 8000 
                     // },
                     // gpp: {
                     //  cmpApi: 'iab',
                     //  timeout: 8000
                     // }
                   }
                 });
                 
                 window.pbjs.que.push(function() {
                       window.pbjs.addAdUnits(` +
            JSON.stringify(config.AD_PREBID_CONFIG) +
            `})
                );
              });  
            } catch (e) {
              console.error('Error initialising pbjs and googletag:', e.message);
            }`,
        },
        // We have to load the CookieYes script before we load prebid, because prebid looks for the CMP.
        //
        // We use defer because we want to ensure that this is loaded before GPT and prebid.
        config.COOKIEYES
          ? {
              src: config.COOKIEYES,
              defer: true,
            }
          : {},
        {
          src: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
          defer: true,
        },
        {
          src: '/js/prebid.js',
          defer: true,
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
})
