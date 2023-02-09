<template>
  <client-only>
    <b-container fluid class="p-0 p-xl-2">
      <h1 class="sr-only">Browse items</h1>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <!--          TODO Microvol-->
          <!--          <MicroVolunteering />-->
          <div>
            <GlobalWarning />
            <ExpectedRepliesWarning
              v-if="me && me.expectedreplies"
              :count="me.expectedreplies"
              :chats="me.expectedchats"
            />
            <div class="bg-white d-block d-xl-none">
              <div class="d-flex justify-content-between flex-wrap">
                <b-button to="/give" variant="primary" class="topbutton m-1">
                  <v-icon icon="gift" />&nbsp;Give
                </b-button>
                <b-button to="/find" variant="primary" class="topbutton m-1">
                  <v-icon icon="shopping-cart" />&nbsp;Ask
                </b-button>
              </div>
            </div>
          </div>
          <div v-if="initialBounds">
            <div v-if="browseView === 'mygroups'" class="bg-white mt-2">
              <div class="small d-flex justify-content-end">
                <div>
                  <!-- eslint-disable-next-line-->
                  Show posts from <b-button variant="link" class="mb-1 p-0" size="sm" @click="showPostsFromNearby">nearby instead</b-button>.
                </div>
              </div>
              <AdaptiveMap
                :key="'map-' + bump"
                :initial-bounds="initialBounds"
                :initial-search="searchTerm"
                class="mt-2"
                force-messages
                group-info
                jobs
                :show-many="false"
                can-hide
                track
              />
            </div>
            <div v-else>
              <div class="mb-1 border p-2 bg-white">
                <NoticeMessage
                  v-if="!messagesOnMapCount && !me?.settings.mylocation"
                  variant="warning"
                >
                  There are no posts in this area at the moment. You can check
                  back later, or use the controls below:
                  <ul>
                    <li>
                      The <em>Travel time</em> slider lets you see posts from
                      further away.
                    </li>
                    <li>
                      <!-- eslint-disable-next-line-->
                      You can change your location in <nuxt-link to="/settings">Settings</nuxt-link>.
                    </li>
                    <li>
                      The <em>Add location</em> link lets you show posts from
                      another postcode.
                    </li>
                  </ul>
                </NoticeMessage>
                <NoticeMessage v-if="!isochrones.length" variant="warning">
                  <p class="font-weight-bold">
                    What's your postcode? We'll show you posts nearby.
                  </p>
                  <PostCode @selected="savePostcode" />
                </NoticeMessage>
                <IsoChrones />
                <div class="small mt-1">
                  <!-- eslint-disable-next-line-->
                  Show posts from <b-button variant="link" size="sm" class="mb-1 p-0" @click="showPostsFromMyGroups">all my communities</b-button> instead.
                </div>
              </div>
              <IsochronePostMapAndList
                :key="'map-' + bump"
                v-model:messagesOnMapCount="messagesOnMapCount"
                :initial-bounds="initialBounds"
                :initial-search="searchTerm"
                class="mt-2"
                force-messages
                group-info
                jobs
                :show-many="false"
                can-hide
              />
            </div>
          </div>
          <AboutMeModal
            v-if="showAboutMe"
            ref="aboutMeModal"
            :review="reviewAboutMe"
          />
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1"> </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script>
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import { buildHead } from '../../composables/useBuildHead'
import VisibleWhen from '~/components/VisibleWhen'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import { useIsochroneStore } from '~/stores/isochrone'

definePageMeta({
  layout: 'login',
  alias: ['/communities'],
})

// const MicroVolunteering = () => import('~/components/MicroVolunteering.vue')

export default {
  components: {
    AdaptiveMap: defineAsyncComponent(() => import('~/components/AdaptiveMap')),
    IsochronePostMapAndList: defineAsyncComponent(() =>
      import('~/components/IsochronePostMapAndList')
    ),
    GlobalWarning: defineAsyncComponent(() =>
      import('~/components/GlobalWarning')
    ),
    AboutMeModal: defineAsyncComponent(() =>
      import('~/components/AboutMeModal')
    ),
    ExpectedRepliesWarning: defineAsyncComponent(() =>
      import('~/components/ExpectedRepliesWarning')
    ),
    VisibleWhen,
    // MicroVolunteering,
  },
  async setup() {
    const route = useRoute()
    const runtimeConfig = useRuntimeConfig()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Browse',
        'See OFFERs and WANTEDs',
        null,
        {
          class: 'overflow-y-scroll',
        }
      )
    )

    const router = useRouter()
    const miscStore = useMiscStore()
    const authStore = useAuthStore()
    const groupStore = useGroupStore()

    const searchTerm = route.params.term

    // We want this to be our next home page.
    const existingHomepage = miscStore.get('lasthomepage')

    if (existingHomepage !== 'mygroups') {
      miscStore.set({
        key: 'lasthomepage',
        value: 'mygroups',
      })
    }

    // Also get all the groups.  This allows us to suggest other groups to join from within the map.
    // Doing this now slows down the load, but reduces flicker.
    await groupStore.fetch()

    return {
      route,
      router,
      miscStore,
      authStore,
      groupStore,
      isochroneStore,
      searchTerm,
    }
  },
  data() {
    return {
      initialBounds: null,
      bump: 1,
      showAboutMe: false,
      reviewAboutMe: false,
      messagesOnMapCount: 0,
    }
  },
  computed: {
    browseView() {
      return this?.me?.settings?.browseView
        ? this.me.settings.browseView
        : 'nearby'
    },
    isochrones() {
      const isochroneStore = useIsochroneStore()
      return isochroneStore.list
    },
  },
  watch: {
    me: {
      immediate: true,
      async handler(newVal, oldVal) {
        if (newVal && !oldVal && process.client) {
          // No point loading leafleft (which is large) until we need it.
          if (!window.L) {
            const wkt = await import('wicket')
            window.L = await import('leaflet/dist/leaflet-src.esm')
            await import('wicket/wicket-leaflet')
            const isochroneStore = useIsochroneStore()
            isochroneStore.initLeaflet(wkt)
          }

          this.calculateInitialMapBounds(!this.searchTerm)
          this.bump++
        }
      },
    },
  },
  async mounted() {
    if (this.me) {
      const lastask = this.miscStore.get('lastaboutmeask')
      const now = new Date().getTime()

      if (!lastask || now - lastask > 90 * 24 * 60 * 60 * 1000) {
        // Not asked too recently.
        await this.fetchMe(true)

        if (this.me && (!this.me.aboutme || !this.me.aboutme.text)) {
          // We have not yet provided one.
          const daysago = dayjs().diff(dayjs(this.me.added), 'days')

          if (daysago > 7) {
            // Nudge to ask people to to introduce themselves.
            this.showAboutMe = true
          }
        } else {
          const monthsago = dayjs().diff(
            dayjs(this.me.aboutme.timestamp),
            'months'
          )

          if (monthsago >= 6) {
            // Old.  Ask them to review it.
            this.showAboutMe = true
            this.reviewAboutMe = true
          }
        }
      }

      if (this.showAboutMe) {
        this.waitForRef('aboutMeModal', () => {
          this.$refs.aboutMeModal.show()
        })

        this.miscStore.set({
          key: 'lastaboutmeask',
          value: now,
        })
      }
    }
  },
  methods: {
    async calculateInitialMapBounds(fetchIsochrones) {
      if (process.client) {
        // The initial bounds for the map are determined from the isochrones if possible.  We might have them cached
        // in store.
         = useIsochroneStore()
        isochroneStore.fetchMessages(true)

        const promises = [        promises.push(isochroneStore.fetch())

        if (fetchIsochrones) {
          // By default we'll be showing the isochrone view in PostMap, so start the fetch of the messages now.  That
          // way we can display the list rapidly.  Fetching this and the isochrones in parallel reduces latency.
          promises.push(isochroneStore.fetchMessages(true))
        }

        await Promise.all(promises)

        this.initialBounds = isochroneStore.bounds

        if (!this.initialBounds) {
          // We don't have any isochrones yet. Use the bounding box of the group that our own
          // location is within.
          let mylat = null
          let mylng = null

          let swlat = null
          let swlng = null
          let nelat = null
          let nelng = null

          if (this.me && (this.me.lat || this.me.lng)) {
            mylat = this.me.lat
            mylng = this.me.lng

            this.myGroups.forEach(async (g) => {
              if (g.bbox) {
                const Wkt = await import('wicket')
                window.L = await import('leaflet/dist/leaflet-src.esm')
                await import('wicket/wicket-leaflet')

                const wkt = new Wkt.Wkt()
                wkt.read(g.bbox)
                const obj = wkt.toObject()

                if (obj?.getBounds) {
                  const thisbounds = obj.getBounds()
                  const thissw = thisbounds.getSouthWest()
                  const thisne = thisbounds.getNorthEast()

                  if (
                    mylat >= thissw.lat &&
                    mylat <= thisne.lat &&
                    mylng >= thissw.lng &&
                    mylng <= thisne.lng
                  ) {
                    swlat = (thissw.lat + thisne.lat) / 2
                    swlng = thissw.lng
                    nelat = (thissw.lat + thisne.lat) / 2
                    nelng = thisne.lng
                  }
                }
              }
            })
          }

          let bounds = null

          if (
            swlat !== null &&
            swlng !== null &&
            nelat !== null &&
            nelng !== null
          ) {
            bounds = [
              [swlat, swlng],
              [nelat, nelng],
            ]
          } else if (this.me && mylat !== null && mylng !== null) {
            // We're not a member of any groups, but at least we know where we are.  Centre there, and then let
            // the map zoom to somewhere sensible.
            bounds = [
              [mylat - 0.01, mylng - 0.01],
              [mylat + 0.01, mylng + 0.01],
            ]
          } else {
            // We aren't a member of any groups and we don't know where we are.  This can happen, but it's rare.
            // Send them to the explore page to pick somewhere.
            this.router.push('/explore')
          }

          if (bounds) {
            this.initialBounds = bounds
          }
        }
      }
    },
    async showPostsFromNearby() {
      const settings = this.me.settings
      settings.browseView = 'nearby'

      await this.authStore.saveAndGet({
        settings,
      })
    },
    async showPostsFromMyGroups() {
      const settings = this.me.settings
      settings.browseView = 'mygroups'

      await this.authStore.saveAndGet({
        settings,
      })
    },
    async savePostcode(pc) {
      const settings = this.me.settings

      if (!settings.mylocation || settings.mylocation.id !== pc.id) {
        settings.mylocation = pc
        await this.authStore.saveAndGet({
          settings,
        })

        // Now get an isochrone at this location.
        const isochroneStore = useIsochroneStore()
        await isochroneStore.fetch()
      }
    },
  },
}
</script>
<style scoped lang="scss">
.selection__wrapper {
  background-color: $color-blue--x-light;
  border: 1px solid $color-blue-x-light2;
  border-radius: 3px;
}

.typeSelect {
  max-width: 33%;
}

.topbutton {
  width: 40%;
}
</style>
