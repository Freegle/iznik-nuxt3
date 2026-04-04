/**
 * Mock implementation of Nuxt's #app and #imports modules
 * Used for unit testing components that use useNuxtApp(), useRouter(), etc.
 */

// Re-export Vue Composition API functions that Nuxt auto-imports
export {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  defineAsyncComponent,
  toRef,
  nextTick,
} from 'vue'

export function useNuxtApp() {
  return {
    $api: null, // Components should mock this in their tests
  }
}

export function useRuntimeConfig() {
  return {
    public: {},
  }
}

// Stub for components that import useHead from #imports directly
export function useHead() {}

// Default mock for useRouter - tests can override this with vi.mock
const mockRouterPush = () => {}
export function useRouter() {
  return {
    push: mockRouterPush,
    replace: mockRouterPush,
    currentRoute: { value: { path: '/' } },
  }
}

// Default mock for useRoute - returns empty route; tests override via vi.mock('#imports')
export function useRoute() {
  return { params: {}, query: {}, path: '/', name: 'index', fullPath: '/' }
}

// Mock for twem (emoji processing) - just pass through text
export function twem(text) {
  return text
}

// Nuxt plugin registration stub - just returns the plugin function as-is.
export function defineNuxtPlugin(plugin) {
  return plugin
}
