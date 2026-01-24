import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
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
  // Support both ~ and @ prefixes for modtools stores
  storeAliases[`~/stores/${storeName}`] = path.join(
    rootDir,
    'modtools/stores',
    store
  )
  storeAliases[`@/stores/${storeName}`] = path.join(
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
  // Support both ~ and @ prefixes for modtools composables
  composableAliases[`~/composables/${composableName}`] = path.join(
    rootDir,
    'modtools/composables',
    composable
  )
  composableAliases[`@/composables/${composableName}`] = path.join(
    rootDir,
    'modtools/composables',
    composable
  )
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Allow imports without .vue extension
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      // Nuxt virtual modules
      '#app': path.join(rootDir, 'tests/unit/mocks/nuxt-app.js'),
      '#imports': path.join(rootDir, 'tests/unit/mocks/nuxt-app.js'),
      // External module stubs for testing
      'vue-read-more3/src/ReadMoreComponent': path.join(
        rootDir,
        'tests/unit/mocks/ReadMoreComponent.js'
      ),
      // Component stubs for testing
      '~/components/ProfileImage': path.join(
        rootDir,
        'tests/unit/mocks/ProfileImage.js'
      ),
      // Stub for ModCommentAddModal (has deep dependency chain)
      '~/components/ModCommentAddModal': path.join(
        rootDir,
        'tests/unit/mocks/ModCommentAddModal.js'
      ),
      // External library mocks
      // More specific paths must come before less specific ones
      '@vueup/vue-quill/dist/vue-quill.snow.css': path.join(
        rootDir,
        'tests/unit/mocks/vue-quill.css'
      ),
      '@vueup/vue-quill': path.join(rootDir, 'tests/unit/mocks/vue-quill.js'),
      'quill-html-edit-button': path.join(
        rootDir,
        'tests/unit/mocks/quill-html-edit-button.js'
      ),
      papaparse: path.join(rootDir, 'tests/unit/mocks/papaparse.js'),
      'vue-letter': path.join(rootDir, 'tests/unit/mocks/vue-letter.js'),
      letterparser: path.join(rootDir, 'tests/unit/mocks/letterparser.js'),
      // Handsontable mocks
      '@handsontable/vue3': path.join(
        rootDir,
        'tests/unit/mocks/handsontable.js'
      ),
      'handsontable/registry': path.join(
        rootDir,
        'tests/unit/mocks/handsontable-registry.js'
      ),
      'handsontable/dist/handsontable.full.css': path.join(
        rootDir,
        'tests/unit/mocks/handsontable-css.js'
      ),
      // Composable mocks for testing
      '~/composables/useOurModal': path.join(
        rootDir,
        'tests/unit/mocks/useOurModal.js'
      ),
      // Capacitor/mobile module mocks
      '@capacitor/preferences': path.join(
        rootDir,
        'tests/unit/mocks/capacitor-preferences.js'
      ),
      '@aspect/aspectra': path.join(
        rootDir,
        'tests/unit/mocks/aspectra-barcode-scanner.js'
      ),
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
    // Memory-safe configuration for WSL environments
    // See: https://vitest.dev/guide/improving-performance
    pool: 'forks', // 'forks' is more stable than 'threads' for memory isolation
    // Limit workers based on available memory (WSL often has limited resources)
    // Using 50% of CPU cores as a safe default - adjust if needed
    maxWorkers: process.env.CI
      ? 2
      : Math.max(1, Math.floor(os.cpus().length / 2)),
    // Disable file parallelism if running with --single-thread for debugging
    fileParallelism: !process.env.VITEST_SINGLE_THREAD,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'components/**/*.vue',
        'modtools/components/**/*.vue',
        'composables/**/*.js',
        'modtools/composables/**/*.js',
        'stores/**/*.js',
        'modtools/stores/**/*.js',
        'pages/**/*.vue',
        'modtools/pages/**/*.vue',
      ],
    },
  },
})
