<template>
  <b-modal
    ref="modal"
    scrollable
    size="lg"
    no-stacking
    dialog-class="maxWidth"
    @hidden="onHide"
  >
    <template #title>
      <h3 class="d-flex justify-content-between">
        {{ message.subject }}
        <div>
          <b-badge
            v-if="message.availablenow > 1"
            variant="info"
            class="lg ml-2"
          >
            {{ message.availablenow }} left
          </b-badge>
        </div>
      </h3>
    </template>
    <template #default>
      <NoticeMessage v-if="type === 'Withdrawn'" variant="info">
        <p>
          If everything worked out OK, then use
          <strong
            >Mark as <span v-if="message.type === 'Offer'">TAKEN</span
            ><span v-else>RECEIVED</span></strong
          >
          to let us know.
        </p>
        <div v-if="message.type === 'Offer'">
          <p>
            Only use <strong>Withdraw</strong> if you didn't manage to pass on
            this item on Freegle, and it's no longer available.
          </p>
        </div>
        <div v-else>
          <p>
            Only use <strong>Withdraw</strong> if you are no longer looking for
            this item.
          </p>
        </div>
      </NoticeMessage>
      <div v-if="type === 'Taken'">
        <OutcomeBy
          :availablenow="
            typeof message.availablenow === 'number' ? message.availablenow : 1
          "
          :type="type"
          :msgid="message.id"
          :left="left"
          :taken-by="takenBy"
          :choose-error="chooseError"
          :invalid="submittedWithNoSelectedUser"
          @took-users="took"
        />
      </div>
      <div v-if="showCompletion">
        <div
          v-if="type === 'Taken' && tookUsers?.length && otherRepliers?.length"
        >
          <label class="strong">
            Message for other people who replied (optional):
          </label>
          <b-form-textarea
            v-model="completionMessage"
            :rows="3"
            :max-rows="6"
            class="mt-1"
            placeholder="e.g. Thanks for the interest. Sorry, this went to someone else."
          />
          <p class="mt-1 text-muted small">
            <v-icon icon="lock" /> We'll send this same message privately in
            Chat to each other freegler who replied to your post.
          </p>
        </div>
        <hr class="mb-0" />
        <div>
          <label class="mt-3 strong">
            How do you feel about freegling just now?
          </label>
          <b-button-group class="d-none d-md-block mt-1">
            <b-button
              :pressed="happiness === 'Happy'"
              :variant="happiness === 'Happy' ? 'info' : 'primary'"
              size="lg"
              class="shadow-none"
              @click="happiness = 'Happy'"
            >
              <v-icon icon="smile" scale="2" /> Happy
            </b-button>
            <b-button
              :pressed="happiness === 'Fine'"
              :variant="happiness === 'Fine' ? 'info' : 'white'"
              size="lg"
              class="shadow-none"
              @click="happiness = 'Fine'"
            >
              <v-icon icon="meh" scale="2" color="grey" /> Fine
            </b-button>
            <b-button
              :pressed="happiness === 'Unhappy'"
              :variant="happiness === 'Unhappy' ? 'info' : 'danger'"
              size="lg"
              class="shadow-none"
              @click="happiness = 'Unhappy'"
            >
              <v-icon icon="frown" scale="2" /> Sad
            </b-button>
          </b-button-group>
          <b-button-group class="d-block d-md-none">
            <b-button
              :pressed="happiness === 'Happy'"
              :variant="happiness === 'Happy' ? 'info' : 'primary'"
              size="md"
              class="shadow-none"
              @click="happiness = 'Happy'"
            >
              <v-icon icon="smile" scale="2" /> Happy
            </b-button>
            <b-button
              :pressed="happiness === 'Fine'"
              :variant="happiness === 'Fine' ? 'info' : 'white'"
              size="md"
              class="shadow-none"
              @click="happiness = 'Fine'"
            >
              <v-icon icon="meh" scale="2" color="grey" /> Fine
            </b-button>
            <b-button
              :pressed="happiness === 'Unhappy'"
              :variant="happiness === 'Unhappy' ? 'info' : 'danger'"
              size="md"
              class="shadow-none"
              @click="happiness = 'Unhappy'"
            >
              <v-icon icon="frown" scale="2" /> Sad
            </b-button>
          </b-button-group>
        </div>
        <NoticeMessage
          v-if="happiness !== null && type === 'Taken'"
          class="mt-2"
        >
          You can use the thumbs up/down buttons above to say how things went
          with other freeglers.
        </NoticeMessage>
        <div>
          <label class="mt-4 strong"> It went well/badly because: </label>
          <b-form-textarea
            v-model="comments"
            rows="3"
            max-rows="6"
            class="border-primary mt-1"
          />
          <div class="text-muted small mt-2">
            <span
              v-if="
                happiness === null ||
                happiness === 'Happy' ||
                happiness === 'Fine'
              "
            >
              <v-icon icon="globe-europe" /> Your comments may be public
            </span>
            <span v-if="happiness === 'Unhappy'">
              <v-icon icon="lock" /> Your comments will only go to our
              volunteers
            </span>
          </div>
        </div>
      </div>
      <NoticeMessage
        v-if="message.availableinitially > 1 && left > 0"
        variant="warning"
      >
        There will still be some left. If you're giving them all away now,
        please adjust the numbers above.
      </NoticeMessage>
    </template>
    <template #footer>
      <div>
        <div class="d-flex flex-wrap justify-content-end">
          <b-button variant="secondary" @click="cancel"> Cancel </b-button>
          <SpinButton
            variant="primary"
            icon-name="save"
            :label="buttonLabel"
            class="ml-2"
            :disabled="type === 'Taken' && !tookUsers.length"
            @handle="submit"
          />
        </div>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useMessageStore } from '../stores/message'
import OutcomeBy from './OutcomeBy'
import SpinButton from './SpinButton'
import NoticeMessage from '~/components/NoticeMessage'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  takenBy: {
    type: Object,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['hidden'])

const messageStore = useMessageStore()
const { modal, hide } = useOurModal()

const { $bus } = useNuxtApp()

const happiness = ref(null)
const comments = ref(null)
const tookUsers = ref([])
const chooseError = ref(false)
const submittedWithNoSelectedUser = ref(false)
const completionMessage = ref(null)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const left = computed(() => {
  let leftVal = message.value.availablenow ? message.value.availablenow : 1

  for (const u of tookUsers.value) {
    if (u.userid >= 0) {
      leftVal -= u.count
    }
  }

  return leftVal
})

const showCompletion = computed(() => {
  // We show for taken/received only when there are none left.
  return (
    props.type === 'Withdrawn' ||
    message.value.availableinitially === 1 ||
    left.value === 0
  )
})

const otherRepliers = computed(() => {
  const ret = []

  if (message.value?.replies) {
    message.value.replies.forEach((u) => {
      if (u.userid > 0) {
        let found = false

        for (const t of tookUsers.value) {
          if (t.userid === u.userid) {
            found = true
            break
          }
        }

        if (!found) {
          ret.push({
            userid: u.userid,
            displayname: u.displayname,
          })
        }
      }
    })
  }

  return ret
})

const submitDisabled = computed(() => {
  const ret =
    props.type === 'Taken' &&
    message.value.availableinitially === 1 &&
    left.value === 1
  return ret
})

const groupid = computed(() => {
  let ret = null

  if (message.value && message.value.groups && message.value.groups.length) {
    ret = message.value.groups[0].groupid
  }

  return ret
})

const buttonLabel = computed(() => {
  if (!props.type) {
    return 'Submit'
  } else if (props.type === 'Withdrawn') {
    return 'Withdraw'
  } else {
    return 'Mark as ' + props.type.toUpperCase()
  }
})

function took(users) {
  tookUsers.value = users
}

async function submit(callback) {
  if (props.type === 'Taken' && !tookUsers.value.length) {
    callback()
    submittedWithNoSelectedUser.value = true
    return
  } else {
    submittedWithNoSelectedUser.value = false
  }

  let complete = false
  chooseError.value = false

  if (submitDisabled.value) {
    chooseError.value = true
    callback()
  } else {
    if (props.type === 'Withdrawn' || props.type === 'Received') {
      complete = true
    } else {
      complete = left.value === 0

      for (const u of tookUsers.value) {
        if (u.count > 0) {
          await messageStore.addBy(
            message.value.id,
            u.userid > 0 ? u.userid : null,
            u.count
          )
        } else {
          await messageStore.removeBy(
            message.value.id,
            u.userid > 0 ? u.userid : null
          )
        }
      }
    }

    if (complete) {
      // The post is being taken/received.
      await messageStore.update({
        action: 'Outcome',
        id: props.id,
        outcome: props.type,
        happiness: happiness.value,
        comment: comments.value,
        message: completionMessage.value,
      })

      // Refetch the message to ensure the outcome is reflected in the store
      // For withdrawn messages that were pending, the fetch may fail as they get deleted
      try {
        await messageStore.fetch(props.id)
      } catch (error) {
        if (props.type === 'Withdrawn') {
          // Suppress fetch errors for withdrawn messages as they may have been deleted
          console.log(
            'Suppressed fetch error for withdrawn message:',
            error.message
          )
        } else {
          throw error
        }
      }
    }

    callback()
    hide()
  }
}

function onHide() {
  // We're having trouble capturing events from this modal, so use root as a bus.
  $bus.$emit('outcome', {
    groupid: groupid.value,
    outcome: props.type,
  })

  tookUsers.value = []
  happiness.value = null
  emit('hidden')
}

function cancel() {
  tookUsers.value = []
  happiness.value = null
  hide()
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

@include media-breakpoint-down(md) {
  :deep(.maxWidth) {
    max-width: calc(100vw - 16px);
  }
}

:deep(.btn-group .btn) {
  border: 1px solid black;
}
</style>
