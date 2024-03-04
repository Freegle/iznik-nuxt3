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
      <ModMessages :collection="collection" :groupid="groupid" :group="group"/>

      <!--infinite-loading :key="'infinite-' + groupid + '-' + bump" force-use-infinite-wrapper="body" :distance="distance" @infinite="loadMore">
          <span slot="no-results" />
          <span slot="no-more" />
          <span slot="spinner">
            <b-img lazy src="/loader.gif" alt="Loading" />
          </span>
        </infinite-loading-->
    </div>
  </client-only>
</template>

<script>
import dayjs from 'dayjs'
import { useMiscStore } from '@/stores/misc'
import ScrollToTop from '~/components/ScrollToTop'
//import { useModMessages } from './modMessages';
//import { modMessages } from '~/composables/modMessages'

//const { context, distance, limit, workType, show, busy, messageTerm, memberTerm, modalOpen, scrollHeight, scrollTop, nextAfterRemoved,  visibleMessages, messages, work } = modMessages()

export default {
  setup() {
    const miscStore = useMiscStore()
    return { miscStore }
  },
  mixins: [
    //loginRequired,
    //createGroupRoute('modtools/messages/pending'),
    //modMessagesPage,
    //shuffle
  ],
  data: function () {
    return {
      group: null,
      groupid: 0,
      groupName: "TODO",
      collection: 'Approved',
    }
  },
  mounted() {

  },
  methods: {
    async loadAll() {
      /*
      // This is a bit of a hack - we clear the store and fetch 1000 messages, which is likely to be all of them.
      this.limit = 1000
      await this.$store.dispatch('messages/clearContext')
      await this.$store.dispatch('messages/clear')
      const self = this

      this.loadMore({
        loaded() {
          self.show = self.messages.length
          self.$nextTick(() => {
            self.$refs.end.scrollIntoView()
          })
        },
        complete() {
          self.show = self.messages.length
          self.$nextTick(() => {
            self.$refs.end.scrollIntoView()
          })
        }
      })*/
    },
    checkLimit() {
      this.limit = this.summary ? 10 : 2
    },
    searchedMessage(term) {
      this.messageTerm = term
      this.memberTerm = null
      this.context = null

      // Need to rerender the infinite scroll
      this.bump++
    },
    searchedMember(term) {
      this.messageTerm = null
      this.memberTerm = term

      // Need to rerender the infinite scroll
      this.bump++
    }
  }
}
</script>
