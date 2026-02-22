<template>
  <NuxtPicture
    :format="format"
    :fit="fit"
    :preload="preloadValue"
    provider="weserv"
    :src="fullSrc"
    :modifiers="modifiers"
    :class="(className ? className : '') + ' ' + isFluid"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="preload ? 'eager' : loading"
    :img-attrs="preload ? { fetchpriority: 'high' } : undefined"
    :sizes="sizes"
    :placeholder="placeholder"
    @error="brokenImage"
  />
</template>
<script setup>
import * as Sentry from '@sentry/browser'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  modifiers: {
    type: String,
    required: false,
    default: null,
  },
  preload: {
    type: Boolean,
    required: false,
    default: false,
  },
  loading: {
    type: String,
    required: false,
    default: 'lazy',
  },
  className: {
    type: String,
    required: false,
    default: null,
  },
  fluid: {
    type: Boolean,
    required: false,
    default: false,
  },
  fit: {
    type: String,
    required: false,
    default: 'inside',
  },
  format: {
    type: String,
    required: false,
    default: 'webp',
  },
  alt: {
    type: String,
    required: false,
    default: null,
  },
  width: {
    type: Number,
    required: false,
    default: null,
  },
  height: {
    type: Number,
    required: false,
    default: null,
  },
  sizes: {
    type: String,
    required: false,
    default: null,
  },
  placeholder: {
    type: String,
    required: false,
    default: null,
  },
})

const isFluid = computed(() => (props.fluid ? 'img-fluid' : ''))

const preloadValue = computed(() => {
  if (!props.preload) return false
  return { fetchPriority: 'high' }
})

if (process.client && props.src.includes('gimg_0.jpg')) {
  Sentry.captureMessage('Broken image: ' + props.src)
}

const fullSrc = computed(() => {
  let ret = props.src

  if (!ret.startsWith('http')) {
    ret = useRuntimeConfig().public.USER_SITE + ret
  }

  // If there is a ?, use encodeURI on that and everything after, otherwise those parameters get picked up
  // by wsrv rather than passed on
  if (ret.includes('?')) {
    const [base, query] = ret.split('?')
    const encodedQuery = encodeURIComponent(query)
    ret = base + '?' + encodedQuery
  }
  return ret
})

const emit = defineEmits(['error'])

function brokenImage(e) {
  emit('error', e)
}
</script>
