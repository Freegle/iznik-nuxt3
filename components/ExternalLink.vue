<template>
  <!-- eslint-disable-next-line -->
  <a :href="carefulHref" :target="target" rel="noopener noreferrer" @click="openInBrowser"><slot /></a>
</template>
<script setup>
import { computed } from 'vue'
import { AppLauncher } from '@capacitor/app-launcher'
import { useMobileStore } from '@/stores/mobile'

const props = defineProps({
  href: {
    type: String,
    required: true,
  },
})

const carefulHref = computed(() => {
  return props.href?.startsWith('http') || props.href?.startsWith('mailto')
    ? props.href
    : 'https://' + props.href
})

const target = computed(() => {
  return props.href?.startsWith('mailto') ? '_self' : '_blank'
})

function openInBrowser() {
  // APP
  const mobileStore = useMobileStore()
  if (mobileStore.isApp) {
    const url = carefulHref.value
    AppLauncher.openUrl({ url })
    return false
  }
  return true
}
</script>
