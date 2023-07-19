import path from 'path-browserify'
import eslintPlugin from 'vite-plugin-eslint'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import config from './config'

export default {
  debug: true,
  build: {
    target: 'es2015',
  },

  // Make the ~ and @ aliases work in Vite as per https://github.com/vitejs/vite/issues/382.
  resolve: {
    alias: [
      {
        find: /~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /@\//,
        replacement: path.join(process.cwd(), './src/renderer') + '/',
      },
    ],
  },

  plugins: [
    VitePWA({ registerType: 'autoUpdate' }),
    // Make Lint errors cause build failures.
    eslintPlugin(),
    legacy({
      targets: [
        'chrome >= 64',
        'edge >= 79',
        'safari >= 11.1',
        'firefox >= 67',
      ],
      ignoreBrowserslistConfig: true,
      modernPolyfills: ['es/global-this'],
    }),
  ],

  server: {
    proxy: {
      '/apiv1': {
        target: config.APIv1,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apiv1/, '/'),
      },
      '/apiv2': {
        target: config.APIv2,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apiv2/, '/'),
      },
    },
  },
}
