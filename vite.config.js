import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from 'path-browserify'
import eslintPlugin from 'vite-plugin-eslint'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import config from './config'

const plugins = []
if( !config.ISAPP) {
  plugins.push(eslintPlugin()) // Make Lint errors cause build failures.
  plugins.push( // CC Generates System.register which is not defined
    legacy({
      targets: ['> 0.5%, last 2 versions, Firefox ESR, not dead'],
    }))
}

export default {
  debug: true,

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

  plugins,

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