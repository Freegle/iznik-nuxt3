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
import dayjs from 'dayjs'
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

      if (!this.me) {
        console.log('Ignore load more on MT page with no session.')
        $state.complete()
        return // TODO
      }

      if (this.show < this.messages.length) {
        // This means that we will gradually add the messages that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        console.log('this.show++',this.show)
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

        this.messageStore.fetchMessages(params)
          .then(() => {
            this.context = this.messageStore.context

            if (currentCount === this.messages.length) {
              //TODO this.complete = true
              //busy.value = false
              $state.complete()
            } else {
              $state.loaded()
              //busy.value = false
              this.show++
            }
          })
          .catch(e => {
            $state.complete()
            console.log('Complete on error', e)
            //busy.value = false
          })
      }


    /*if (!this.groupid) {
      console.log('uMM loadMore no groupid')
      $state.complete()
      return
    }
    let messages = messageStore.getByGroup(this.groupid)
    const prevmessagecount = messages.length

    await messageStore.fetchMessages({
      groupid: this.groupid,
      collection: this.collection,
      modtools: true,
      summary: false,
      limit: messages.length + this.distance
    })
    messages = messageStore.getByGroup(this.groupid)
    console.log('uMM loadMore NOW', prevmessagecount, messages.length)
    if (prevmessagecount === messages.length) {
      $state.complete()
    } else {
      //$state.complete()
      $state.loaded()
    }
    this.show = messages.length*/
  }



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
