<template>
  <div>
    <b-modal id="modEmailMessageModal" ref="modal" size="lg" @hidden="onHide">
      <template #title> Message received by email </template>
      <template #default>
        <p>
          Sometimes messages which arrive by email aren't translated into Chat
          correctly. Here you can see a bit more of the original email.
        </p>
        <b-tabs content-class="mt-3">
          <b-tab title="Pretty View" active>
            <Letter v-if="message" :html="html" :text="text" />
          </b-tab>
          <b-tab title="Raw Message Source">
            <NoticeMessage variant="info" class="mb-1">
              This is the raw email we received. It may have had large
              attachments removed for space reasons. The body of the email is
              sometimes encoded, and you might not be able to read it. If you
              need help, ask on Tech.
            </NoticeMessage>
            <!-- eslint-disable-next-line-->
            <pre v-if="message">{{ message.message }}</pre>
          </b-tab>
        </b-tabs>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { Letter } from 'vue-letter'
import { extract } from 'letterparser'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  collection: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['hidden'])

const { modal, hide, show } = useOurModal()
const messageStore = useMessageStore()

const message = ref(null)

const parsed = computed(() => {
  if (message.value) {
    return message.value && message.value.message
      ? extract(message.value.message)
      : null
  }
  return null
})

const text = computed(() => {
  return parsed.value ? parsed.value.text : null
})

const html = computed(() => {
  return parsed.value ? parsed.value.html : null
})

onMounted(async () => {
  // Get message directly rather than via store, to get message mail source
  message.value = await messageStore.fetchMT({
    id: props.id,
    messagehistory: true,
  })
})

function onHide() {
  emit('hidden')
}

defineExpose({ show, hide })
</script>
