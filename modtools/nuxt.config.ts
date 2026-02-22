import fs from 'fs'

const packageJson = fs.readFileSync('./package.json', 'utf8')
const version = JSON.parse(packageJson).version || 0
// import config from '../config'
console.log('Building iznik-modtools', version)

process.env.MT = 'true'

export default defineNuxtConfig({
  // target: 'static',
  ssr: false,
  extends: ['../'],
  compatibilityDate: '2024-11-26',

  // Override parent's cdnURL to use same-origin proxy approach.
  // This avoids CORS issues in strict browsers (Firefox with privacy settings).
  // Assets are requested from /netlify/... which _redirects proxies to the deploy URL.
  $production: {
    app: {
      cdnURL: process.env.DEPLOY_URL
        ? '/netlify/' + process.env.DEPLOY_URL.replace('https://', '')
        : '',
    },
  },
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '/assets/css/global.scss',
  ],
  runtimeConfig: {
    public: {
      VERSION: version,
      BUILD_DATE: new Date().toLocaleString('en-GB'),
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
        // These add to the ones in ../nuxt.config.ts
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
})
