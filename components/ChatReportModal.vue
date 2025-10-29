<template>
  <b-modal ref="modal" scrollable title="Oh dear..." size="lg" no-stacking>
    <template #default>
      <b-row>
        <b-col>
          <p>Sorry you're having trouble.</p>
          <h4>Which community is this about?</h4>
          <GroupSelect v-model="groupid" class="mt-1 mb-1" />
          <h4>Why are you reporting this?</h4>
          <b-form-select v-model="reason" class="mt-1 mb-1">
            <option value="null">-- Please choose --</option>
            <option value="Spam">It's Spam</option>
            <option value="Other">Something else</option>
          </b-form-select>
          <h4>What's wrong?</h4>
          <b-form-textarea
            v-model="comments"
            placeholder="Please tell us what's wrong.  This will go to our lovely volunteers, who will try to help you."
          />
        </b-col>
      </b-row>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
      <b-button variant="primary" @click="send"> Send Report </b-button>
    </template>
  </b-modal>
</template>
<script setup>
import { ref } from 'vue'
import GroupSelect from './GroupSelect'
import { useChatStore } from '~/stores/chat'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  chatid: {
    type: Number,
    required: true,
  },
})

const chatStore = useChatStore()
const { modal, hide } = useOurModal()

const groupid = ref(null)
const reason = ref(null)
const comments = ref(null)

async function send() {
  if (groupid.value && reason.value && comments.value) {
    const chatid = await chatStore.openChatToMods(groupid.value)

    await chatStore.report(chatid, reason.value, comments.value, props.chatid)

    hide()
  }
}
</script>
