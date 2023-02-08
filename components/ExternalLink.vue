<template>
  <!-- eslint-disable-next-line -->
  <a :href="href" target="_blank" rel="noopener noreferrer" @click="openInBrowser"><slot /></a>
</template>
<script>
import { AppLauncher } from '@capacitor/app-launcher'
import { useMobileStore } from '@/stores/mobile'

export default {
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  methods: {
    openInBrowser() {
      const mobileStore = useMobileStore()
      if (mobileStore.isApp) {
        AppLauncher.openUrl({ url: this.href })
        return false
      }
      return true
    },
  },
}
</script>
