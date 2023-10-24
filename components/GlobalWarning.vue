<template>
  <div v-if="false">
    <NoticeMessage v-if="show" variant="info">
      <div class="d-flex justify-content-between">
        <b-img
          src="/national_reuse_day_2023_Logo_round_500x500px.png"
          class="mr-2 float-start logo"
        />
        <div>
          <p>
            Are you ready to shine a light on reuse for
            <b>#NationalReuseDay2023</b> on Friday 20 October? A day to
            celebrate all things #Reuse, organised by Freegle, the reuse
            experts.
          </p>
        </div>
      </div>
      <div class="d-flex justify-content-between flex-wrap">
        <ExternalLink
          href="https://mailchi.mp/896a4360914b/freegle-bites-april-17353736"
        >
          <b-button variant="white" class="mt-2">
            Find out how to get involved
          </b-button>
        </ExternalLink>
        <b-button variant="link" @click="hideit"> Hide this </b-button>
      </div>
    </NoticeMessage>
    <div v-else class="text-danger text-end clickme" @click="showit">
      Show notice.
    </div>
  </div>
</template>
<script>
import NoticeMessage from './NoticeMessage'
import ExternalLink from './ExternalLink'
import { useMiscStore } from '~/stores/misc'

export default {
  components: { ExternalLink, NoticeMessage },
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
    hideit() {
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
</style>
