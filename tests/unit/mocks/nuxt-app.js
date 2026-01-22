/**
 * Mock implementation of Nuxt's #app module
 * Used for unit testing components that use useNuxtApp()
 */
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
