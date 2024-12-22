<template>
  <div v-if="!me?.settings?.pledge2025">
    <PrivacyUpdate />
    <div v-if="new Date().getTime() < new Date('2025-01-03')">
      <b-card v-if="show" body-class="d-flex justify-content-around">
        <b-img
          src="/logos/Christmas.gif"
          alt="Christmas GIF"
          class="christmas rounded"
        />
        <div class="ml-2 font-weight-bold">
          <div v-if="thanks">
            <p>
              Thanks! You'll be making the world better, one act of kindness at
              a time.
            </p>
          </div>
          <div v-else>
            <p>
              Merry Whatevermas to you and yours, from all the volunteers at
              Freegle!
            </p>
            <p>
              And if you're making resolutions this New Year, why not pledge to
              freegle one extra thing a month throughout the year? We'll track
              your freegles and let you know how you do!
            </p>
            <b-button size="lg" variant="primary" @click="pledge">
              I'll sign the Freegle pledge!
            </b-button>
          </div>
        </div>
      </b-card>
      <div v-else class="text-danger text-end clickme" @click="showit">
        Show notice.
      </div>
    </div>
  </div>
</template>
<script>
import { useMiscStore } from '~/stores/misc'
import PrivacyUpdate from '~/components/PrivacyUpdate.vue'
import { useAuthStore } from '~/stores/auth'

export default {
  components: { PrivacyUpdate },
  setup() {
    const miscStore = useMiscStore()
    return { miscStore }
  },
  data: function () {
    return {
      thanks: false,
    }
  },
  computed: {
    show() {
      return !this.miscStore?.get('hideglobalwarning')
    },
    breakpoint() {
      const store = useMiscStore()
      return store.breakpoint
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
    async pledge() {
      const authStore = useAuthStore()
      const settings = authStore.user.settings
      settings.pledge2025 = true
      await authStore.saveAndGet({
        settings,
      })

      this.thanks = true
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

:deep(.christmas) {
  max-width: 100px;

  @include media-breakpoint-up(md) {
    max-width: 200px;
  }
}
</style>
