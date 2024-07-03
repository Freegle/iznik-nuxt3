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
      <ModMessages :group="group" />
      <infinite-loading direction="top" force-use-infinite-wrapper="true" :distance="10" @infinite="loadMore">
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
import dayjs from 'dayjs'
import { useMiscStore } from '@/stores/misc'
import ScrollToTop from '~/components/ScrollToTop'
import me from '~/mixins/me.js'
import { setupModMessages } from '../../composables/useModMessages'

export default {
  async setup() {
    const miscStore = useMiscStore()
    const modMessages = setupModMessages()
    modMessages.collection.value = 'Approved'
    // modMessages.workType.value = 'approved'
    return {
      miscStore,
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
      messageTerm.value = term
      memberTerm.value = null
      context.value = null

      // Need to rerender the infinite scroll
      //      bump.value++
    },
    searchedMember(term) {
      messageTerm.value = null
      memberTerm.value = term

      // Need to rerender the infinite scroll
      //    bump.value++
    },

    /*loadMore($state){
    console.log("======LOAD MORE")
    busy.value = true
  
    const me = true // TODO
    if (!me) {
      console.log('Ignore load more on MT page with no session.')
      $state.complete()
    } else if (show.value < messages.value.length) {
      // This means that we will gradually add the messages that we have fetched from the server into the DOM.
      // Doing that means that we will complete our initial render more rapidly and thus appear faster.
      show.value++
      $state.loaded()
    } else {
      const currentCount = messages.value.length
  
      let params
  
      if (messageTerm.value) {
        params = {
          subaction: 'searchall',
          search: messageTerm.value,
          exactonly: true,
          groupid: groupid.value
        }
      } else if (memberTerm.value) {
        params = {
          subaction: 'searchmemb',
          search: memberTerm.value,
          groupid: groupid.value
        }
      } else {
        params = {
          groupid: groupid.value,
          collection: collection.value,
          modtools: true,
          summary: false
        }
      }
  
      params.context = context.value
      params.limit = limit.value
  
      messageStore.fetchMessages(params)
        .then(() => {
          context.value = messageStore.context
  
          if (currentCount === messages.value.length) {
            //TODO this.complete = true
            busy.value = false
            $state.complete()
          } else {
            $state.loaded()
            busy.value = false
            show.value++
          }
        })
        .catch(e => {
          $state.complete()
          console.log('Complete on error', e)
          busy.value = false
        })
    }
  }*/
  }
}
</script>
