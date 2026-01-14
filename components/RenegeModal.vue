<template>
  <b-modal
    ref="modal"
    scrollable
    title="Remove a promise"
    size="lg"
    @shown="onShow"
  >
    <template #default>
      <div class="renege-content">
        <notice-message class="mb-3" variant="warning">
          Please only do this if there's a good reason, so as not to disappoint
          people.
        </notice-message>

        <div class="form-section">
          <div class="section-header">
            <v-icon icon="gift" class="section-icon" />
            <span class="section-title">You're no longer promising:</span>
          </div>
          <b-form-select
            v-model="message"
            :options="messageOptions"
            class="form-select-modern"
            disabled
          />
        </div>

        <div class="form-section">
          <div class="section-header">
            <v-icon icon="user" class="section-icon" />
            <span class="section-title">...to:</span>
          </div>
          <b-form-select
            v-model="user"
            :options="userOptions"
            class="form-select-modern"
            disabled
          />
        </div>

        <div v-if="tryst" class="form-section">
          <div class="section-header">
            <v-icon icon="calendar-alt" class="section-icon" />
            <span class="section-title">Handover Arrangement</span>
          </div>
          <b-form-checkbox
            v-model="removeTryst"
            size="lg"
            class="tryst-checkbox"
          >
            Cancel handover arranged for
            <strong>
              <DateFormatted :value="tryst.arrangedfor" format="weekdaytime" />
            </strong>
          </b-form-checkbox>
        </div>

        <div class="form-section">
          <div class="section-header">
            <v-icon icon="thumbs-up" class="section-icon" />
            <span class="section-title">Rate this freegler</span>
          </div>
          <p class="section-description">
            Please also give this freegler a thumbs up or down, depending on the
            experience you had with them.
          </p>
          <UserRatings :id="selectedUser" size="lg" />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="modal-actions">
        <b-button variant="link" class="cancel-btn" @click="hide">
          Cancel
        </b-button>
        <b-button variant="warning" @click="renege">
          <v-icon icon="times" class="me-1" /> Unpromise
        </b-button>
      </div>
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
        text: '-- Please choose a freegler --',
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
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.renege-content {
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

.section-description {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;
}

.form-select-modern {
  font-weight: 600;
}

.tryst-checkbox {
  font-size: 0.9rem;
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
