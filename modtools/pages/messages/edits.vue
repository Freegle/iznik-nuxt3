<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModGroupSelect
        v-model="groupid"
        all
        modonly
        :work="['editreview']"
        remember="edits"
      />
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        There are no messages at the moment. This will refresh automatically.
      </NoticeMessage>
      <ModMessages editreview />
    </client-only>
  </div>
</template>
<script>
import { setupModMessages } from '~/composables/useModMessages'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  setup() {
    const miscStore = useMiscStore()
    const modMessages = setupModMessages(true)
    modMessages.collection.value = 'Edit'
    modMessages.workType.value = 'editreview'
    return {
      miscStore,
      ...modMessages, // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  data: function () {
    return {}
  },
  watch: {
    groupid: {
      async handler(newVal, oldVal) {
        this.context = null

        const modGroupStore = useModGroupStore()
        await modGroupStore.fetchIfNeedBeMT(newVal)
        this.group = modGroupStore.get(newVal)
        await this.getMessages()

        this.show = this.messages.length
      },
    },
  },
}
</script>
