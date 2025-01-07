<template>
  <div v-if="me && !me?.settings?.pledge2025">
    <PrivacyUpdate />
    <div v-if="new Date().getTime() < new Date('2025-01-03')">
      <b-card v-if="show">
        <div class="christmaslayout">
          <b-button
            variant="link"
            size="xs"
            class="close p-0"
            title="Hide banner"
            @click="hideIt"
          >
            Hide
          </b-button>
          <b-img
            src="/logos/Christmas.gif"
            alt="Christmas GIF"
            class="christmas rounded logo"
          />
          <template v-if="thanks">
            <p class="thanks">
              Thanks! You'll be making the world better, one act of kindness at
              a time.
            </p>
          </template>
          <template v-else>
            <p class="merry">
              Merry Whatevermas to you and yours, from all the volunteers at
              Freegle!
            </p>
            <p class="resolution">
              And if you're making resolutions this New Year, why not pledge to
              freegle one extra thing a month throughout the year? We'll track
              your freegles and let you know how you do!
            </p>
            <div class="pledge">
              <b-button size="lg" variant="primary" @click="pledge">
                I'll sign the Freegle pledge!
              </b-button>
            </div>
          </template>
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
      warningid: 'hideglobalwarning20241222',
    }
  },
  computed: {
    show() {
      return !this.miscStore?.get(this.warningid)
    },
    breakpoint() {
      const store = useMiscStore()
      return store.breakpoint
    },
  },
  methods: {
    hideIt(e) {
      console.log('Hide', this.warningid)
      e.preventDefault()
      this.miscStore.set({
        key: this.warningid,
        value: true,
      })
    },
    showit() {
      this.miscStore.set({
        key: this.warningid,
        value: false,
      })
    },
    async pledge() {
      const authStore = useAuthStore()

      if (authStore.user) {
        const settings = authStore.user.settings
        settings.pledge2025 = true
        await authStore.saveAndGet({
          settings,
        })

        this.thanks = true
      }
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
  max-height: 100px;

  @include media-breakpoint-up(md) {
    max-width: 200px;
    max-height: 200px;
  }
}

.christmaslayout {
  display: grid;
  grid-template-rows: min-content min-content min-content;
  grid-template-columns: min-content 1fr;
  grid-column-gap: 1rem;
  font-weight: bold;

  .close {
    grid-row: 1 / 2;
    grid-column: 1 / 3;
    justify-self: end;
    color: black;
  }

  .logo,
  .thanks {
    grid-row: 1 / 2;
    grid-column: 1 / 2;

    @include media-breakpoint-up(md) {
      grid-row: 1 / 3;
      grid-column: 1 / 2;
    }
  }

  .merry {
    grid-row: 1 / 2;
    grid-column: 2 / 3;
  }

  .resolution {
    grid-row: 2 / 3;
    grid-column: 1 / 3;

    @include media-breakpoint-up(md) {
      grid-row: 2 / 3;
      grid-column: 2 / 3;
    }
  }

  .pledge {
    grid-row: 3 / 4;
    grid-column: 1 / 3;

    @include media-breakpoint-up(md) {
      grid-row: 3 / 4;
      grid-column: 2 / 3;
    }
  }
}
</style>
