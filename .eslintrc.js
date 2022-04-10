module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ['@nuxtjs', 'plugin:prettier/recommended'],
  // add your custom rules here
  rules: {
    'no-console': 'off',
  },
  globals: {
    definePageMeta: 'readonly',
    useRuntimeConfig: 'readonly',
    defineNuxtPlugin: 'readonly',
    useRoute: 'readonly',
    useAsyncData: 'readonly',
    useLazyAsyncData: 'readonly',
    createApp: 'readonly',
  },
}
