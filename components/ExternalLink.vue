<template>
  <!-- eslint-disable-next-line -->
  <a :href="carefulHref" target="_blank" rel="noopener noreferrer" @click="openInBrowser"><slot /></a>
</template>
<script>
import { AppLauncher } from '@capacitor/app-launcher'
import { useMobileStore } from '@/stores/mobile'
import { useShortlinkStore } from '../stores/shortlinks'

export default {
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  async setup() {
    const mobileStore = useMobileStore()
    const shortlinkStore = useShortlinkStore()
    return {
      mobileStore,
      shortlinkStore,
    }
  },
  methods: {
    async openInBrowser() {
      if (this.mobileStore.isApp) {
        let url = this.carefulHref
        /*const freeglein = 'https://freegle.in/'
        if( url.startsWith(freeglein)){
          const sname = url.substring(freeglein.length)
          console.log('MATCH FREEGLE.IN', sname)
          const sl = await this.shortlinkStore.fetch(26499)
          console.log('sl', sl)
          url = 'https://freegle.org.uk/businesscards/FreegleBusinessCardSmall.jpg' // https://ilovefreegle.org/businesscards/FreegleBusinessCardSmall.jpg
          //const url = this.href.replace('ilovefreegle.org','freegle.org.uk')
        }
        console.log('openInBrowser',url)*/
        AppLauncher.openUrl({ url })
        return false
      }
      return true
    },
  },
  computed: {
    carefulHref() {
      return this.href.startsWith('http') ? this.href : 'https://' + this.href
    },
  },
}
</script>
