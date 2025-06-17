<template>
  <b-modal
    :id="'messageReportModal-' + message.id"
    ref="modal"
    scrollable
    :title="'Report ' + message.subject"
    size="lg"
  >
    <template #default>
      <p>
        Thanks for reporting an inappropriate post. We'll send your comments to
        your local volunteers who will have a look and take suitable action.
      </p>
      <b-form-textarea
        v-model="reason"
        rows="2"
        placeholder="Please explain what's wrong with this post."
      />
    </template>
    <template #footer>
      <b-button variant="secondary" @click="hide">Close</b-button>
      <b-button variant="primary" @click="report">Submit Report</b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useMessageStore } from '~/stores/message'
import { useChatStore } from '~/stores/chat'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()
const chatStore = useChatStore()
const { modal, hide } = useOurModal()
const reason = ref(null)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

async function report() {
  console.log('Report', reason.value)
  if (reason.value) {
    console.log('Open chat')
    const chatid = await chatStore.openChatToMods(
      message.value.groups[0].groupid
    )

    console.log('Send report', chatid)

    const runtimeConfig = useRuntimeConfig()

    await chatStore.send(
      chatid,
      "I'm reporting " +
        runtimeConfig.public.USER_SITE +
        '/message/' +
        message.value.id +
        ' to you as inappropriate.\r\n\r\n"' +
        reason.value +
        '"',
      null,
      null,
      props.id
    )

    hide()
  }
}
</script>
