import path from 'path-browserify'
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

export default {
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
}