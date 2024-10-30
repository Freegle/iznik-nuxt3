<template>
  <div v-if="true">
    <PrivacyUpdate />
    <div v-if="show" class="d-flex justify-content-around">
      <ExternalLink
        href="https://www.adsmartfromsky.co.uk/local-heroes-voting/?pid=114546"
        class="d-none d-md-block w-100"
      >
        <ProxyImage
          src="/SkyAd.png"
          alt="Vote for us banner"
          sizes="1px sm:576px md:768px"
        />
      </ExternalLink>
      <!--      <nuxt-link to="/NationalReuseDay" class="grid">-->
      <!--        <div-->
      <!--          class="d-flex justify-content-end hide clickme"-->
      <!--          title="Hide banner"-->
      <!--          @click="hideIt"-->
      <!--        >-->
      <!--          <v-icon icon="times-circle" scale="1.5" class="text-white" />-->
      <!--        </div>-->
      <!--        <b-img class="banner" src="/NRD/Banner.png" />-->
      <!--      </nuxt-link>-->
    </div>
    <div v-else class="text-danger text-end clickme" @click="showit">
      Show notice.
    </div>
  </div>
</template>
<script>
import { useMiscStore } from '~/stores/misc'
import PrivacyUpdate from '~/components/PrivacyUpdate.vue'

export default {
  components: { PrivacyUpdate },
  setup() {
    const miscStore = useMiscStore()
    return { miscStore }
  },
  computed: {
    show() {
      return !this.miscStore?.get('hideglobalwarning')
    },
  },
  methods: {
    hideIt(e) {
      e.preventDefault()
      this.miscStore.set({
        key: 'hideglobalwarning',
        value: true,
      })
    },
    showit() {
      this.miscStore.set({
        key: 'hideglobalwarning',
        value: false,
      })
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions.scss';
@import 'bootstrap/scss/_variables.scss';
@import 'bootstrap/scss/mixins/_breakpoints.scss';

.logo {
  width: 75px;
  height: 75px;
  @include media-breakpoint-up(md) {
    width: 125px;
    height: 125px;
  }
}

.grid {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;

  .banner {
    grid-row: 1 / 1;
    grid-column: 1 / 1;
  }

  .hide {
    grid-row: 1 / 1;
    grid-column: 1 / 1;
    align-content: end;
    z-index: 1000;
  }
}

:deep(img) {
  width: 100%;
}
</style>
