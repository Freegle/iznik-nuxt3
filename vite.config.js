import path from 'path-browserify'
import eslintPlugin from 'vite-plugin-eslint'
import constants from './constants'

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

  // Make Lint errors cause build failures.
  plugins: [eslintPlugin()],

  server: {
    proxy: {
      '/apiv1': {
        target: constants.APIv1,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apiv1/, '/'),
      },
      '/apiv2': {
        target: constants.APIv2,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apiv2/, '/'),
      },
    },
  },
}
