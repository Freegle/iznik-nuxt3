module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'espree',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: ['@nuxtjs', 'plugin:prettier/recommended'],
  // add your custom rules here
  rules: {
    'no-console': 'off',

    // We have a lot of legacy code which doesn't define emits.
    'vue/require-explicit-emits': 'off',
    // no-v-model-argument rule is broken for Vue3, which requires that syntax for .sync.
    'vue/no-v-model-argument': 'off',
    'vue/multi-word-component-names': [
      'error',
      {
        // error page for custom errors triggers this, so ignore it.
        ignores: ['error'],
      },
    ],
    'vue/script-setup-uses-vars': 'error',
  },
  overrides: [
    {
      files: [
        'layouts/*.vue',
        'pages/**/*.vue',
        'modtools/layouts/*.vue',
        'modtools/pages/**/*.vue',
      ],
      rules: {
        // Not sure why we have two copies of this, one above and one here, but this one makes [id] work.
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
  globals: {
    process: 'readonly',
    defineAsyncComponent: 'readonly',
    defineExpose: 'readonly',
    defineProps: 'readonly',
    definePageMeta: 'readonly',
    useRuntimeConfig: 'readonly',
    defineNuxtConfig: 'readonly',
    defineNuxtPlugin: 'readonly',
    defineNitroPlugin: 'readonly',
    defineEmits: 'readonly',
    defineNuxtRouteMiddleware: 'readonly',
    defineEventHandler: 'readonly',
    getCurrentInstance: 'readonly',
    useAsyncData: 'readonly',
    useLazyAsyncData: 'readonly',
    createApp: 'readonly',
    useNuxtApp: 'readonly',
    useLoadingIndicator: 'readonly',
    useRuntimeHook: 'readonly',
    useHead: 'readonly',
    useRouter: 'readonly',
    ref: 'readonly',
    computed: 'readonly',
    watch: 'readonly',
    onMounted: 'readonly',
    onBeforeUnmount: 'readonly',
    usePinia: 'readonly',
    navigateTo: 'readonly',
    sendRedirect: 'readonly',
    setResponseStatus: 'readonly',
  },
}
