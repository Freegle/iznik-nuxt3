<template>
  <NuxtPicture
    :key="src + '-' + modifiers"
    :format="format"
    :fit="fit"
    :preload="preload"
    :provider="chooseProvider"
    :src="chooseSrc"
    :modifiers="modifiers"
    :class="(className ? className : '') + ' ' + isFluid"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="preload ? 'eager' : loading"
    :sizes="sizes"
    :placeholder="placeholder"
    @error="brokenImage"
  />
</template>
<script setup>
import { defineProps } from 'vue'
import * as Sentry from '@sentry/browser'

const runtimeConfig = useRuntimeConfig()

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

if (props.src?.includes('gimg_0.jpg')) {
  Sentry.captureMessage('Broken image: ' + props.src)
}

const emit = defineEmits(['error'])

// If the source contains a dash then the first part is the provider and the second part the source.
const chooseProvider = computed(() => {
  const p = props.src.indexOf('-')

  if (p !== -1) {
    // For now we only have one such option - freegletusd, which we render using Nuxt Image's weserve provider.
    return 'weserv'
  } else {
    // Defaults to uploadcare.
    return 'uploadcare'
  }
})

const chooseSrc = computed(() => {
  const p = props.src.indexOf('-')

  if (p !== -1) {
    // For now we only have one such option - freegletusd, which we render by pointing at our upload server
    return runtimeConfig.public.TUS_UPLOADER + '/' + props.src.substring(p + 1)
  }

  return props.src
})

function brokenImage(e) {
  console.log('Proxy image broken')
  emit('error', e)
}
</script>
