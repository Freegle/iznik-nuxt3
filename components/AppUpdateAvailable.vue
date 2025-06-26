<template>
  <NoticeMessage v-if="show" variant="danger">
    Please update your app to version {{ applatestversion }} from
    {{ appcurrentversion }}. This usually happens automatically overnight.
    <div v-if="appupdaterequired">THIS IS A REQUIRED UPDATE</div>
    <ExternalLink
      v-if="!isios"
      href="https://support.google.com/googleplay/answer/113412?hl=en"
      >Manual updating instructions for Android.
    </ExternalLink>
    <ExternalLink v-if="isios" href="https://support.apple.com/en-gb/HT202180"
      >Manual updating instructions for Apple iOS.</ExternalLink
    >
  </NoticeMessage>
</template>
<script setup>
import { useMobileStore } from '@/stores/mobile'

const mobileStore = useMobileStore()
const runtimeConfig = useRuntimeConfig()

const appcurrentversion = computed(() => {
  return runtimeConfig.public.MOBILE_VERSION
})

const appupdaterequired = computed(() => {
  return mobileStore.appupdaterequired
})

const applatestversion = computed(() => {
  return mobileStore.applatestversion
})

const isios = computed(() => {
  return mobileStore.isiOS
})

const show = computed(() => {
  if (!mobileStore.isApp) return false
  return mobileStore.appupdaterequired || mobileStore.appupdateavailable
})
</script>
