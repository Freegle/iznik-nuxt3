import fs from 'fs'

const packageJson = fs.readFileSync('./package.json', 'utf8')
const version = JSON.parse(packageJson).version || 0
// import config from '../config'
console.log('Building iznik-modtools', version)

export default defineNuxtConfig({
  // target: 'static',
  ssr: false,
  extends: ['../'],
  compatibilityDate: '2024-11-26',
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '/assets/css/global.scss',
    'leaflet/dist/leaflet.css',
  ],
  /* modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    'nuxt-vite-legacy',
    '@bootstrap-vue-next/nuxt'
  ], */
  runtimeConfig: {
    public: {
      VERSION: version,
      BUILD_DATE: new Date().toISOString(),
    },
  },
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
  },
  postcss: {
    // https://answers.netlify.com/t/javascript-heap-out-of-memory-when-trying-to-build-a-nuxt-app/93138/13
    plugins: {
      cssnano: false, // disable cssnano
      // process.env.NODE_ENV === 'production'
      //  ? { preset: ['default', { discardComments: { removeAll: true } }] }
      //  : false, // disable cssnano when not in production
    },
  },
  /* modules: [
  ],
  plugins: [
  ], */

  // Sometimes we need to change the host when doing local testing with browser stack.
  devServer: {
    host: '127.0.0.1',
    port: 3000,
  },
  app: {
    head: {
      // Overrides and inherits ones not set here
      title: 'ModTools',
      script: [
        {
          type: 'text/javascript',
          body: true,
          async: true,
          innerHTML: `try {
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
            loadScript('https://accounts.google.com/gsi/client')
          } catch (e) {
            console.error('Error initialising google:', e.message);
          }`,
        },
      ],
      meta: [
        { name: 'robots', content: 'noindex' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'author', name: 'author', content: 'Freegle+ModTools' },
        { name: 'supported-color-schemes', content: 'light' },
        { name: 'color-scheme', content: 'light' },
        { name: 'facebook-domain-verification', content: '' },
      ],
    },
  },
  /* image: {
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
  } */
})
