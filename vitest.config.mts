import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': rootDir,
      '@': rootDir,
    },
  },
  test: {
    include: ['tests/unit/**/*.spec.{js,ts}'],
    setupFiles: ['tests/unit/setup.ts'],
    globals: true,
    environment: 'happy-dom',
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['components/**/*.vue', 'modtools/components/**/*.vue'],
    },
  },
})
