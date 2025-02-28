<template>
  <client-only v-if="me">
    <b-container fluid class="p-0 p-xl-2">
      <h1 class="visually-hidden">Browse items</h1>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft
              ad-unit-path="/22794232631/freegle_home_left"
              ad-div-id="div-gpt-ad-1693235056629-0"
            />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <MicroVolunteering />
          <div>
            <GlobalMessage />
            <ExpectedRepliesWarning
              v-if="me && me.expectedreplies"
              :count="me.expectedreplies"
              :chats="me.expectedchats"
            />
          </div>
          <div v-if="initialBounds">
            <NoticeMessage
              v-if="noMessagesNoLocation"
              variant="warning"
              class="mb-2"
            >
              There are no posts in this area at the moment. You can check back
              later, or use the controls below.
            </NoticeMessage>
            <NoticeMessage v-else-if="messagesOnMapCount === 0" class="mb-2">
              <div v-if="searchTerm">
                We couldn't find any posts matching your search. You can check
                back later, or use the controls below or adjust your filters to
                show posts from further away.
              </div>
              <div v-else>
                We couldn't find any posts to show. You can check back later, or
                use the controls below or adjust your filters to show posts from
                further away.
              </div>
            </NoticeMessage>
            <NoticeMessage
              v-if="browseView === 'nearby' && !isochrones.length"
              variant="warning"
            >
              <p class="font-weight-bold">
                What's your postcode? We'll show you posts nearby.
              </p>
              <PostCode @selected="savePostcode" />
            </NoticeMessage>
            <PostFilters
              v-model:force-show-filters="forceShowFilters"
              v-model:selected-group="selectedGroup"
              v-model:selected-type="selectedType"
              v-model:selected-sort="selectedSort"
              v-model:search="searchTerm"
              class="mt-2 mt-md-0"
            />
            <PostMapAndList
              :key="'map-' + bump"
              v-model:messages-on-map-count="messagesOnMapCount"
              v-model:search="searchTerm"
              v-model:selected-group="selectedGroup"
              v-model:selected-type="selectedType"
              v-model:selected-sort="selectedSort"
              :initial-bounds="initialBounds"
              force-messages
              group-info
              :show-many="false"
              can-hide
            />
          </div>
          <about-me-modal
            v-if="showAboutMeModal"
            :review="reviewAboutMe"
            @hidden="showAboutMeModal = false"
          />
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <div class="d-flex justify-content-end">
            <VisibleWhen
              :not="['xs', 'sm', 'md', 'lg']"
              class="position-fixed"
              style="right: 5px"
            >
              <ExternalDa
                ad-unit-path="/22794232631/freegle_home"
                max-height="600px"
                max-width="300px"
                div-id="div-gpt-ad-1691925450433-0"
                class="mt-2"
                :jobs="false"
              />
            </VisibleWhen>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script>
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import Wkt from 'wicket'
import { useMessageStore } from '../../stores/message'
import NoticeMessage from '../../components/NoticeMessage'
import { loadLeaflet } from '~/composables/useMap'
import { buildHead } from '~/composables/useBuildHead'
import VisibleWhen from '~/components/VisibleWhen'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import { useIsochroneStore } from '~/stores/isochrone'
import PostFilters from '~/components/PostFilters'

const MicroVolunteering = defineAsyncComponent(() =>
  import('~/components/MicroVolunteering.vue')
)

export default {
  components: {
    NoticeMessage,
    PostFilters,
    PostMapAndList: defineAsyncComponent(() =>
      import('~/components/PostMapAndList')
    ),
    GlobalMessage: defineAsyncComponent(() =>
      import('~/components/GlobalMessage')
    ),
    AboutMeModal: defineAsyncComponent(() =>
      import('~/components/AboutMeModal')
    ),
    ExpectedRepliesWarning: defineAsyncComponent(() =>
      import('~/components/ExpectedRepliesWarning')
    ),
    VisibleWhen,
    MicroVolunteering,
  },
  async setup() {
    definePageMeta({
      layout: 'login',
      alias: ['/communities'],
    })
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
    const isochroneStore = useIsochroneStore()
    const messageStore = useMessageStore()

    const searchTerm = ref(route.params.term)

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

    const martop1 = ref('285px')

    return {
      route,
      router,
      miscStore,
      authStore,
      groupStore,
      isochroneStore,
      messageStore,
      searchTerm,
      martop1,
    }
  },
  data() {
    return {
      initialBounds: null,
      bump: 1,
      showAboutMeModal: false,
      reviewAboutMe: false,
      messagesOnMapCount: null,
      selectedGroup: 0,
      selectedType: 'All',
      selectedSort: 'Unseen',
      forceShowFilters: false,
      lastCountUpdate: 0,
      updatingCount: false,
    }
  },
  computed: {
    browseView() {
      return this?.me?.settings?.browseView
        ? this.me.settings.browseView
        : 'nearby'
    },
    noMessagesNoLocation() {
      return this.messagesOnMapCount === 0 && !this.me?.settings?.mylocation
    },
    isochrones() {
      return this.isochroneStore?.list
    },
  },
  watch: {
    me: {
      immediate: true,
      async handler(newVal, oldVal) {
        if (newVal && !oldVal && process.client) {
          await loadLeaflet()
          this.calculateInitialMapBounds()
          this.bump++
        }
      },
    },
    noMessagesNoLocation(newVal) {
      if (newVal) {
        // Make sure the filters are showing.
        this.forceShowFilters = true
      }
    },
    // When the isochrones or filters change, just re-render the whole map and list.  This is a bit heavy handed, but
    // the code to handle the various changes is complex and not worth writting - most people will just take the
    // default and scroll down.
    searchTerm(newVal) {
      this.incBump()
    },
    async selectedGroup(newVal) {
      if (newVal > 0) {
        // We want to show the group's map.
        const g = this.myGroup(newVal)

        if (g?.bbox) {
          await loadLeaflet()
          const wkt = new Wkt.Wkt()
          wkt.read(g.bbox)
          const obj = wkt.toObject()

          if (obj?.getBounds) {
            const bounds = obj.getBounds()
            const swlat = bounds.getSouthWest().lat
            const swlng = bounds.getSouthWest().lng
            const nelat = bounds.getNorthEast().lat
            const nelng = bounds.getNorthEast().lng

            this.initialBounds = [
              [swlat, swlng],
              [nelat, nelng],
            ]
          }
        }
      }

      this.incBump()
    },
    selectedType(newVal) {
      this.incBump()
    },
    browseView(newVal) {
      this.calculateInitialMapBounds()
      this.incBump()
    },
    async isochrones(newVal) {
      this.initialBounds = this.isochroneStore.bounds
      await this.isochroneStore.fetchMessages(true)
      this.incBump()
    },
  },
  async mounted() {
    if (this.me) {
      window.addEventListener('scroll', this.handleScroll)
      const lastask = this.miscStore?.get('lastaboutmeask')
      const now = new Date().getTime()

      if (!lastask || now - lastask > 90 * 24 * 60 * 60 * 1000) {
        // Not asked too recently.
        await this.fetchMe(true)

        if (this.me) {
          if (!this.me.aboutme || !this.me.aboutme.text) {
            // We have not yet provided one.
            const daysago = dayjs().diff(dayjs(this.me.added), 'days')

            if (daysago > 7) {
              // Nudge to ask people to to introduce themselves.
              this.showAboutMeModal = true
            }
          } else {
            const monthsago = dayjs().diff(
              dayjs(this.me.aboutme.timestamp),
              'months'
            )

            if (monthsago >= 6) {
              // Old.  Ask them to review it.
              this.showAboutMeModal = true
              this.reviewAboutMe = true
            }
          }
        }
      }

      if (this.showAboutMeModal) {
        this.miscStore.set({
          key: 'lastaboutmeask',
          value: now,
        })
      }
    }
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    async calculateInitialMapBounds() {
      if (process.client) {
        if (this.browseView === 'nearby') {
          if (this.me) {
            // The initial bounds for the map are determined from the isochrones if possible.
            const promises = []
            promises.push(this.isochroneStore.fetch())

            // By default we'll be showing the isochrone view in PostMap, so start the fetch of the messages now.  That
            // way we can display the list rapidly.  Fetching this and the isochrones in parallel reduces latency.
            promises.push(this.isochroneStore.fetchMessages(true))

            try {
              await Promise.all(promises)
              this.initialBounds = this.isochroneStore.bounds
            } catch (e) {
              // If this fails revert to a default view.
            }
          }
        } else {
          this.initialBounds = this.isochroneStore.bounds
        }

        if (!this.initialBounds) {
          // Either we have no isochrones, or we're showing our groups.  Use the bounding box of the group that
          // our own location is within.
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
                try {
                  await loadLeaflet()
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
                } catch (e) {
                  console.error(
                    'Failed to parse group bounding box',
                    e?.message,
                    g.bbox
                  )
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
    async savePostcode(pc) {
      const settings = this.me.settings

      if (!settings?.mylocation || settings?.mylocation.id !== pc.id) {
        settings.mylocation = pc
        await this.authStore.saveAndGet({
          settings,
        })

        // Now get an isochrone at this location.
        await this.isochroneStore.fetch()
      }
    },
    incBump() {
      this.bump++
    },
    async handleScroll(event) {
      // If we are scrolling down the browse window then we want to update our count, but only every few seconds.
      if (
        !this.updatingCount &&
        this.me &&
        this.lastCountUpdate < new Date().getTime() - 5000
      ) {
        this.lastCountUpdate = new Date().getTime()
        this.updatingCount = true
        await this.messageStore.fetchCount(this.me.settings?.browseView, false)
        this.updatingCount = false
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
</style>
