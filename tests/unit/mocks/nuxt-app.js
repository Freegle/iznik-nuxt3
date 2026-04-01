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

// Default mock for useRouter - tests can override this with vi.mock
const mockRouterPush = () => {}
export function useRouter() {
  return {
    push: mockRouterPush,
    replace: mockRouterPush,
    currentRoute: { value: { path: '/' } },
  }
}

// Default mock for useRoute
export function useRoute() {
  return {
    params: {},
    query: {},
    path: '/',
  }
}

// No-op mock for useHead (Nuxt composable for setting page head metadata)
export function useHead() {}

// Mock for twem (emoji processing) - just pass through text
export function twem(text) {
  return text
}
