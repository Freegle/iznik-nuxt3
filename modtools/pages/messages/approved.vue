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

      <infinite-loading :key="'infinite-' + groupid + '-' + bump" force-use-infinite-wrapper="body" :distance="distance" @infinite="loadMore">
        <span slot="no-results" />
        <span slot="no-more" />
        <span slot="spinner">
          <b-img lazy src="/loader.gif" alt="Loading" />
        </span>
      </infinite-loading>
    </div>
  </client-only>
</template>

<script setup>
import dayjs from 'dayjs'
import { useGroupStore } from '~/stores/group';
import { useMessageStore } from '../../stores/message'
import ScrollToTop from '~/components/ScrollToTop'
import { setupModMessages } from '../composables/useModMessages'

const groupStore = useGroupStore()
const messageStore = useMessageStore()

const bump = ref(0)

//const { context, distance, limit, workType, show, busy, messageTerm, memberTerm, modalOpen, scrollHeight, scrollTop, nextAfterRemoved,  visibleMessages, messages, work } = modMessages()

const { collection, messageTerm, memberTerm, summary, messages, distance,
  busy, context, group, groupid, limit, workType, show
  //context, distance, limit, workType, show, busy, messageTerm, memberTerm, modalOpen, scrollHeight, scrollTop, nextAfterRemoved, 
  //visibleMessages, messages,work 
} = setupModMessages()

collection.value = 'Approved'
workType.value = null

const groupName = computed(() => {
  if (groupid.value) {
    return groupStore.get(this.groupid)?.namedisplay
  }

  return null
})

watch(summary, () => {
  // Re-render the infinite scroll in case we need to fetch more.
  bump.value++
  checkLimit()
})

onMounted(() => {
  checkLimit()
})

//  mixins: [
//loginRequired,
//createGroupRoute('modtools/messages/pending'),
//modMessagesPage,
//shuffle
//  ],

const checkLimit = () => {
  limit.value = summary.value ? 10 : 2
}

const searchedMessage = (term) => {
  messageTerm.value = term
  memberTerm.value = null
  context.value = null

  // Need to rerender the infinite scroll
  bump.value++
}

const searchedMember = (term) => {
  messageTerm.value = null
  memberTerm.value = term

  // Need to rerender the infinite scroll
  bump.value++
}

const loadMore = ($state) => {
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
}
</script>
