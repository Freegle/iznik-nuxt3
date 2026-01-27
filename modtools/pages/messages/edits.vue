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
<script setup>
import { watch } from 'vue'
import { setupModMessages } from '~/composables/useModMessages'
import { useModGroupStore } from '@/stores/modgroup'

const modGroupStore = useModGroupStore()

const {
  busy,
  context,
  group,
  groupid,
  workType,
  show,
  collection,
  messages,
  getMessages,
} = setupModMessages(true)

collection.value = 'Edit'
workType.value = 'editreview'

watch(groupid, async (newVal) => {
  context.value = null

  await modGroupStore.fetchIfNeedBeMT(newVal)
  group.value = modGroupStore.get(newVal)
  await getMessages()

  show.value = messages.value.length
})
</script>
