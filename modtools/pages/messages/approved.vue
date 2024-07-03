<template>
  <client-only>
    <ScrollToTop :prepend="groupName" />
    <div class="d-flex justify-content-between flex-wrap">
      <GroupSelect v-model="groupid" all modonly remember="approved" />
      <ModFindMessagesFromMember @searched="searchedMember" />
      <ModFindMessage v-if="groupid" :groupid="groupid" @searched="searchedMessage" />
      <span v-else class="mt-2">
        Select a community to search messages.
      </span>
      <ModtoolsViewControl />
    </div>
    <div>
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        Nothing found. If looking for a message, almost always this is because the message doesn't exist (or has been very deleted).
      </NoticeMessage>
      <ModMessages :group="group" />
      <infinite-loading direction="top" force-use-infinite-wrapper="true" :distance="10" @infinite="loadMore" :identifier="bump">
        <span slot="no-results" />
        <span slot="no-more" />
        <span slot="spinner">
          <b-img lazy src="~/static/loader.gif" alt="Loading" />
        </span>
      </infinite-loading>
    </div>
  </client-only>
</template>

<script>
import { useMiscStore } from '@/stores/misc'
import { useMessageStore } from '../../stores/message'
import ScrollToTop from '~/components/ScrollToTop'
import me from '~/mixins/me.js'
import { setupModMessages } from '../../composables/useModMessages'

export default {
  async setup() {
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()
    const modMessages = setupModMessages()
    modMessages.collection.value = 'Approved'
    // modMessages.workType.value = 'approved'
    return {
      messageStore, miscStore,
      ...modMessages // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  mixins: [
    me,
    /*loginRequired,
    createGroupRoute('modtools/messages/pending'),
    shuffle*/
  ],
  data: function () {
    return {
      error: false,
      bump: 0
    }
  },
  computed: {
    groupName() {
      if (this.group) {
        return this.group.namedisplay
      }

      return null
    },
  },
  methods: {
    searchedMessage(term) {
      console.log('approved searchedMessage', term)
      this.show = 0
      this.messageTerm = term.trim()
      this.memberTerm = null
      this.messageStore.clear()

      // Need to rerender the infinite scroll
      this.bump++
    },
    searchedMember(term) {
      console.log('approved searchedMember', term)
      this.show = 0
      this.messageTerm = null
      this.memberTerm = term.trim()
      this.messageStore.clear()

      // Need to rerender the infinite scroll
      this.bump++
    },

    async loadMore($state) {
      console.log('approved loadMore', this.groupid, this.show, this.messages.length)
      this.busy = true
      if (!this.me) {
        console.log('Ignore load more on MT page with no session.')
        $state.complete()
      } else if (this.show < this.messages.length) {
        // This means that we will gradually add the messages that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        console.log('this.show++', this.show)
        this.show++
        $state.loaded()
      } else {
        console.log('Actually loadMore')
        const currentCount = this.messages.length

        let params

        if (this.messageTerm) {
          params = {
            subaction: 'searchall',
            search: this.messageTerm,
            exactonly: true,
            groupid: this.groupid
          }
        } else if (this.memberTerm) {
          params = {
            subaction: 'searchmemb',
            search: this.memberTerm,
            groupid: this.groupid
          }
        } else {
          params = {
            groupid: this.groupid,
            collection: this.collection,
            modtools: true,
            summary: false
          }
        }

        params.context = this.context
        params.limit = this.messages.length + this.distance

        await this.messageStore.fetchMessagesMT(params)
        this.context = this.messageStore.context

        if (currentCount === this.messages.length) {
          $state.complete()
        } else {
          $state.loaded()
          this.show++
        }
      }
      this.busy = false
    }
  }
}
</script>
