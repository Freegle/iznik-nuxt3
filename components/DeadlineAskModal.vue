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
      <p>That way you don't get replies you don't want.</p>
      <label class="font-weight-bold mb-1" for="deadline">
        Set a deadline:
      </label>
      <b-input
        id="deadline"
        v-model="deadline"
        type="date"
        :min="new Date(Date.now()).toISOString().substring(0, 10)"
        :max="defaultDeadline"
        placeholder="Click to enter a date"
      />
    </template>
    <template #footer>
      <div class="d-flex justify-content-end w-100">
        <b-button variant="primary" @click="setDeadline">
          <v-icon icon="save" />&nbsp;Save
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

// Set deadline to date of MESSAGE_EXPIRE_TIME days from now
const defaultDeadline = new Date(
  Date.now() + MESSAGE_EXPIRE_TIME * 24 * 60 * 60 * 1000
)
  .toISOString()
  .substring(0, 10)

const deadline = ref(defaultDeadline)

async function setDeadline() {
  const promises = []

  promises.push(
    api.bandit.chosen({
      uid: 'deadline',
      variant: deadline.value === defaultDeadline ? 'no' : 'yes',
    })
  )

  props.ids.forEach((id) => {
    promises.push(
      messageStore.patch({
        id,
        deadline:
          deadline.value !== defaultDeadline
            ? new Date(deadline.value).toISOString()
            : null,
      })
    )
  })

  await Promise.all(promises)
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
