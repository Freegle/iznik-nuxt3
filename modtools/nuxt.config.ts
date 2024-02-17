const config = defineNuxtConfig({
  extends: [
    '../'
  ],
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