<template>
  <div>
    <client-only>
      <ScrollToTop />
      <GroupSelect v-model="groupid" all modonly :work="['editreview']" remember="edits" />
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        There are no messages at the moment.  This will refresh automatically.
      </NoticeMessage>
      <ModMessages editreview />
    </client-only>
  </div>
</template>
<script>
import { useMiscStore } from '@/stores/misc'
// import loginRequired from '@/mixins/loginRequired'
// import createGroupRoute from '@/mixins/createGroupRoute'
import ScrollToTop from '~/components/ScrollToTop'
import { setupModMessages } from '../../composables/useModMessages'

export default {
  async setup() {
    const miscStore = useMiscStore()
    const modMessages = setupModMessages()
    modMessages.collection.value = 'Edit'
    modMessages.workType.value = 'editreview'
    return {
      miscStore,
      ...modMessages // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  mixins: [
    //loginRequired,
    //createGroupRoute('modtools/messages/edits'),
    //modMessagesPage
  ],
  data: function() {
    return {
    }
  }
}
</script>
