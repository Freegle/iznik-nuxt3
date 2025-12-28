<template>
  <div>
    <div v-if="!fromme" class="grey p-2">
      <EmailValidator
        v-if="!me"
        ref="emailValidatorRef"
        v-model:email="stateMachine.email.value"
        v-model:valid="stateMachine.emailValid.value"
        size="lg"
        label="Your email address:"
        class="test-email-reply-validator"
      />
      <NoticeMessage
        v-if="milesaway > faraway && message.type === 'Offer'"
        variant="danger"
        class="mt-2 mb-1"
      >
        This item is {{ milesaway }} miles away. Before replying, are you sure
        you can collect from there?
      </NoticeMessage>
      <NoticeMessage v-if="me?.deleted" variant="danger" class="mt-2 mb-1">
        You can't reply until you've decided whether to restore your account.
      </NoticeMessage>
      <div v-else>
        <VeeForm ref="form">
          <b-form-group
            class="flex-grow-1"
            label="Your reply:"
            :label-for="'replytomessage-' + message.id"
            :description="
              message.type === 'Offer'
                ? 'Explain why you\'d like it.  It\'s not always first come first served.  If appropriate, ask if it\'s working. Always be polite.'
                : 'Can you help?  If you have what they\'re looking for, let them know.'
            "
          >
            <div class="d-flex flex-wrap">
              <div v-if="message.deliverypossible" class="mb-2 mr-2">
                <b-badge
                  v-b-tooltip="
                    'They have said they may be able to deliver.  No guarantees - it needs to be convenient for them - but you can ask.'
                  "
                  variant="info"
                  ><v-icon icon="info-circle" /> Delivery may be
                  possible</b-badge
                >
              </div>
              <MessageDeadline :id="id" class="mb-2" />
            </div>
            <Field
              v-if="message.type == 'Offer'"
              :id="'replytomessage-' + message.id"
              v-model="stateMachine.replyText.value"
              name="reply"
              :rules="validateReply"
              as="textarea"
              rows="3"
              max-rows="8"
              class="border border-success w-100"
              @input="stateMachine.startTyping"
            />
            <Field
              v-if="message.type == 'Wanted'"
              :id="'replytomessage-' + message.id"
              v-model="stateMachine.replyText.value"
              name="reply"
              :rules="validateReply"
              as="textarea"
              rows="3"
              max-rows="8"
              class="flex-grow-1 w-100"
              @input="stateMachine.startTyping"
            />
          </b-form-group>
          <ErrorMessage name="reply" class="text-danger font-weight-bold" />
          <b-form-group
            v-if="message.type == 'Offer'"
            class="mt-1"
            label="When could you collect?"
            :label-for="'replytomessage2-' + message.id"
            description="Suggest days and times you could collect if you're chosen.  Your plans might change but this speeds up making arrangements."
          >
            <Field
              :id="'replytomessage2-' + message.id"
              v-model="stateMachine.collectText.value"
              name="collect"
              :rules="validateCollect"
              class="border border-success w-100"
              as="textarea"
              rows="2"
              max-rows="2"
            />
          </b-form-group>
          <ErrorMessage name="collect" class="text-danger font-weight-bold" />
        </VeeForm>
        <p v-if="me && !alreadyAMember" class="text--small text-muted">
          You're not yet a member of this community; we'll join you. Change
          emails or leave communities from
          <em>Settings</em>.
        </p>
      </div>
      <div v-if="!me">
        <NewFreegler class="mt-2" />
      </div>
      <NoticeMessage
        v-if="stateMachine.error.value"
        variant="danger"
        class="mt-2"
      >
        {{ stateMachine.error.value }}
        <b-button
          variant="link"
          size="sm"
          class="p-0 ml-2"
          @click="stateMachine.retry"
        >
          Try again
        </b-button>
      </NoticeMessage>
    </div>
    <hr />
    <div class="d-flex justify-content-between">
      <div class="pr-2 w-50">
        <b-button variant="secondary" size="lg" block @click="close">
          Cancel
        </b-button>
      </div>
      <div
        v-if="!fromme && !me?.deleted"
        class="pl-2 w-50 justify-content-end d-flex"
      >
        <SpinButton
          variant="primary"
          size="lg"
          done-icon=""
          icon-name="angle-double-right"
          :disabled="
            !stateMachine.canSend.value || stateMachine.isProcessing.value
          "
          iconlast
          @handle="handleSend"
        >
          Send <span class="d-none d-md-inline">your</span> reply
        </SpinButton>
      </div>
    </div>
    <b-modal
      v-if="stateMachine.showWelcomeModal.value"
      id="newUserModal"
      ref="newUserModal"
      scrollable
      ok-only
      ok-title="Close and Continue"
      @ok="handleNewUserModalOk"
    >
      <template #title>
        <h2>Welcome to Freegle!</h2>
      </template>
      <NewUserInfo :password="stateMachine.newUserPassword.value" />
    </b-modal>
    <span ref="breakpoint" class="d-inline d-sm-none" />
    <div class="d-none">
      <ChatButton ref="replyToPostChatButton" :userid="replyToUser" />
    </div>
  </div>
</template>
<script setup>
import { Form as VeeForm, Field, ErrorMessage } from 'vee-validate'
import {
  defineAsyncComponent,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
} from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '~/stores/message'
import { milesAway } from '~/composables/useDistance'
import { useMe } from '~/composables/useMe'
import {
  useReplyStateMachine,
  ReplyState,
} from '~/composables/useReplyStateMachine'
import { action } from '~/composables/useClientLog'
import EmailValidator from '~/components/EmailValidator'
import NewUserInfo from '~/components/NewUserInfo'
import ChatButton from '~/components/ChatButton'
import SpinButton from '~/components/SpinButton.vue'
import NoticeMessage from '~/components/NoticeMessage'
import MessageDeadline from '~/components/MessageDeadline'
import { FAR_AWAY } from '~/constants'

const route = useRoute()

const NewFreegler = defineAsyncComponent(() =>
  import('~/components/NewFreegler')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  messageOverride: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['close', 'sent'])

const faraway = FAR_AWAY

const messageStore = useMessageStore()
const { me, myid, myGroups } = useMe()

// Initialize state machine
const stateMachine = useReplyStateMachine(props.id)

// References
const form = ref(null)
const newUserModal = ref(null)
const replyToPostChatButton = ref(null)
const breakpoint = ref(null)
const emailValidatorRef = ref(null)

// Fetch the message data
await messageStore.fetch(props.id)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const milesaway = computed(() => {
  return milesAway(me?.lat, me?.lng, message.value?.lat, message.value?.lng)
})

const fromme = computed(() => {
  return message.value?.fromuser === myid.value
})

const alreadyAMember = computed(() => {
  let found = false

  if (message.value?.groups) {
    for (const messageGroup of message.value.groups) {
      Object.keys(myGroups.value).forEach((key) => {
        const group = myGroups.value[key]

        if (messageGroup.groupid === group.id) {
          found = true
        }
      })
    }
  }

  return found
})

const replyToUser = computed(() => {
  return message.value?.fromuser
})

// Watch for login state changes to resume authentication flow
watch(me, (newVal, oldVal) => {
  console.log('[MessageReplySection] Login state changed', {
    newVal: !!newVal,
    oldVal: !!oldVal,
  })
  if (
    !oldVal &&
    newVal &&
    stateMachine.state.value === ReplyState.AUTHENTICATING
  ) {
    console.log(
      '[MessageReplySection] User logged in during authentication - resuming'
    )
    stateMachine.onLoginSuccess()
  }
})

// Watch for chat button ref becoming available
watch(replyToPostChatButton, (newVal) => {
  if (newVal) {
    console.log('[MessageReplySection] Chat button ref now available')
    stateMachine.setRefs({ chatButton: newVal })
  }
})

// Watch for form ref
watch(form, (newVal) => {
  if (newVal) {
    console.log('[MessageReplySection] Form ref now available')
    stateMachine.setRefs({ form: newVal })
  }
})

// Determine reply source from route for analytics.
function getReplySource() {
  const path = route.path
  const query = route.query || {}

  // Check for email digest/newsletter links.
  if (query.src === 'digest' || query.utm_source === 'digest') {
    return 'email_digest'
  }
  if (query.src === 'newsletter' || query.utm_source === 'newsletter') {
    return 'email_newsletter'
  }
  if (query.src || query.utm_source) {
    return `email_${query.src || query.utm_source}`
  }

  // Determine from route path.
  if (path.startsWith('/browse')) {
    return 'browse_page'
  }
  if (path.startsWith('/explore')) {
    return 'explore_page'
  }
  if (path.match(/^\/message\/\d+/)) {
    return 'message_page'
  }
  if (path.startsWith('/find')) {
    return 'find_page'
  }

  return 'unknown'
}

// Set refs on mount
onMounted(() => {
  console.log('[MessageReplySection] Component mounted, setting refs')
  stateMachine.setRefs({
    form: form.value,
    chatButton: replyToPostChatButton.value,
    emailValidator: emailValidatorRef.value,
  })

  // Set and log the reply source for analytics.
  const replySource = getReplySource()
  stateMachine.setReplySource(replySource)
  action('reply_section_viewed', {
    message_id: props.id,
    reply_source: replySource,
    message_type: message.value?.type,
    is_logged_in: !!me.value,
    route_path: route.path,
    route_query: JSON.stringify(route.query || {}),
  })
})

// Watch for state machine completion
watch(
  () => stateMachine.isComplete.value,
  (isComplete) => {
    if (isComplete) {
      console.log('[MessageReplySection] Reply flow completed')
      sent()
    }
  }
)

// Watch for welcome modal state to show it
watch(
  () => stateMachine.showWelcomeModal.value,
  async (showModal) => {
    if (showModal) {
      console.log('[MessageReplySection] Showing welcome modal')
      await nextTick()
      newUserModal.value?.show()
    }
  }
)

function validateCollect(value) {
  if (value && value.trim()) {
    return true
  }
  return 'Please suggest some days and times when you could collect.'
}

function validateReply(value) {
  if (!value?.trim()) {
    return 'Please fill out your reply.'
  }

  if (
    message.value?.type === 'Offer' &&
    value &&
    value.length <= 35 &&
    value.toLowerCase().includes('still available')
  ) {
    return (
      "You don't need to ask if things are still available. Just write whatever you " +
      "would have said next - explain why you'd like it and when you could collect."
    )
  }

  return true
}

async function handleSend(callback) {
  console.log('[MessageReplySection] handleSend called')
  // Ensure refs are set before submitting
  stateMachine.setRefs({
    form: form.value,
    chatButton: replyToPostChatButton.value,
    emailValidator: emailValidatorRef.value,
  })
  await stateMachine.submit(callback)
}

function handleNewUserModalOk() {
  console.log('[MessageReplySection] New user modal closed')
  stateMachine.closeWelcomeModal()
}

function close() {
  emit('close')
}

function sent() {
  emit('sent')
}
</script>
<style scoped lang="scss">
.grey {
  background-color: $color-gray--lighter;
}

:deep(.phone) {
  border: 2px solid $color-gray--normal !important;
}

.nobot {
  margin-bottom: 0 !important;
}
</style>
