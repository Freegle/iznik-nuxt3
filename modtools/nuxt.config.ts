import fs from 'fs'

const packageJson = fs.readFileSync('./package.json', 'utf8')
const version = JSON.parse(packageJson).version || 0
console.log('Building iznik-modtools', version)

const config = defineNuxtConfig({
  // target: 'static',
  ssr: false,
  extends: [
    '../'
  ],
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '/assets/css/global.scss',
    'leaflet/dist/leaflet.css',
  ],
  runtimeConfig: {
    public: {
      VERSION: version,
      BUILD_DATE: new Date().toISOString(),
    }
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
  postcss: { // https://answers.netlify.com/t/javascript-heap-out-of-memory-when-trying-to-build-a-nuxt-app/93138/13
    plugins: {
      cssnano: false // disable cssnano
        //process.env.NODE_ENV === 'production'
        //  ? { preset: ['default', { discardComments: { removeAll: true } }] }
        //  : false, // disable cssnano when not in production      
    }
  },
  modules: [
  ],
  plugins: [
  ],

  // Sometimes we need to change the host when doing local testing with browser stack.
  devServer: {
    host: '127.0.0.1',
    port: 3000,
  },

  app: {
    head: { // Overrides and inherits ones not set here
      title: "ModTools",
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'author', name: 'author', content: 'Freegle+ModTools' },
        { name: 'supported-color-schemes', content: 'light' },
        { name: 'color-scheme', content: 'light' },
        { name: 'facebook-domain-verification', content: '', },
      ]
    }
  }
})

// Can we remove config.app.head.meta.unwanted here - no
// console.log(config.app?.head.meta)

export default config
