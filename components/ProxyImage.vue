<template>
  <NuxtPicture
    :format="format"
    :fit="fit"
    provider="uploadcareProxy"
    :src="src"
    :modifiers="modifiers"
    :class="(className ? className : '') + ' ' + isFluid"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
  />
</template>
<script setup>
import { defineProps } from 'vue'

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
})

const isFluid = computed(() => (props.fluid ? 'img-fluid' : ''))
</script>
