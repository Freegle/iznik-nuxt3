<template>
  <b-modal
    ref="modal"
    scrollable
    title="Remove a promise"
    size="lg"
    @shown="onShow"
  >
    <template #default>
      <notice-message class="mb-3">
        Please only do this if there's a good reason, so as not to disappoint
        people.
      </notice-message>
      <p>You're no longer promising:</p>
      <b-form-select
        v-model="message"
        :options="messageOptions"
        class="mb-2 font-weight-bold"
        disabled=""
      />
      <p>...to:</p>
      <b-form-select
        v-model="user"
        :options="userOptions"
        class="mb-2 font-weight-bold"
        disabled
      />
      <div v-if="tryst" class="d-flex flex-wrap">
        <b-form-checkbox v-model="removeTryst" size="lg">
          Cancel handover arranged for
          <strong
            ><DateFormatted :value="tryst.arrangedfor" format="weekdaytime"
          /></strong>
        </b-form-checkbox>
      </div>
      <hr />
      <p>
        Please also give this freegler a thumbs up or down, depending on the
        experience you had with them.
      </p>
      <UserRatings :id="selectedUser" class="mt-2" size="lg" />
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="warning" @click="renege"> Unpromise </b-button>
    </template>
  </b-modal>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useTrystStore } from '~/stores/tryst'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'
import UserRatings from '~/components/UserRatings'
import DateFormatted from '~/components/DateFormatted'

const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)

const props = defineProps({
  messages: {
    validator: (prop) => typeof prop === 'object' || prop === null,
    required: true,
  },
  selectedMessage: {
    type: Number,
    required: false,
    default: 0,
  },
  users: {
    validator: (prop) => typeof prop === 'object' || prop === null,
    required: true,
  },
  selectedUser: {
    type: Number,
    required: false,
    default: 0,
  },
})

const trystStore = useTrystStore()
const messageStore = useMessageStore()
const { modal, hide } = useOurModal()

// Fetch data
await trystStore.fetch()

// Reactive state
const removeTryst = ref(true)
const message = ref(null)
const user = ref(null)

// Computed properties
const messageOptions = computed(() => {
  const options = []

  if (props.messages) {
    if (props.messages.length > 1) {
      options.push({
        value: 0,
        text: '-- Please choose a message --',
        selected: props.selectedMessage === 0,
      })
    }

    for (const id of props.messages) {
      const messageObj = messageStore?.byId(id)

      if (messageObj) {
        options.push({
          value: messageObj.id,
          text: messageObj.subject,
          selected: props.selectedMessage === messageObj.id,
        })
      }
    }
  }

  return options
})

const userOptions = computed(() => {
  const options = []

  if (props.users) {
    if (props.users.length > 1) {
      options.push({
        value: 0,
        text: '-- Please choose a user --',
        selected: props.selectedUser === 0,
      })
    }

    for (const user of props.users) {
      options.push({
        value: user.id,
        text: user.displayname,
        selected: props.selectedUser === user.id,
      })
    }
  }

  return options
})

const tryst = computed(() => {
  return props.selectedUser ? trystStore?.getByUser(props.selectedUser) : null
})

// Methods
function onShow() {
  message.value = props.selectedMessage
  user.value = props.selectedUser
}

async function renege() {
  await messageStore.renege(message.value, user.value)

  if (tryst.value && removeTryst.value) {
    await trystStore.delete(tryst.value.id)
  }

  hide()
}
</script>
