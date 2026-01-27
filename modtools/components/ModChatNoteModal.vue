<template>
  <div>
    <b-modal id="modNoteModal" ref="modal" size="lg" @hidden="onHide">
      <template #title>
        <div v-if="chat && user1 && user2">
          Add Mod Note to chat between {{ user1.displayname }} and
          {{ user2.displayname }}
        </div>
      </template>
      <template #default>
        <p>
          This will add a note from the moderators, which will be visible to
          everyone in this chat.
        </p>
        <p>
          Please include your name. It's also good to explain that only some
          messages are reviewed, so that people don't wrongly think we read all
          their messages.
        </p>
        <p>
          Please use a general phrase like "our automated checks flagged this
          for review" - don't provide really precise details about what caused a
          message to be held for review, because people will then just find ways
          around that.
        </p>
        <label for="groupid">
          We'll add 'Group X Volunteer' to the end of the note.
        </label>
        <ModGroupSelect id="groupid" v-model="groupid" modonly class="mb-2" />
        <label for="note"> Your note: </label>
        <b-form-textarea
          id="note"
          v-model="note"
          placeholder="Add your note here"
        />
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button
          variant="primary"
          :disabled="!note || groupid <= 0"
          @click="addit"
        >
          Add Mod Message
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'
import { useChatStore } from '~/stores/chat'
import { useOurModal } from '~/composables/useOurModal'
import { untwem } from '~/composables/useTwem'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['hidden'])

const { $api } = useNuxtApp()
const chatStore = useChatStore()
const { modal, hide } = useOurModal()
const { myGroup } = useMe()

const chat = ref(null)
const note = ref(null)
const groupid = ref(null)

const user1 = computed(() => {
  return chat.value ? chat.value.user1 : null
})

const user2 = computed(() => {
  return chat.value ? chat.value.user2 : null
})

function show() {
  // Take a copy rather than use computed as it isn't ours and will vanish from the store.
  chat.value = chatStore.byChatId(props.chatid)
}

function onHide() {
  emit('hidden')
}

async function addit() {
  // Encode up any emojis.
  let msg = untwem(note.value)

  const group = myGroup(groupid.value)

  msg += `\n\n${group.namedisplay} Volunteer`

  console.log('addit', msg)

  // Send it (direct)
  await $api.chat.sendMT({
    roomid: props.chatid,
    message: msg,
    modnote: true,
  })

  hide()
}

defineExpose({ show, hide })
</script>
