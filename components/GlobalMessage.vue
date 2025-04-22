<template>
  <div>
    <PrivacyUpdate />
    <div v-if="oxfordshire">
      <b-card v-if="show">
        <div class="grid">
          <div class="hide">
            <b-button
              variant="link"
              size="xs"
              class="p-0"
              title="Hide banner"
              @click="hideIt"
            >
              Hide
            </b-button>
          </div>
          <div class="banner">
            <b-img
              lazy
              alt="Brand The Bus"
              src="https://images-oxfordbus.passenger-website.com/inline-images/1024x512%20Logos%20only_0.png"
              style="width: 200px"
              class="rounded mr-2"
            />
            <div>
              <p class="header--size2 mb-0">Please vote for us!</p>
              <p>Help Freegle get free ads on the side of Oxfordshire buses!</p>
              <b-button
                variant="primary"
                size="lg"
                href="https://forms.office.com/Pages/ResponsePage.aspx?id=G4CaewiZuk6gbSGK0YIk47DitQdE945DlWwLZDtsWnBUNDNNNURMNUxEWVY3WERZMENFN1NZRUxCUSQlQCN0PWcu"
                target="_blank"
              >
                Click to vote - we're Entry 61
              </b-button>
            </div>
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
    const authStore = useAuthStore()

    return { miscStore, authStore }
  },
  data: function () {
    return {
      thanks: false,
      warningid: 'hideglobalwarning202503072',
    }
  },
  computed: {
    oxfordshire() {
      // Is the current date before 1st April 2025?
      const now = new Date()
      const apr2025 = new Date('2025-04-01')

      if (now >= apr2025) {
        return false
      }

      let ret = false

      const groupids = [
        21555, 21671, 21579, 21694, 21317, 21464, 21324, 21235, 21256,
      ]

      const myGroups = this.authStore.groups

      myGroups.forEach((g) => {
        if (groupids.includes(g.groupid)) {
          ret = true
        }
      })

      return ret
    },
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
    display: flex;
    flex-wrap: wrap;
  }

  .hide {
    grid-row: 1 / 1;
    grid-column: 1 / 1;
    justify-self: end;
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
</style>
