<template>
  <div>
    <h2 v-if="group" class="visually-hidden">Community Information</h2>
    <GroupHeader
      v-if="group"
      :group="group"
      show-join
      :show-give-find="showGiveFind"
    />
    <h2 class="visually-hidden">List of wanteds and offers</h2>
    <div id="visobserver" v-observe-visibility="visibilityChanged" />
    <div v-if="deDuplicatedMessages?.length" id="messageList">
      <div
        v-if="!loading && selectedSort === 'Unseen' && showCountsUnseen && me"
      >
        <MessageListCounts v-if="browseCount" @mark-seen="markSeen" />
      </div>
      <VisibleWhen :at="['xs', 'sm']">
        <div
          v-for="(m, ix) in deDuplicatedMessages"
          :key="'messagelist-' + m.id"
        >
          <div v-if="ix % 2 === 0">
            <MessageListUpToDate
              v-if="
                (!loading &&
                  selectedSort === 'Unseen' &&
                  showCountsUnseen &&
                  deDuplicatedMessages[ix]?.id === firstSeenMessage) ||
                deDuplicatedMessages[ix + 1]?.id === firstSeenMessage
              "
            />
            <div class="twocolumn">
              <div
                :id="'messagewrapper-' + m.id"
                :ref="'messagewrapper-' + m.id"
                class="onecolumn"
              >
                <OurMessage :id="m.id" :matchedon="m.matchedon" record-view />
              </div>
              <div
                v-if="ix + 1 < deDuplicatedMessages.length"
                :id="'messagewrapper-' + deDuplicatedMessages[ix + 1].id"
                :ref="'messagewrapper-' + deDuplicatedMessages[ix + 1].id"
                class="onecolumn"
              >
                <OurMessage
                  :id="deDuplicatedMessages[ix + 1].id"
                  :matchedon="deDuplicatedMessages[ix + 1].matchedon"
                  record-view
                />
              </div>
            </div>
          </div>
        </div>
      </VisibleWhen>
      <VisibleWhen :not="['xs', 'sm']">
        <div
          v-for="message in deDuplicatedMessages"
          :key="'messagelist-' + message.id"
        >
          <MessageListUpToDate
            v-if="
              !loading &&
              selectedSort === 'Unseen' &&
              showCountsUnseen &&
              message.id === firstSeenMessage
            "
          />
          <div
            :id="'messagewrapper-' + message.id"
            :ref="'messagewrapper-' + message.id"
            class=""
          >
            <OurMessage
              :id="message.id"
              :matchedon="message.matchedon"
              record-view
            />
          </div>
        </div>
      </VisibleWhen>
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
import MessageListUpToDate from './MessageListUpToDate'
import { ref } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useMiscStore } from '~/stores/misc'
import VisibleWhen from '~/components/VisibleWhen'
const OurMessage = defineAsyncComponent(() =>
  import('~/components/OurMessage.vue')
)
const GroupHeader = defineAsyncComponent(() =>
  import('~/components/GroupHeader.vue')
)
const MIN_TO_SHOW = 10
const SHOW_AD_EVERY = 5

export default {
  components: {
    MessageListUpToDate,
    OurMessage,
    GroupHeader,
    InfiniteLoading,
    VisibleWhen,
  },
  props: {
    messagesForList: {
      type: Array,
      required: true,
    },
    firstSeenMessage: {
      type: Number,
      required: false,
      default: null,
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
    selectedSort: {
      type: String,
      required: false,
      default: 'Unseen',
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
    showCountsUnseen: {
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
      SHOW_AD_EVERY,
    }
  },
  data() {
    return {
      // Infinite message scroll
      distance: 2000,
      prefetched: 0,
      emitted: false,
      markSeenTimer: null,
      markUnseenTries: 10,
    }
  },
  computed: {
    ...mapState(useIsochroneStore, { isochroneBounds: 'bounds' }),
    browseCount() {
      return this.messageStore.count
    },
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
      let ret = []
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

          if (m.id === this.firstSeenMessage) {
            if (already) {
              // We are planning to show a message which is a duplicate of the first seen.  To make sure we show
              // the notice about having seen messages below here, show this one instead.
              ret = ret.filter((m) => m.id !== dups[key])
            }
            ret.push(m)
          } else if (!already) {
            ret.push(m)
            dups[key] = m.id
          }
        }
      })

      return ret
    },
    duplicates() {
      const ret = []

      this.filteredMessagesToShow.forEach((m) => {
        if (!this.deDuplicatedMessages.find((d) => d.id === m.id)) {
          ret.push(m)
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
    duplicates: {
      handler(newVal) {
        if (this.me && newVal?.length) {
          // Any duplicates are things we won't ever show.  If they are unseen then they will be contributing to the
          // unseen count, but we don't want them to.  So mark such messages as seen.
          const ids = []

          newVal.forEach((m) => {
            const message = this.filteredMessagesInStore[m.id]

            if (message?.unseen) {
              ids.push(m.id)
            }
          })

          if (ids.length) {
            this.messageStore.markSeen(ids)
          }
        }
      },
      immediate: true,
    },
  },
  beforeUnmount() {
    if (this.markSeenTimer) {
      clearTimeout(this.markSeenTimer)
    }
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

        if (this.me) {
          // Kick off a fetch of the unread count - normally done when we scroll down but we might skip if we've done
          // too frequently.
          this.messageStore.fetchCount(this.me.settings?.browseView, false)
        }
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
    markSeen() {
      const ids = []

      this.messagesForList.forEach((m) => {
        if (m.unseen) {
          ids.push(m.id)
        }
      })

      if (ids.length) {
        this.messageStore.markSeen(ids)
      }

      this.markSeenTimer = setTimeout(async () => {
        // This is a backgrounded operation on the server and therefore won't happen immediately.
        const count = await this.messageStore.fetchCount(
          this.me?.settings?.browseView,
          false
        )

        this.markUnseenTries--
        console.log('Mark unseen', count, this.markUnseenTries)

        if (this.markUnseenTries && count) {
          this.markSeen()
        } else {
          this.markUnseenTries = 10
        }
      }, 100)
    },
    insertAd(ix) {
      // We show an ad occasionally in the feed.
      if (ix % this.SHOW_AD_EVERY !== 0) {
        return false
      }

      // We have to insert a different ad slot each time - Google doesn't let you repeat them.  And we need to
      // have different variants for desktop and mobile.
      const desktop = !['xs', 'sm', 'md', 'lg'].includes(
        this.miscStore.breakpoint
      )

      ix = ix / 10

      const ads = desktop
        ? {
            0: {
              adUnitPath: '/22794232631/freegle_feed_desktop',
              dimensions: [[728, 90]],
              divId: 'div-gpt-ad-1692867153277-0',
            },
            1: {
              adUnitPath: '/22794232631/freegle_feed_desktop_2',
              dimensions: [[728, 90]],
              divId: 'div-gpt-ad-1708280158016-0',
            },
            2: {
              adUnitPath: '/22794232631/freegle_feed_desktop_3',
              dimensions: [[728, 90]],
              divId: 'div-gpt-ad-1708280229653-0',
            },
            3: {
              adUnitPath: '/22794232631/freegle_feed_desktop_4',
              dimensions: [[728, 90]],
              divId: 'div-gpt-ad-1708280290737-0',
            },
            4: {
              adUnitPath: '/22794232631/freegle_feed_desktop_5',
              dimensions: [[728, 90]],
              divId: 'div-gpt-ad-1708280362777-0',
            },
          }
        : {
            0: {
              adUnitPath: '/22794232631/freegle_feed_app',
              dimensions: [[300, 250]],
              divId: 'div-gpt-ad-1692867324381-0',
            },
            1: {
              adUnitPath: '/22794232631/freegle_feed_app_2',
              dimensions: [[300, 250]],
              divId: 'div-gpt-ad-1707999616879-0',
            },
            2: {
              adUnitPath: '/22794232631/freegle_feed_app_3',
              dimensions: [[300, 250]],
              divId: 'div-gpt-ad-1707999845886-0',
            },
            3: {
              adUnitPath: '/22794232631/freegle_feed_app_4',
              dimensions: [[300, 250]],
              divId: 'div-gpt-ad-1707999962593-0',
            },
            4: {
              adUnitPath: '/22794232631/freegle_feed_app_5',
              dimensions: [[300, 250]],
              divId: 'div-gpt-ad-1708000097990-0',
            },
          }

      if (ix < ads.length) {
        return false
      }

      return ads[ix]
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.twocolumn {
  display: flex;
  flex-wrap: wrap !important;
  grid-template-rows: 2.5px 1fr 2.5px;
  grid-template-columns: 1fr;
  grid-column-gap: 5px;

  @media only screen and (min-width: 360px) {
    display: grid;
    grid-template-rows: 2.5px 1fr 2.5px;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 5px;
  }

  > div {
    grid-row: 2 / 3;
  }

  :deep(.header-title) {
    display: flex;
    flex-direction: column;

    .spacer {
      display: flex;
      flex-grow: 1;
    }
  }

  :deep(.header-description.noAttachments) {
    grid-row: 5 / 6;

    .textbody {
      margin-top: 50px;
      font-size: 1rem;
      height: 100px;
      display: -webkit-box;
      -webkit-line-clamp: 4;
    }

    .description {
      display: block !important;
    }
  }

  :deep(.messagecard.noAttachments) {
    .image-wrapper {
      button {
        background-color: transparent;
      }

      .thumbnail img {
        opacity: 0;
      }
    }
  }

  .onecolumn {
    height: 100%;

    @media only screen and (max-width: 360px) {
      width: 100%;
    }

    @media only screen and (min-width: 360px) {
      width: unset;
    }

    :deep(div) {
      height: 100%;

      .messagecard div {
        div {
          height: unset;
        }
      }
    }

    :deep(.freegleg),
    :deep(.promised),
    :deep(.image-wrapper) {
      height: unset;
    }
  }
}
</style>
