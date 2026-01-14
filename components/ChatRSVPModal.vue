<template>
  <b-modal
    ref="modal"
    scrollable
    :title="chaseup ? 'Shall we chase them up?' : 'Do you expect a reply?'"
    no-stacking
    no-close-on-backdrop
    hide-header-close
    no-close-on-esc
  >
    <template #default>
      <div v-if="chaseup">
        <p>
          Shall we remind <em>{{ user.displayname }}</em> if they don't reply?
        </p>
      </div>
      <div v-else>
        <p>
          Please let us know if you're expecting to talk to
          <em>{{ user.displayname }}</em> again soon.
        </p>
        <p v-if="dohide">
          If you're not, we will hide the chat from your list for now. You can
          still find it from My Posts.
        </p>
      </div>
    </template>
    <template #footer>
      <div v-if="chaseup" class="d-flex justify-content-between w-100">
        <b-button variant="secondary" @click="no"> No thanks </b-button>
        <b-button variant="primary" @click="yes"> Yes please </b-button>
      </div>
      <div v-else class="d-flex justify-content-between w-100">
        <b-button variant="secondary" @click="no"> No reply expected </b-button>
        <b-button variant="primary" @click="yes">
          Yes, I expect a reply
        </b-button>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '~/stores/chat'
import { useOurModal } from '~/composables/useOurModal'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
})

const chatStore = useChatStore()
const authStore = useAuthStore()
const { modal, hide } = useOurModal()

const chaseup = ref(false)
const dohide = ref(false)
const myid = computed(() => authStore.user?.id)

const chatmessages = computed(() => chatStore?.messagesById(props.id))
const mylast = computed(() => {
  let ret = null

  for (const msg of chatmessages.value) {
    if (parseInt(msg.userid) === parseInt(myid.value)) {
      ret = msg
    }
  }

  return ret
})

async function yes() {
  if (mylast.value) {
    await chatStore.rsvp(mylast.value.id, mylast.value.chatid, 1)
  }

  hide()
}

async function no() {
  if (mylast.value) {
    await chatStore.rsvp(mylast.value.id, mylast.value.chatid, 0)
  }

  if (dohide.value) {
    await chatStore.hide(props.id)
    hide()
    router.push('/chats')
  } else {
    hide()
  }
}
</script>
