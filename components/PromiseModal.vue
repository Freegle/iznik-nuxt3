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
    @hidden="emit('hidden')"
  >
    <template #default>
      <div class="promise-content">
        <notice-message v-if="!maybe" class="mb-3">
          This lets them know you're planning to give it to them, and helps you
          keep track. You can change your mind later if it doesn't work out,
          using the <em>Unpromise</em> button.
        </notice-message>
        <notice-message v-else class="mb-3" variant="warning">
          <p>
            If you are, then please confirm that here. It helps the system keep
            track and means we can send them reminders. You can change your mind
            later if it doesn't work out, using the <em>Unpromise</em> button.
          </p>
          <p class="mb-0">
            If you're not promising it to them, then please just press
            <em>Cancel</em>.
          </p>
        </notice-message>

        <div class="form-section">
          <div class="section-header">
            <v-icon icon="gift" class="section-icon" />
            <span class="section-title">{{
              maybe ? 'Are you promising:' : "You're promising:"
            }}</span>
          </div>
          <b-form-select
            v-model="message"
            :options="messageOptions"
            class="form-select-modern"
          />
        </div>

        <div class="form-section">
          <div class="section-header">
            <v-icon icon="user" class="section-icon" />
            <span class="section-title">...to:</span>
          </div>
          <b-form-select
            id="who"
            v-model="currentlySelected"
            :options="userOptions"
            class="form-select-modern"
          />
        </div>

        <div class="form-section">
          <div class="section-header">
            <v-icon icon="calendar-alt" class="section-icon" />
            <span class="section-title">Handover Arrangement</span>
            <span class="section-hint">(optional)</span>
          </div>
          <p class="section-description">
            If you've organised a date and time for the handover, tell us so
            that we can remind both of you.
          </p>
          <div class="date-time-row">
            <div class="date-input-group">
              <label for="date" class="input-label">Day:</label>
              <b-form-input
                id="date"
                ref="dateInput"
                v-model="formattedDate"
                type="text"
                placeholder="No day yet"
                autocomplete="off"
                class="d-none"
              />
              <b-form-input
                v-model="date"
                type="date"
                placeholder="Choose a day"
                :min="minDate"
                :max="maxDate"
                class="date-input"
              />
            </div>
            <div class="time-input-group">
              <label for="time" class="input-label">Time:</label>
              <b-form-input
                id="time"
                v-model="time"
                type="time"
                placeholder="Choose a time"
                step="900"
                class="time-input"
                :class="formattedDate && !time ? 'border-warning' : ''"
              />
            </div>
            <div class="clear-action">
              <b-button
                v-if="time && tryst?.id"
                variant="link"
                class="clear-btn"
                @click="deleteTryst"
              >
                <v-icon icon="times" /> Cancel
              </b-button>
              <b-button
                v-else-if="date || time"
                variant="link"
                class="clear-btn"
                @click="clearTryst"
              >
                <v-icon icon="times" /> Clear
              </b-button>
            </div>
          </div>
          <b-alert v-if="showOddTime" :model-value="true" variant="warning">
            This is an early/late time. Just saying, in case it's not right.
          </b-alert>
          <p v-if="formattedDate && !time" class="time-warning">
            <v-icon icon="exclamation-circle" /> Please add a time.
          </p>
          <p class="section-note">
            If you don't want to specify a precise day and time yet, clear the
            day and click <em>Promise</em>. You can come back here later.
          </p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="modal-actions">
        <b-button variant="link" class="cancel-btn" @click="hide">
          Cancel
        </b-button>
        <SpinButton
          variant="primary"
          icon-name="handshake"
          label="Promise"
          :disabled="buttonDisabled"
          @handle="promise"
        />
      </div>
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

const emit = defineEmits(['hide', 'hidden'])

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
        text: '-- Please choose a freegler --',
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

    emit('hide')
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
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.promise-content {
  padding: 0;
}

.form-section {
  padding: 1rem 0;
  border-bottom: 1px solid $color-gray--lighter;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.section-icon {
  color: $colour-success;
  font-size: 1rem;
}

.section-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: $color-gray--darker;
}

.section-hint {
  font-size: 0.8rem;
  color: $color-gray--dark;
  font-weight: 400;
}

.section-description {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;
}

.section-note {
  font-size: 0.8rem;
  color: $color-gray--dark;
  margin: 0.75rem 0 0;
}

.form-select-modern {
  font-weight: 600;
}

.date-time-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.date-input-group,
.time-input-group {
  flex: 1;
  min-width: 140px;
}

.input-label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: $color-gray--darker;
  margin-bottom: 0.25rem;
}

.date-input,
.time-input {
  width: 100%;
}

.border-warning {
  border-color: $color-orange--dark !important;
}

.clear-action {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  padding-bottom: 0.25rem;
}

.clear-btn {
  color: $color-gray--dark;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
}

.time-warning {
  color: $color-orange--dark;
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.cancel-btn {
  color: $color-gray--dark;
}
</style>
