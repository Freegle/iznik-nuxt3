<template>
  <div>
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
</template>
<script>
import { useMessageStore } from '../stores/message'
import { useMicroVolunteeringStore } from '../stores/microvolunteering'
import SpinButton from './SpinButton'
const MessageExpanded = defineAsyncComponent(() =>
  import('~/components/MessageExpanded')
)

export default {
  components: { MessageExpanded, SpinButton },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const microVolunteeringStore = useMicroVolunteeringStore()
    const messageStore = useMessageStore()
    await messageStore.fetch(props.id, true)

    const showMessagePhotosModal = ref(false)
    const showPhotosModal = () => {
      showMessagePhotosModal.value = true
    }
    return {
      messageStore,
      microVolunteeringStore,
      showMessagePhotosModal,
      showPhotosModal,
    }
  },
  data() {
    return {
      showComments: false,
      comments: null,
      msgcategory: null,
    }
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
  },
  methods: {
    notRight(callback) {
      // Don't record the result yet - people who don't give comments seem to have less good judgement.
      this.showComments = true
      callback()
    },
    async sendComments(callback) {
      // Record the result with comments.
      await this.microVolunteeringStore.respond({
        msgid: this.id,
        response: 'Reject',
        comments: this.comments,
        msgcategory: this.msgcategory,
      })
      callback()

      this.$emit('next')
    },
    async approve(callback) {
      // Approved -  that's it.
      await this.microVolunteeringStore.respond({
        msgid: this.id,
        response: 'Approve',
      })
      callback()

      this.$emit('next')
    },
  },
}
</script>
<style scoped lang="scss">
:deep(label) {
  font-weight: bold;
}
</style>
