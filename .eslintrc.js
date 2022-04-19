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
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['Message'],
      },
    ],
  },
  globals: {
    definePageMeta: 'readonly',
    useRuntimeConfig: 'readonly',
    defineNuxtPlugin: 'readonly',
    useRoute: 'readonly',
    useAsyncData: 'readonly',
    useLazyAsyncData: 'readonly',
    createApp: 'readonly',
    useMe: 'readonly',
  },
}
