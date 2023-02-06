<template>
  <!-- eslint-disable-next-line -->
  <a :href="href" target="_blank" rel="noopener noreferrer" @click="openInBrowser"><slot /></a>
</template>
<script>
import { AppLauncher } from '@capacitor/app-launcher'

export default {
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  methods: {
    openInBrowser() {
      const runtimeConfig = useRuntimeConfig()
      if (runtimeConfig.public.IS_APP) {
        AppLauncher.openUrl({ url: this.href })
        return false
      }
      return true
    },
  },
}
</script>
