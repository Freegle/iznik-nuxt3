<template>
  <div>
    <h2 v-if="group" class="sr-only">Community Information</h2>
    <GroupHeader v-if="group" :group="group" show-join />
    <!--        TODO Jobs-->
    <!--        <JobsTopBar v-if="jobs" class="d-block d-lg-none" />-->

    <h2 class="sr-only">List of wanteds and offers</h2>
    <client-only>
      <div v-observe-visibility="visibilityChanged" />
    </client-only>
    <div v-if="deDuplicatedMessages.length">
      <div
        v-for="message in deDuplicatedMessages"
        :key="'messagelist-' + message.id"
        class="p-0"
      >
        <OurMessage :id="message.id" record-view />
      </div>
    </div>
    <client-only>
      <infinite-loading
        v-if="messagesForList.length"
        :identifier="infiniteId"
        force-use-infinite-wrapper="body"
        :distance="distance"
        @infinite="loadMore"
      >
        <span slot="no-results" />
        <span slot="no-more" />
        <span slot="spinner">
          <b-img-lazy src="/loader.gif" alt="Loading" />
        </span>
      </infinite-loading>
      <NoticeMessage v-if="!busy && !loading && !messagesForList.length">
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
    </client-only>
  </div>
</template>
<script>
import { ref } from 'vue'

import dayjs from 'dayjs'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '~/stores/misc'

// const GroupSelect = () => import('./GroupSelect')
const NoticeMessage = () => import('./NoticeMessage')
const OurMessage = () => import('~/components/OurMessage.vue')
const GroupHeader = () => import('~/components/GroupHeader.vue')
// const JobsTopBar = () => import('~/components/JobsTopBar')

const MIN_TO_SHOW = 10

export default {
  components: {
    OurMessage,
    GroupHeader,
    NoticeMessage,
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
  },
  setup(props) {
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()

    const myGroups = []

    if (myGroups && myGroups.length === 1) {
      // TODO We will be showing the single group.
      groupStore.fetch(myGroups[0].id)
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
      busy: false,
      distance: 1000,
      toShow: MIN_TO_SHOW,
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
    filteredMessagesToShow() {
      const ret = []

      // We want to filter by:
      // - Possibly a message type
      // - Possibly a group id
      // - Don't show deleted posts.  Remember the map may lag a bit as it's only updated on cron, so we
      //   may be returned some.
      // - Do show completed posts - makes us look good.  But not too many.
      //
      for (let i = 0; i < this.messagesForList.length && i < this.toShow; i++) {
        const m = this.messagesForList[i]

        if (this.wantMessage(m)) {
          // Pass whether the message has been freegled or promised, which is returned in the summary call.
          let addIt = true

          if (m.successful) {
            // if (this.myid === message.fromuser) {
            //   // Always show your own messages.  We have at least one freegler for whom this is emotionally
            //   // important.
            //   // TODO
            //   addIt = true
            // } else
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

        if (message) {
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
    bump() {
      console.log('Bump message list')
      this.infiniteId++
    },
  },
  methods: {
    loadMore($state) {
      do {
        this.toShow++
      } while (
        this.toShow < this.messagesForList.length &&
        !this.wantMessage(this.messagesForList[this.toShow])
      )

      if (this.toShow > this.messagesForList.length) {
        // We're showing all the messages
        $state.complete()
      } else {
        // We need another message.
        const m = this.messagesForList[this.toShow - 1]

        this.$nextTick(async () => {
          // We always want to trigger a fetch to the store, because the store will decide whether a cached message
          // needs refreshing.
          await this.throttleFetches()
          await this.messageStore.fetch(m.id)

          // Kick the scroll to see if we need more.
          this.infiniteId++
        })

        $state.loaded()
      }
    },
    // Simple throttle.  When we get more than a certain number of outstanding fetches, wait until they are all
    // finished.  This stops the infinite scroll going beserk.
    throttleFetches() {
      const fetching = this.messageStore.fetchingCount

      if (fetching < 5) {
        return Promise.resolve()
      } else {
        return new Promise((resolve) => {
          this.checkThrottle(resolve)
        })
      }
    },
    checkThrottle(resolve) {
      const fetching = this.messageStore.fetchingCount

      if (fetching === 0) {
        resolve()
      } else {
        setTimeout(this.checkThrottle, 100, resolve)
      }
    },
    wantMessage(m) {
      return (
        (this.selectedType === 'All' || this.selectedType === m.type) &&
        (!this.selectedGroup ||
          parseInt(m.groupid) === parseInt(this.selectedGroup))
      )
    },
    visibilityChanged(visible) {
      this.$emit('update:visible', visible)
    },
  },
}
</script>
