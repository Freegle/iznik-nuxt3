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
  overrides: [
    {
      files: ['layouts/*.vue', 'pages/**/*.vue'],
      rules: { 'vue/multi-word-component-names': 'off' },
    },
  ],
  globals: {
    process: 'readonly',
    defineProps: 'readonly',
    definePageMeta: 'readonly',
    useRuntimeConfig: 'readonly',
    defineNuxtPlugin: 'readonly',
    defineNuxtRouteMiddleware: 'readonly',
    getCurrentInstance: 'readonly',
    useRoute: 'readonly',
    useAsyncData: 'readonly',
    useLazyAsyncData: 'readonly',
    createApp: 'readonly',
    useNuxtApp: 'readonly',
    useMe: 'readonly',
    computed: 'readonly',
  },
}
