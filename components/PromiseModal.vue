<template>
  <b-modal
    ref="modal"
    scrollable
    :title="
      maybe ? 'Are you promising this to them?' : 'Promise something to someone'
    "
    size="lg"
    no-stacking
    @shown="onShow"
  >
    <template #default>
      <notice-message v-if="!maybe" class="mb-3">
        This lets them know you're planning to give it to them, and helps you
        keep track. You can change your mind later if it doesn't work out, using
        the <em>Unpromise</em> button.
      </notice-message>
      <notice-message v-else class="mb-3" variant="warning">
        <p>
          If you are, then please confirm that here. It helps the system keep
          track and means we can send them reminders. You can change your mind
          later if it doesn't work out, using the <em>Unpromise</em> button.
        </p>
        <p>
          If you're not promising it to them, then please just press
          <em>Cancel</em>.
        </p>
      </notice-message>
      <p v-if="maybe">Are you promising:</p>
      <p v-else>You're promising:</p>
      <b-form-select
        v-model="message"
        :options="messageOptions"
        class="mb-2 font-weight-bold"
      />
      <div>
        <label for="who" class="font-weight-normal">...to:</label>
        <b-form-select
          id="who"
          v-model="currentlySelected"
          :options="userOptions"
          class="mt-2 mb-2 font-weight-bold"
        />
      </div>
      <p class="mt-2">
        If you've organised a date and time for the handover, then please tell
        us so that we can remind both of you, which makes things go more
        smoothly.
      </p>
      <div class="d-flex justify-content-between flex-wrap">
        <div>
          <label for="date"> Handover on: </label>
          <b-input-group class="mb-3">
            <b-form-input
              id="date"
              ref="dateInput"
              v-model="formattedDate"
              type="text"
              placeholder="No day yet"
              autocomplete="off"
              class="d-none"
            />
            <slot name="append">
              <b-form-input
                id="date"
                v-model="date"
                type="date"
                placeholder="Choose a day"
                :min="minDate"
                :max="maxDate"
              />
            </slot>
          </b-input-group>
        </div>
        <div>
          <label for="time">at:</label>
          <b-form-input
            id="time"
            v-model="time"
            type="time"
            placeholder="Choose a time"
            step="900"
            :offset="-10"
            menu-class="border-primary shadow-lg"
            :class="formattedDate && !time ? 'border-danger' : ''"
          />
        </div>
        <div class="d-flex flex-column justify-content-center">
          <b-button
            v-if="time && tryst?.id"
            variant="link"
            @click="deleteTryst"
          >
            Cancel
          </b-button>
          <b-button v-else-if="date || time" variant="link" @click="clearTryst">
            Clear
          </b-button>
        </div>
      </div>
      <b-alert v-if="showOddTime" :model-value="true" variant="warning">
        This is an early/late time. Just saying, in case it's not right.
      </b-alert>
      <p class="mt-2">
        <span v-if="formattedDate && !time" class="text-danger font-weight-bold"
          >Please add a time.</span
        >
        If you don't want to specify a precise day and time yet, clear the day
        and click the <em>Promise</em> button. You can come back here later.
      </p>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <SpinButton
        variant="primary"
        icon-name="handshake"
        label="Promise"
        :disabled="buttonDisabled"
        @handle="promise"
      />
    </template>
  </b-modal>
</template>
<script setup>
import dayjs from 'dayjs'
import { ref, computed, watch, nextTick, defineAsyncComponent } from 'vue'
import SpinButton from './SpinButton'
import { useTrystStore } from '~/stores/tryst'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'
import { useAuthStore } from '~/stores/auth'
import Api from '~/api'

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
  maybe: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const trystStore = useTrystStore()
const messageStore = useMessageStore()
const { modal, hide } = useOurModal()

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

const authStore = useAuthStore()
const myid = authStore.user?.id

const message = ref(null)
const date = ref(null)
const time = ref(null)
const formattedDate = ref(null)
const showOddTime = ref(false)
const currentlySelected = ref(null)
const dateInput = ref(null)

const minDate = computed(() => {
  return dayjs().format('YYYY-MM-DD')
})

const maxDate = computed(() => {
  return dayjs().add(14, 'day').format('YYYY-MM-DD')
})

const buttonDisabled = computed(() => {
  return (
    currentlySelected.value <= 0 ||
    !props.messages ||
    props.messages.length === 0 ||
    !message.value ||
    // This is fun.  Because && returns one of the values, it doesn't return true or false.  Try hard.
    // eslint-disable-next-line
    (formattedDate.value && !time.value ? true : false)
  )
})

const messageOptions = computed(() => {
  const options = []

  if (props.messages) {
    if (props.messages.length > 1) {
      options.push({
        value: 0,
        text: '-- Please choose --',
      })
    }

    for (const messageItem of props.messages) {
      if (
        messageItem.type === 'Offer' &&
        (!messageItem.outcomes || messageItem.outcomes.length === 0)
      ) {
        options.push({
          value: messageItem.id,
          text: messageItem.subject,
        })
      }
    }
  } else {
    options.push({
      value: 0,
      text: '...Loading...',
      selected: true,
    })
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
        selected: currentlySelected.value === 0,
      })
    }

    for (const user of props.users) {
      options.push({
        value: user.id,
        text: user.displayname,
        selected: parseInt(message.value) === parseInt(user.id),
      })
    }
  }

  return options
})

const tryst = computed(() => {
  return currentlySelected.value
    ? trystStore?.getByUser(currentlySelected.value)
    : null
})

watch(
  () => props.messages,
  (newVal) => {
    let selected = false

    if (newVal) {
      // Maybe the selected message we picked up from a chat no longer exists.
      newVal.forEach((m) => {
        if (
          (!m.outcomes || m.outcomes.length === 0) &&
          parseInt(m.id) === parseInt(message.value)
        ) {
          selected = true
          message.value = m.id
        }
      })

      if (!selected) {
        message.value = 0
      }
    }
  },
  { immediate: true }
)

watch(
  tryst,
  (newVal) => {
    if (newVal) {
      const d = dayjs(newVal.arrangedfor)
      date.value = d.format('YYYY-MM-DD')
      time.value = d.format('HH:mm:ss')
    } else {
      date.value = null
      time.value = null
    }
  },
  { immediate: true }
)

watch(
  () => props.selectedMessage,
  (newVal) => {
    message.value = newVal
  }
)

async function promise(callback) {
  if (currentlySelected.value > 0) {
    await messageStore.promise(message.value, currentlySelected.value)

    console.log('Date arranged for', time.value, date.value)

    if (time.value && !time.value.includes(':')) {
      // We've seen in Sentry that this can happen - looks like if someone types into the hours but not the minutes.
      time.value = time.value + ':00'
    }

    const arrangedfor =
      time.value && date.value
        ? dayjs(date.value + ' ' + time.value).toISOString()
        : null

    if (arrangedfor) {
      if (!tryst.value) {
        // No arrangement yet.
        await trystStore.add(myid, currentlySelected.value, arrangedfor)
      } else {
        // Update
        await trystStore.edit(tryst.value.id, arrangedfor)
      }
    }

    if (props.maybe) {
      await api.bandit.chosen({
        uid: 'promise',
        variant: 'AfterAddress',
      })
    }

    hide()
  }

  callback()
}

async function onShow(showDate) {
  message.value = props.selectedMessage

  currentlySelected.value = 0

  if (props.selectedUser) {
    currentlySelected.value = props.selectedUser
  } else if (props.users && props.users.length === 1) {
    currentlySelected.value = props.users[0].id
  }

  // Fetch any existing trysts.
  await trystStore.fetch()

  // We can get called with a pointer event.
  if (showDate && typeof showDate.format === 'function') {
    // Explicit date -set it (overriding any in the tryst).
    nextTick(() => {
      date.value = showDate.format('YYYY-MM-DD')
    })
  }

  if (props.maybe) {
    api.bandit.shown({
      uid: 'promise',
      variant: 'AfterAddress',
    })
  }
}

function deleteTryst() {
  trystStore.delete(tryst.value.id)
}

function clearTryst() {
  date.value = null
  time.value = null
}
</script>
<style scoped>
label {
  font-weight: bold;
}
</style>
