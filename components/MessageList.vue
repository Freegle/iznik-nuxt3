<template>
  <Suspense>
    <div>
      <h2 v-if="group" class="sr-only">Community Information</h2>
      <GroupHeader v-if="group" :group="group" show-join />
      <JobsTopBar />
      <h2 class="sr-only">List of wanteds and offers</h2>
      <client-only>
        <div v-observe-visibility="visibilityChanged" />
      </client-only>
      <div v-if="deDuplicatedMessages?.length">
        <Suspense
          v-for="message in deDuplicatedMessages"
          :key="'messagelist-' + message.id"
        >
          <div :ref="'messagewrapper-' + message.id" class="p-0">
            <OurMessage
              :id="message.id"
              :matchedon="message.matchedon"
              record-view
            />
          </div>

          <template #fallback>
            <div class="invisible">Loading {{ message.id }}...</div>
          </template>
        </Suspense>
      </div>
      <infinite-loading
        v-if="messagesForList?.length"
        :identifier="infiniteId"
        :distance="distance"
        @infinite="loadMore"
      >
        <template #error>&nbsp;</template>
        <template #complete>&nbsp;</template>
        <template #spinner>
          <div class="text-center">
            <b-img lazy src="/loader.gif" alt="Loading" />
          </div>
        </template>
      </infinite-loading>
      <NoticeMessage v-if="!loading && !messagesForList?.length">
        <p>
          Sorry, we didn't find anything. Things come and go quickly, though, so
          you could try later. Or you could:
        </p>
        <div class="d-flex justify-content-start flex-wrap">
          <b-button to="/give" variant="primary" class="topbutton m-1">
            <v-icon icon="gift" />&nbsp;Post an OFFER
          </b-button>
          <b-button to="/find" variant="primary" class="topbutton m-1">
            <v-icon icon="shopping-cart" />&nbsp;Post a WANTED
          </b-button>
        </div>
      </NoticeMessage>
    </div>
    <template #fallback>
      <div class="text-center">
        <b-img lazy src="/loader.gif" alt="Loading" />
      </div>
    </template>
  </Suspense>
</template>
<script>
import dayjs from 'dayjs'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import { throttleFetches } from '../composables/useThrottle'
import { ref } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useMiscStore } from '~/stores/misc'
// const GroupSelect = () => import('./GroupSelect')
const NoticeMessage = () => import('./NoticeMessage')
const OurMessage = () => import('~/components/OurMessage.vue')
const GroupHeader = () => import('~/components/GroupHeader.vue')
const JobsTopBar = () => import('~/components/JobsTopBar')

const MIN_TO_SHOW = 10

// TODO Ensure Message visible case of reply then go back to the list.

export default {
  components: {
    OurMessage,
    GroupHeader,
    NoticeMessage,
    InfiniteLoading,
    JobsTopBar,
  },
  props: {
    messagesForList: {
      type: Array,
      required: true,
    },
    selectedGroup: {
      type: Number,
      required: false,
      default: null,
    },
    selectedType: {
      type: String,
      required: false,
      default: 'All',
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    bump: {
      type: Number,
      required: false,
      default: 0,
    },
    exclude: {
      type: Number,
      required: false,
      default: null,
      busy: true,
    },
    visible: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  async setup(props) {
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()

    const myGroups = []

    if (myGroups && myGroups.length === 1) {
      // TODO We will be showing the single group.
      groupStore.fetch(myGroups[0].id)
    }

    // Get the initial messages to show in a single call.  There will be a delay during which we will see the
    // loader, but it's better to fetch a screenful than have the loader sliding down
    // the screen.  Once we've loaded then the loader will be shown by the infinite scroll, but we will normally
    // not see if because of prefetching.
    const initialIds = props.messagesForList
      ?.slice(0, MIN_TO_SHOW)
      .map((message) => message.id)

    if (initialIds?.length) {
      await messageStore.fetchMultiple(initialIds)
    }

    return {
      infiniteId: ref(props.bump),
      myGroups,
      groupStore,
      messageStore,
      miscStore,
    }
  },
  data() {
    return {
      // Infinite message scroll
      distance: 2000,
      toShow: MIN_TO_SHOW,
      prefetched: 0,
      maxMessageVisible: 0,
      ensuredMessageVisible: false,
      emitted: false,
    }
  },
  computed: {
    group() {
      let ret = null

      if (this.selectedGroup) {
        ret = this.groupStore.get(this.selectedGroup)
      } else if (this.myGroups && this.myGroups.length === 1) {
        ret = this.groupStore.get(this.myGroups[0].id)
      }

      return ret
    },
    filteredIdsToShow() {
      return this.filteredMessagesToShow.map((m) => m.id)
    },
    filteredMessagesToShow() {
      const ret = []

      // We want to filter by:
      // - Possibly a message type
      // - Possibly a group id
      // - Don't show deleted posts.  Remember the map may lag a bit as it's only updated on cron, so we
      //   may be returned some.
      // - Do show completed posts - makes us look good.  But not too many.
      // TODO Check that we filter crosspost duplicates, e.g. for user #41412221.
      for (
        let i = 0;
        i < this.messagesForList?.length && i < this.toShow;
        i++
      ) {
        const m = this.messagesForList[i]

        if (this.wantMessage(m)) {
          // Pass whether the message has been freegled or promised, which is returned in the summary call.
          let addIt = true

          if (m.successful) {
            if (this.myid === m.fromuser) {
              // Always show your own messages.  We have at least one freegler for whom this is emotionally
              // important.
              addIt = true
            } else {
              const daysago = dayjs().diff(dayjs(m.date), 'day')

              if (this.selectedType !== 'All') {
                // Don't show freegled posts if you're already filtering.
                addIt = false
              } else if (daysago > 7) {
                addIt = false
              } else {
                const lastfour = ret.slice(-4)
                let gotSuccessful = false

                lastfour.forEach((m) => {
                  gotSuccessful |= m.successful
                })

                if (gotSuccessful) {
                  addIt = false
                }
              }
            }
          }

          if (addIt) {
            ret.push(m)
          }
        }
      }

      return ret
    },
    deDuplicatedMessages() {
      const ret = []
      const dups = []

      this.filteredMessagesToShow.forEach((m) => {
        // Filter out dups by subject (for crossposting).
        const message = this.messageStore.byId(m.id)

        if (message && m.id !== this.exclude) {
          const key = message.fromuser + '|' + message.subject
          const already = key in dups

          if (!already) {
            ret.push(m)
            dups[key] = true
          }
        }
      })

      return ret
    },
  },
  watch: {
    toShow: {
      async handler(newVal) {
        if (newVal + 5 > this.prefetched) {
          // We want to prefetch some messages so that they are ready in store for if/when we scroll down and want to
          // add them to the DOM.
          const ids = []

          for (
            let i = Math.max(newVal + 1, this.prefetched);
            i < this.messagesForList.length && ids.length < 5;
            i++
          ) {
            if (this.wantMessage(this.messagesForList[i])) {
              ids.push(this.messagesForList[i].id)
            }

            this.prefetched = i
          }

          if (ids.length) {
            await throttleFetches()
            await this.messageStore.fetchMultiple(ids)
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    async loadMore($state) {
      do {
        this.toShow++
      } while (
        this.toShow < this.messagesForList?.length &&
        !this.wantMessage(this.messagesForList[this.toShow])
      )

      if (
        this.toShow <= this.messagesForList?.length &&
        this.wantMessage(this.messagesForList[this.toShow])
      ) {
        // We need another message.
        const m = this.messagesForList[this.toShow - 1]

        // We always want to trigger a fetch to the store, because the store will decide whether a cached message
        // needs refreshing.
        await throttleFetches()
        await this.messageStore.fetch(m.id)

        $state.loaded()
      } else {
        // We're showing all the messages
        $state.complete()
      }
    },
    // Simple throttle.  When we get more than a certain number of outstanding fetches, wait until they are all
    // finished.  This stops the infinite scroll going beserk.
    wantMessage(m) {
      return (
        (this.selectedType === 'All' || this.selectedType === m.type) &&
        (!this.selectedGroup ||
          parseInt(m.groupid) === parseInt(this.selectedGroup))
      )
    },
    visibilityChanged(visible) {
      if (!visible) {
        if (!this.emitted) {
          // Only emit this once, to stop us thrashing.
          this.$emit('update:visible', visible)
          this.emitted = true
        }
      } else {
        this.$emit('update:visible', visible)
      }
    },
  },
}
</script>
