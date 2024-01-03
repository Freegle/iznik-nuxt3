<template>
  <div>
    <h2 v-if="group" class="visually-hidden">Community Information</h2>
    <GroupHeader
      v-if="group"
      :group="group"
      show-join
      :show-give-find="showGiveFind"
    />
    <JobsTopBar v-if="jobs" class="d-none d-md-block" />
    <h2 class="visually-hidden">List of wanteds and offers</h2>
    <div id="visobserver" v-observe-visibility="visibilityChanged" />
    <div v-if="deDuplicatedMessages?.length" id="messageList">
      <UpToDate v-if="!loading && !deDuplicatedMessages[0].unseen" />
      <div
        :id="'messagewrapper-' + deDuplicatedMessages[0].id"
        :ref="'messagewrapper-' + deDuplicatedMessages[0].id"
        class="p-0"
      >
        <OurMessage
          :id="deDuplicatedMessages[0].id"
          :matchedon="deDuplicatedMessages[0].matchedon"
          record-view
        />
      </div>
      <VisibleWhen
        v-if="deDuplicatedMessages.length"
        :not="['xs', 'sm', 'md', 'lg']"
      >
        <ExternalDa
          ad-unit-path="/22794232631/freegle_feed_desktop"
          :dimensions="[728, 90]"
          div-id="div-gpt-ad-1692867153277-0"
          class="mt-2"
        />
      </VisibleWhen>
      <VisibleWhen
        v-if="deDuplicatedMessages.length"
        :at="['xs', 'sm', 'md', 'lg']"
      >
        <ExternalDa
          ad-unit-path="/22794232631/freegle_feed_app"
          :dimensions="[300, 250]"
          div-id="div-gpt-ad-1692867324381-0"
          class="mt-3"
        />
      </VisibleWhen>
      <div
        v-for="(message, ix) in deDuplicatedMessages.slice(1)"
        :key="'messagelist-' + message.id"
      >
        <UpToDate
          v-if="!loading && !message.unseen && deDuplicatedMessages[ix].unseen"
        />
        <div
          :id="'messagewrapper-' + message.id"
          :ref="'messagewrapper-' + message.id"
          class="p-0"
        >
          <VisibleWhen :at="['xs', 'sm', 'md', 'lg']">
            <OurMessage
              :id="message.id"
              :matchedon="message.matchedon"
              record-view
            />
          </VisibleWhen>
          <VisibleWhen :not="['xs', 'sm', 'md', 'lg']">
            <OurMessage
              :id="message.id"
              :matchedon="message.matchedon"
              record-view
              ad-unit-path="/22794232631/freegle_product"
              ad-id="div-gpt-ad-1691925699378-0"
            />
          </VisibleWhen>
        </div>
      </div>
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
          <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
        </div>
      </template>
    </infinite-loading>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { mapState } from 'pinia'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import { throttleFetches } from '../composables/useThrottle'
import { useIsochroneStore } from '../stores/isochrone'
import UpToDate from './UpToDate'
import { ref } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useMiscStore } from '~/stores/misc'
const OurMessage = () => import('~/components/OurMessage.vue')
const GroupHeader = () => import('~/components/GroupHeader.vue')
const JobsTopBar = () => import('~/components/JobsTopBar')

const MIN_TO_SHOW = 10

export default {
  components: {
    UpToDate,
    OurMessage,
    GroupHeader,
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
    jobs: {
      type: Boolean,
      required: false,
      default: true,
    },
    showGiveFind: {
      type: Boolean,
      required: false,
      default: false,
    },
    none: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  async setup(props) {
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()

    const myGroups = []

    // Get the initial messages to show in a single call.  There will be a delay during which we will see the
    // loader, but it's better to fetch a screenful than have the loader sliding down
    // the screen.  Once we've loaded then the loader will be shown by the infinite scroll, but we will normally
    // not see it because of prefetching.
    const initialIds = props.messagesForList
      ?.slice(0, MIN_TO_SHOW)
      .map((message) => message.id)

    if (initialIds?.length) {
      await messageStore.fetchMultiple(initialIds)
    }

    const toShow = ref(MIN_TO_SHOW)

    return {
      infiniteId: ref(props.bump),
      myGroups,
      groupStore,
      messageStore,
      miscStore,
      toShow,
    }
  },
  data() {
    return {
      // Infinite message scroll
      distance: 2000,
      prefetched: 0,
      emitted: false,
    }
  },
  computed: {
    ...mapState(useIsochroneStore, { isochroneBounds: 'bounds' }),
    group() {
      let ret = null

      if (this.selectedGroup) {
        ret = this.groupStore?.get(this.selectedGroup)
      } else if (this.myGroups && this.myGroups.length === 1) {
        ret = this.groupStore?.get(this.myGroups[0].id)
      }

      return ret
    },
    filteredIdsToShow() {
      return this.filteredMessagesToShow.map((m) => m.id)
    },
    reduceSuccessful() {
      // Ensure no more than one successful message in every four.  Makes us look good to show some.
      const ret = []

      this.messagesForList.forEach((m) => {
        if (m.successful) {
          // Don't want the first one to be shown as freegled.
          if (ret.length) {
            const lastfour = ret.slice(-4)
            let gotSuccessful = false

            lastfour.forEach((m) => {
              gotSuccessful |= m.successful
            })

            if (!gotSuccessful) {
              ret.push(m)
            }
          }
        } else {
          ret.push(m)
        }
      })

      return ret
    },
    filteredMessagesToShow() {
      const ret = []

      // We want to filter by:
      // - Possibly a message type
      // - Possibly a group id
      // - Don't show deleted posts.  Remember the map may lag a bit as it's only updated on cron, so we
      //   may be returned some.
      for (
        let i = 0;
        i < this.reduceSuccessful?.length && i < this.toShow;
        i++
      ) {
        const m = this.reduceSuccessful[i]

        if (this.wantMessage(m)) {
          // Pass whether the message has been freegled or promised, which is returned in the summary call.
          let addIt = true

          if (m.successful) {
            if (this.myid === m.fromuser) {
              // Always show your own messages.  We have at least one freegler for whom this is emotionally
              // important.
              addIt = true
            } else {
              const daysago = dayjs().diff(dayjs(m.arrival), 'day')

              if (this.selectedType !== 'All') {
                // Don't show freegled posts if you're already filtering.
                addIt = false
              } else if (daysago > 7) {
                addIt = false
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
    filteredMessagesInStore() {
      const ret = {}

      this.filteredMessagesToShow?.forEach((m) => {
        ret[m.id] = this.messageStore?.byId(m.id)
      })

      return ret
    },
    deDuplicatedMessages() {
      const ret = []
      const dups = []

      this.filteredMessagesToShow.forEach((m) => {
        // Filter out dups by subject (for crossposting).
        const message = this.filteredMessagesInStore[m.id]

        if (!message) {
          // We haven't yet fetched it, so we don't yet know if it's a dup.  We return it, which will fetch it, and
          // then we'll come back through here.
          ret.push(m)
        } else if (m.id !== this.exclude) {
          // We don't want our duplicate-detection to be confused by different keywords on different groups, so strip
          // out the keyword and put in the type.
          let key = message.fromuser + '|' + message.subject
          const p = message.subject.indexOf(':')

          if (p !== -1) {
            key =
              message.fromuser +
              '|' +
              message.type +
              message.subject.substring(p)
          }

          const already = key in dups

          if (!already) {
            ret.push(m)
            dups[key] = true
          }
        }
      })

      return ret
    },
    noneFound() {
      return !this.loading && !this.deDuplicatedMessages?.length
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
            i < this.reduceSuccessful.length && ids.length < 5;
            i++
          ) {
            if (this.wantMessage(this.reduceSuccessful[i])) {
              ids.push(this.reduceSuccessful[i].id)
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
    noneFound: {
      handler(newVal, oldVal) {
        this.$emit('update:none', newVal)
      },
      immediate: true,
    },
  },
  methods: {
    async loadMore($state) {
      do {
        this.toShow++
      } while (
        this.toShow < this.reduceSuccessful?.length &&
        !this.wantMessage(this.reduceSuccessful[this.toShow])
      )

      if (
        this.toShow <= this.reduceSuccessful?.length &&
        this.wantMessage(this.reduceSuccessful[this.toShow])
      ) {
        // We need another message.
        const m = this.reduceSuccessful[this.toShow - 1]

        // We always want to trigger a fetch to the store, because the store will decide whether a cached message
        // needs refreshing.
        await throttleFetches()

        await this.messageStore.fetch(m.id)

        $state.loaded()
      } else {
        // We're showing all the messages
        $state.complete()

        // Kick off a fetch of the unread count - normally done when we scroll down but we might skip if we've done
        // too frequently.
        this.messageStore.fetchCount(this.me.settings?.browseView, false)
      }
    },
    wantMessage(m) {
      return (
        (this.selectedType === 'All' || this.selectedType === m?.type) &&
        (!this.selectedGroup ||
          parseInt(m?.groupid) === parseInt(this.selectedGroup))
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
