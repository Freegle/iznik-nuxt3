<template>
  <b-modal ref="modal" scrollable no-stacking>
    <template #title>
      <h2>Is there a deadline?</h2>
    </template>
    <template #default>
      <p>
        We'll show your post to other freeglers for a while. But if your post
        doesn't matter after a certain date, you can tell us.
      </p>
      <p>That way you won't get replies you don't want.</p>
      <div v-if="showInput">
        <label class="font-weight-bold mb-1" for="deadline">
          Set a deadline:
        </label>
        <b-input
          id="deadline"
          v-model="deadline"
          type="date"
          :min="today"
          :max="defaultDeadline"
          placeholder="Click to enter a date"
        />
      </div>
      <p v-else class="font-weight-bold">Set a deadline?</p>
      <NoticeMessage v-if="deadline === today" variant="warning" class="mt-2">
        Are you sure you want your post to stop showing after today?
      </NoticeMessage>
    </template>
    <template #footer>
      <div
        v-if="!showInput"
        class="d-flex justify-content-between flex-wrap w-100"
      >
        <b-button variant="secondary" @click="showInput = true">
          Yes, set a deadline
        </b-button>
        <b-button variant="secondary" @click="noDeadline">
          No deadline
        </b-button>
      </div>
      <div v-else class="d-flex justify-content-between w-100">
        <b-button variant="secondary" @click="noDeadline"> Cancel </b-button>
        <b-button variant="primary" @click="setDeadline">
          <v-icon icon="save" />&nbsp;Save deadline
        </b-button>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { useOurModal } from '~/composables/useOurModal'
import { useMessageStore } from '~/stores/message'
import Api from '~/api'
import { useRuntimeConfig } from '#app'
import { MESSAGE_EXPIRE_TIME } from '~/constants'

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

const props = defineProps({
  ids: {
    type: Array,
    required: true,
  },
})

const messageStore = useMessageStore()
const emit = defineEmits(['hide'])

const showInput = ref(false)

// Set deadline to date of MESSAGE_EXPIRE_TIME days from now
const defaultDeadline = new Date(
  Date.now() + MESSAGE_EXPIRE_TIME * 24 * 60 * 60 * 1000
)
  .toISOString()
  .substring(0, 10)

const deadline = ref(defaultDeadline)
const today = computed(() => {
  return new Date(Date.now()).toISOString().substring(0, 10)
})

async function setDeadline() {
  const promises = []

  promises.push(
    api.bandit.chosen({
      uid: 'deadline',
      variant: deadline.value === defaultDeadline ? 'no' : 'yes',
    })
  )

  props.ids.forEach((id) => {
    if (deadline.value) {
      console.log('Save deadline', deadline.value)
      promises.push(
        messageStore.patch({
          id,
          deadline:
            deadline.value !== defaultDeadline &&
            (!deadline.value || deadline.value > '1970-01-01')
              ? new Date(deadline.value).toISOString()
              : null,
        })
      )
    }
  })

  await Promise.all(promises)
  emit('hide')
  hide()
}

async function noDeadline() {
  await api.bandit.chosen({
    uid: 'deadline',
    variant: 'no',
  })

  emit('hide')
  hide()
}

api.bandit.shown({
  uid: 'deadline',
  variant: 'no',
})

api.bandit.shown({
  uid: 'delivery',
  variant: 'yes',
})

const { modal, hide } = useOurModal()
</script>
