<template>
  <NuxtPicture
    :format="format"
    :fit="fit"
    :preload="preload"
    provider="uploadcareProxy"
    :src="src"
    :modifiers="modifiers"
    :class="(className ? className : '') + ' ' + isFluid"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="preload ? 'eager' : loading"
    :sizes="sizes"
    :placeholder="placeholder"
  />
</template>
<script setup>
import { defineProps } from 'vue'
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

if (props.src.includes('gimg_0.jpg')) {
  Sentry.captureMessage('Broken image: ' + props.src)
}
</script>
