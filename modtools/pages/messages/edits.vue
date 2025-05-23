<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModGroupSelect v-model="groupid" all modonly :work="['editreview']" remember="edits" />
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        There are no messages at the moment. This will refresh automatically.
      </NoticeMessage>
      <ModMessages editreview />
    </client-only>
  </div>
</template>
<script>
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import ScrollToTop from '~/components/ScrollToTop'
import { setupModMessages } from '../../composables/useModMessages'

export default {
  async setup() {
    const miscStore = useMiscStore()
    const modMessages = setupModMessages(true)
    modMessages.collection.value = 'Edit'
    modMessages.workType.value = 'editreview'
    return {
      miscStore,
      ...modMessages // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
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
      }
    }
  },
  data: function () {
    return {
    }
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
  },
}
</script>
