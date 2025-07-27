<template>
  <client-only>
    <ScrollToTop :prepend="groupName" />
    <div class="d-flex justify-content-between flex-wrap">
      <ModGroupSelect v-model="chosengroupid" all modonly remember="approved" />
      <ModFindMessagesFromMember @searched="searchedMember" />
      <ModFindMessage
        v-if="groupid"
        :groupid="groupid"
        :message-term="messageTerm"
        @searched="searchedMessage"
        @changed="changedMessageTerm"
      />
      <span v-else class="mt-2"> Select a community to search messages. </span>
      <ModtoolsViewControl misckey="modtoolsMessagesApprovedSummary" />
    </div>
    <div>
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        Nothing found. Almost always this is because the member or message
        doesn't exist (or has been very deleted).
      </NoticeMessage>
      <ModMessages :group="group" />
      <infinite-loading
        direction="top"
        force-use-infinite-wrapper="true"
        :distance="10"
        :identifier="bump"
        @infinite="loadMore"
      >
        <template #spinner>
          <b-img lazy src="/loader.gif" alt="Loading" />
        </template>
      </infinite-loading>
    </div>
  </client-only>
</template>

<script>
// Handles:
//  /messages/approved
//  /messages/approved/<groupid>
//  /messages/approved/<groupid>/<term>
// Once mounted:
//  - changing group changes URL - though sometimes doesn't work
//  - Email/name/id search doesn't change URL
//  - Message id/subject search changes URL <term>

import { useRoute } from 'vue-router'
import { useMiscStore } from '@/stores/misc'
import { useMessageStore } from '@/stores/message'
import { setupModMessages } from '@/composables/useModMessages'
import { useMe } from '~/composables/useMe'

export default {
  // mixins: [me],
  setup() {
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()
    const modMessages = setupModMessages(true)
    modMessages.summarykey.value = 'modtoolsMessagesApprovedSummary'
    modMessages.collection.value = 'Approved'
    // modMessages.workType.value = 'approved'
    const { me } = useMe()
    return {
      messageStore,
      miscStore,
      me,
      ...modMessages, // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  data: function () {
    return {
      chosengroupid: 0,
      error: false,
      bump: 0,
    }
  },
  computed: {
    id() {
      // Given groupid
      const route = useRoute()
      if ('id' in route.params && route.params.id)
        return parseInt(route.params.id)
      return 0
    },
    groupName() {
      if (this.group) {
        return this.group.namedisplay
      }

      return null
    },
  },
  watch: {
    chosengroupid(newVal) {
      const router = useRouter()
      if (newVal !== this.id) {
        this.$nextTick(() => {
          if (newVal === 0) {
            // console.log('chosengroupid GO HOME')
            router.push('/messages/approved/')
          } else {
            // console.log('chosengroupid GOTO', newVal, typeof newVal)
            this.groupid = newVal // Sometimes route change does not work so save as groupid just in case
            router.push('/messages/approved/' + newVal)
          }
        })
      } else {
        // console.log('chosengroupid SAME')
      }
    },
  },
  mounted() {
    const route = useRoute()
    this.groupid = this.id
    this.chosengroupid = this.id
    this.memberTerm = ''
    this.messageTerm = ''
    if ('term' in route.params && route.params.term)
      this.messageTerm = route.params.term
    // const currentCount = Object.keys(this.messageStore.list).length
    // console.log('messages [[term]]', this.id, this.messageTerm, currentCount)
    if (this.messageTerm) {
      this.searchedMessage(this.messageTerm)
    }
  },
  methods: {
    changedMessageTerm(term) {
      this.messageTerm = term.trim()
    },
    searchedMessage(term) {
      const router = useRouter()
      term = term.trim()
      if (term.length > 0) {
        router.push('/messages/approved/' + this.groupid + '/' + term)
      } else if (this.groupid) {
        router.push('/messages/approved/' + this.groupid)
      } else {
        router.push('/messages/approved/')
      }
    },
    searchedMember(term) {
      this.show = 0
      this.messageTerm = null
      this.memberTerm = term?.trim()
      this.context = null
      this.messageStore.clear()

      // Need to rerender the infinite scroll
      this.bump++
    },

    async loadMore($state) {
      this.busy = true
      if (!this.me) {
        console.log('Ignore load more on MT page with no session.')
        $state.complete()
      } else if (this.show < this.messages.length) {
        // This means that we will gradually add the messages that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        // console.log('this.show++', this.show)
        this.show++
        $state.loaded()
      } else {
        // console.log('Actually loadMore')
        // const currentCount = this.messages.length
        const currentCount = Object.keys(this.messageStore.list).length // Use total messages found, not just this,messages as this stops too soon
        // console.log('Actually loadMore', currentCount)

        let params

        if (this.messageTerm) {
          params = {
            subaction: 'searchall',
            search: this.messageTerm,
            exactonly: true,
            groupid: this.groupid,
          }
        } else if (this.memberTerm) {
          params = {
            // TODO: Need to keep fetching as first found batch may not contain
            subaction: 'searchmemb',
            search: this.memberTerm,
            // groupid: this.groupid // TODO: First fetch without this and then second with, with context
          }
          if (this.context) {
            // To get it to work for this case, only set groupid if already got a context!
            params.groupid = this.groupid
          }
        } else {
          params = {
            groupid: this.groupid,
            collection: this.collection,
            modtools: true,
            summary: false,
          }
        }

        params.context = this.context
        params.limit = this.messages.length + this.distance
        // console.log('Approved loadMore DO', params, '>>>', Object.keys(this.messageStore.list).length, this.context)

        // params.debug = '[[term]] loadMore',
        await this.messageStore.fetchMessagesMT(params)
        this.context = this.messageStore.context
        // console.log('Approved LoadMore GOT', this.context)
        // console.log('Approved LoadMore GOT', currentCount, this.messages.length, '>>>', Object.keys(this.messageStore.list).length)

        // if (currentCount === this.messages.length) {
        if (currentCount === Object.keys(this.messageStore.list).length) {
          $state.complete()
        } else {
          $state.loaded()
          this.show++
        }
      }
      this.busy = false
    },
  },
}
</script>
