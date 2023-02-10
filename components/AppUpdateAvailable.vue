<template>
  <NoticeMessage v-if="show" variant="danger">
    Please update your app to version {{ applatestversion }} from {{ appcurrentversion }}.
    This usually happens automatically overnight.
    <div v-if="appupdaterequired">THIS IS A REQUIRED UPDATE</div>
    <ExternalLink v-if="!isios" href="https://support.google.com/googleplay/answer/113412?hl=en">Manual updating instructions for Android.
    </ExternalLink>
    <ExternalLink v-if="isios" href="https://support.apple.com/en-gb/HT202180">Manual updating instructions for Apple iOS.</ExternalLink>
  </NoticeMessage>
</template>
<script>
import { useMobileStore } from '@/stores/mobile'

export default {
  setup() {
    const mobileStore = useMobileStore()
    const runtimeConfig = useRuntimeConfig()

    return {
      mobileStore,
      runtimeConfig,
    }
  },
  computed: {
    appcurrentversion(){
      return this.runtimeConfig.public.MOBILE_VERSION

    },
    appupdaterequired(){
      return this.mobileStore.appupdaterequired
    },
    applatestversion() {
      return this.mobileStore.applatestversion
    },
    show() {
      if (!this.mobileStore.isApp) return false
      return this.mobileStore.appupdaterequired || this.mobileStore.appupdateavailable
    },
    isios() {
      return this.mobileStore.isiOS
    },
  }
}
</script>
