<template>
  <b-container fluid>
    <h1 class="sr-only">Browse items</h1>
    <client-only>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen :at="['lg', 'xl']">
            <!--            TODO-->
            <!--            <SidebarLeft-->
            <!--              v-if="showRest"-->
            <!--              :show-community-events="true"-->
            <!--              :show-bot-left="true"-->
            <!--            />-->
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <!--          TODO Microvol-->
          <!--          <MicroVolunteering />-->
          <div v-if="showRest">
            <GlobalWarning />
            <!--            TODO Chats-->
            <!--            <ExpectedRepliesWarning-->
            <!--              v-if="me && me.expectedreplies"-->
            <!--              :count="me.expectedreplies"-->
            <!--              :chats="me.expectedchats"-->
            <!--            />-->
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
            <div v-if="browseView === 'mygroups'" class="bg-white">
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
          <!--          TODO. Overlap with MainHeader?-->
          <!--          <AboutMeModal-->
          <!--            v-if="showAboutMe"-->
          <!--            ref="aboutMeModal"-->
          <!--            :review="reviewAboutMe"-->
          <!--          />-->
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <VisibleWhen :at="['lg', 'xl']">
            <!--            TODO-->
            <!--            <sidebar-right-->
            <!--              v-if="showRest"-->
            <!--              show-volunteer-opportunities-->
            <!--              show-job-opportunities-->
            <!--            />-->
          </VisibleWhen>
        </b-col>
      </b-row>
    </client-only>
  </b-container>
</template>
<script>
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import VisibleWhen from '~/components/VisibleWhen'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import { useIsochroneStore } from '~/stores/isochrone'
// import buildHead from '@/mixins/buildHead.js'

const AdaptiveMap = () => import('~/components/AdaptiveMap')
const IsochronePostMapAndList = () =>
  import('~/components/IsochronePostMapAndList')
const GlobalWarning = () => import('~/components/GlobalWarning')
// const SidebarLeft = () => import('~/components/SidebarLeft')
// const SidebarRight = () => import('~/components/SidebarRight')
// const ExpectedRepliesWarning = () =>
//   import('~/components/ExpectedRepliesWarning')
// const MicroVolunteering = () => import('~/components/MicroVolunteering.vue')

export default {
  components: {
    AdaptiveMap,
    VisibleWhen,
    // MicroVolunteering,
    IsochronePostMapAndList,
    GlobalWarning,
    // SidebarLeft,
    // SidebarRight,
    // ExpectedRepliesWarning,
    // AboutMeModal,
  },
  // head() {
  //   return this.buildHead('Browse', 'See OFFERs and WANTEDs')
  // },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const miscStore = useMiscStore()
    const authStore = useAuthStore()
    const groupStore = useGroupStore()
    const isochroneStore = useIsochroneStore()

    let searchTerm = route.params.term
    // TODO Optional parameters not working - see https://github.com/nuxt/framework/issues/4634
    // Rename back to [[term]].vue.
    searchTerm = ''

    // We want this to be our next home page.
    const existingHomepage = miscStore.get('lasthomepage')

    if (existingHomepage !== 'mygroups') {
      miscStore.set({
        key: 'lasthomepage',
        value: 'mygroups',
      })
    }

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
      showRest: false,
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
      return this.isochroneStore.list
    },
  },
  watch: {
    me: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal && !oldVal) {
          this.calculateInitialMapBounds()
          this.bump++
        }
      },
    },
  },
  mounted() {
    // Also get all the groups.  This allows us to suggest other groups to join from within the map.  No rush
    // though, so delay it.
    setTimeout(async () => {
      this.groupStore.fetch()
      this.showRest = true

      if (this.me) {
        const lastask = this.miscStore.get('lastaboutmeask')
        const now = new Date().getTime()

        if (!lastask || now - lastask > 90 * 24 * 60 * 60 * 1000) {
          // Not asked too recently.
          await this.fetchMe()

          if (!this.me.aboutme || !this.me.aboutme.text) {
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
    }, 5000)
  },
  methods: {
    async calculateInitialMapBounds() {
      // The initial bounds for the map are determined from the isochrones if possible.  We might have them cached
      // in store.
      await this.isochroneStore.fetch()
      this.initialBounds = this.isochroneStore.bounds

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
        await this.isochroneStore.fetch()
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
