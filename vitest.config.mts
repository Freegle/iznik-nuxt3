import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const rootDir = fileURLToPath(new URL('./', import.meta.url))

// Build explicit aliases for modtools stores that don't exist in root stores/
const modtoolsStores = fs.readdirSync(path.join(rootDir, 'modtools/stores'))
const rootStores = fs.readdirSync(path.join(rootDir, 'stores'))
const modtoolsOnlyStores = modtoolsStores.filter((s) => !rootStores.includes(s))

// Create aliases for modtools-only stores
const storeAliases = {}
for (const store of modtoolsOnlyStores) {
  const storeName = store.replace('.js', '')
  storeAliases[`~/stores/${storeName}`] = path.join(
    rootDir,
    'modtools/stores',
    store
  )
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Specific store aliases must come before generic ~ alias
      ...storeAliases,
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
