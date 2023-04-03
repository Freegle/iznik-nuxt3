import config from './config'

// @ts-ignore
// @ts-ignore
export default defineNuxtConfig({
  _cli: false,

  // Rendering modes are confusing.
  //
  // - target can be:
  //   - static: can host on static hosting such as Azure Static Web Apps
  //   - server: requires a node server.
  // - ssr can be:
  //   - true: renders at
  //     - generate time for target: static, or
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

  routeRules: () => {
    return {
      // Nuxt3 has some lovely features to do with how routes are generated/cached.  We use:
      //
      // prerender: true - this will be generated at build time.
      // static: true - this is generated on demand, and then cached until the next build
      // swr: 'time' - this is generated on demand each 'time' period.
      // ssr: false - this is client-side rendered.
      //
      // There are potential issues where a deployment happens while a page is partway through loading assets, or
      // later loads assets which are no longer present.  Nuxt3 now has a fallback of reloading the page when
      // it detects a failed chunk load.
      '/': { prerender: true },
      '/explore': { prerender: true },
      '/explore/region/**': { prerender: true },
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
      '/profile/**': { ssr: false },
      '/promote': { ssr: false },
      '/settings/**': { ssr: false },
      '/stats/**': { ssr: false },
      '/stories/**': { ssr: false },
      '/story/**': { ssr: false },
      '/teams': { ssr: false },

      // Render on demand - may never be shown in a given build - then cache for a while.
      '/communityevent/**': { swr: 3600 },
      '/communityevents/**': { swr: 3600 },
      // TODO Enumerate groups and pre-render them.
      '/explore/**': { swr: 3600 },
      '/message/**': { swr: 600 },
      '/shortlink/**': { swr: 600 },
      '/volunteering/**': { swr: 3600 },
      '/volunteerings/**': { swr: 3600 },
    }
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
  },

  build: {
    // Need to transpile otherwise SSR fails - see https://github.com/nuxt/framework/discussions/4523.
    transpile: [
      /bootstrap-vue-3/,
      /vue3-lazyload/,
      /vue-image-zoomer/,
      /vue3-draggable-resizable/,
      /pinia-plugin-persist/,
      /vue-social-sharing/,
    ],
  },

  webpack: {
    // Reduce size of CSS initial load.
    extractCSS: true,
  },

  modules: ['@pinia/nuxt'],

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
    },
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
