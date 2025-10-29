<template>
  <div>
    <div v-if="!found">
      <NoticeMessage variant="warning"
        >Sorry, we couldn't find that message. It may have been deleted by the
        volunteers. But thanks for looking!
      </NoticeMessage>
    </div>
    <div v-else>
      <p>This is someone else's post. Does it look ok to you?</p>
      <MessageExpanded
        v-if="message"
        :id="message.id"
        :key="'task-' + message.id"
        :message-override="message"
        :replyable="false"
        :actions="false"
        :record-view="false"
        :show-map="false"
        @zoom="showPhotosModal"
      />
      <MessagePhotosModal
        v-if="showMessagePhotosModal && message.attachments?.length"
        :id="message.id"
        @hidden="showMessagePhotosModal = false"
      />
      <div
        v-if="!showComments"
        class="d-flex justify-content-between flex-wrap w-100 mt-3"
      >
        <SpinButton
          variant="primary"
          class="mb-1"
          icon-name="check"
          label="Yes, that looks ok"
          size="lg"
          @handle="approve"
        />
        <SpinButton
          variant="secondary"
          class="mb-1"
          icon-name="times"
          label="No, something's not right"
          size="lg"
          @handle="notRight"
        />
      </div>
      <div v-if="showComments" class="mt-2">
        <b-form-group label="What's wrong?">
          <b-form-radio v-model="msgcategory" value="CouldBeBetter">
            This could be better
          </b-form-radio>
          <b-form-radio v-model="msgcategory" value="ShouldntBeHere">
            This shouldn't be on Freegle
          </b-form-radio>
        </b-form-group>
        <b-form-group>
          <label for="comments"> Please explain what's wrong: </label>
          <b-form-textarea
            id="comments"
            v-model="comments"
            rows="2"
            placeholder="Could you give us a quick indication of what's not right?"
          />
          <SpinButton
            v-if="msgcategory && comments"
            variant="primary"
            class="mt-2"
            icon-name="save"
            label="Send your comments"
            size="lg"
            @handle="sendComments"
          />
        </b-form-group>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import SpinButton from './SpinButton'
import MessagePhotosModal from './MessagePhotosModal'
import NoticeMessage from './NoticeMessage'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'
import { useMessageStore } from '~/stores/message'

const MessageExpanded = defineAsyncComponent(() =>
  import('~/components/MessageExpanded')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['next'])

const microVolunteeringStore = useMicroVolunteeringStore()
const messageStore = useMessageStore()

// State
const showComments = ref(false)
const comments = ref(null)
const msgcategory = ref(null)
const showMessagePhotosModal = ref(false)
const found = ref(false)

// Initialize
await messageStore.fetch(props.id, true)
found.value = !!messageStore.byId(props.id)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

function showPhotosModal() {
  showMessagePhotosModal.value = true
}

function notRight(callback) {
  // Don't record the result yet - people who don't give comments seem to have less good judgement.
  showComments.value = true
  callback()
}

async function sendComments(callback) {
  // Record the result with comments.
  await microVolunteeringStore.respond({
    msgid: props.id,
    response: 'Reject',
    comments: comments.value,
    msgcategory: msgcategory.value,
  })
  callback()

  emit('next')
}

async function approve(callback) {
  // Approved - that's it.
  await microVolunteeringStore.respond({
    msgid: props.id,
    response: 'Approve',
  })
  callback()

  emit('next')
}
</script>
<style scoped lang="scss">
:deep(label) {
  font-weight: bold;
}
</style>
