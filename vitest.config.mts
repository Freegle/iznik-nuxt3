import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

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

// Build explicit aliases for modtools composables that don't exist in root composables/
const modtoolsComposables = fs.readdirSync(
  path.join(rootDir, 'modtools/composables')
)
const rootComposables = fs.readdirSync(path.join(rootDir, 'composables'))
const modtoolsOnlyComposables = modtoolsComposables.filter(
  (c) => !rootComposables.includes(c)
)

// Create aliases for modtools-only composables
const composableAliases = {}
for (const composable of modtoolsOnlyComposables) {
  const composableName = composable.replace('.js', '')
  composableAliases[`~/composables/${composableName}`] = path.join(
    rootDir,
    'modtools/composables',
    composable
  )
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Specific store/composable aliases must come before generic ~ alias
      ...storeAliases,
      ...composableAliases,
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
