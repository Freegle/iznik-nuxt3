<template>
  <div>
    <div v-if="!fromme" class="grey p-2">
      <EmailValidator
        v-if="!me"
        v-model:email="email"
        v-model:valid="emailValid"
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
              v-model="reply"
              name="reply"
              :rules="validateReply"
              as="textarea"
              rows="3"
              max-rows="8"
              class="border border-success w-100"
            />
            <Field
              v-if="message.type == 'Wanted'"
              :id="'replytomessage-' + message.id"
              v-model="reply"
              name="reply"
              :rules="validateReply"
              as="textarea"
              rows="3"
              max-rows="8"
              class="flex-grow-1 w-100"
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
              v-model="collect"
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
    </div>
    <hr />
    <div class="d-flex justify-content-between">
      <div class="pr-2 w-50">
        <b-button variant="secondary" size="lg" block @click="close">
          Close
        </b-button>
      </div>
      <div
        v-if="!fromme && !me?.deleted"
        class="pl-2 w-50 justify-content-end d-flex"
      >
        <SpinButton
          v-if="!me"
          variant="primary"
          size="lg"
          done-icon=""
          icon-name="angle-double-right"
          :disabled="disableSend"
          iconlast
          @handle="registerOrSend"
        >
          Send <span class="d-none d-md-inline">your</span> reply
        </SpinButton>
        <SpinButton
          v-else
          variant="primary"
          size="lg"
          done-icon=""
          icon-name="angle-double-right"
          :disabled="disableSend"
          iconlast
          @handle="sendReply"
        >
          Send <span class="d-none d-md-inline">your</span> reply
        </SpinButton>
      </div>
    </div>
    <b-modal
      v-if="showNewUser"
      id="newUserModal"
      ref="newUserModal"
      scrollable
      ok-only
      ok-title="Close and Continue"
      @hide="sendReply(null)"
    >
      <template #title>
        <h2>Welcome to Freegle!</h2>
      </template>
      <NewUserInfo :password="newUserPassword" />
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
  getCurrentInstance,
} from 'vue'
import { storeToRefs } from 'pinia'
import { useMessageStore } from '../stores/message'
import { useAuthStore } from '../stores/auth'
import { useReplyStore } from '../stores/reply'
import { milesAway } from '../composables/useDistance'
import { useMe } from '~/composables/useMe'
import { useReplyToPost } from '~/composables/useReplyToPost'
import EmailValidator from '~/components/EmailValidator'
import NewUserInfo from '~/components/NewUserInfo'
import ChatButton from '~/components/ChatButton'
import SpinButton from '~/components/SpinButton.vue'
import NoticeMessage from '~/components/NoticeMessage'
import MessageDeadline from '~/components/MessageDeadline'
import { FAR_AWAY } from '~/constants'

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
const authStore = useAuthStore()
const replyStore = useReplyStore()
const { me, myid, myGroups, fetchMe } = useMe()
const { loggedInEver, forceLogin } = storeToRefs(authStore)
const instance = getCurrentInstance()

// References
const email = ref(null)
const emailValid = ref(false)
const form = ref(null)
const newUserModal = ref(null)
const replyToPostChatButton = ref(null)
const breakpoint = ref(null)

// Data
const reply = ref(null)
const collect = ref(null)
const replying = ref(false)
const showNewUser = ref(false)
const newUserPassword = ref(null)
const pendingReply = ref(false)

// Fetch the message data
await messageStore.fetch(props.id)

// Use the replyToPost composable
const message = computed(() => {
  return messageStore?.byId(props.id)
})

const milesaway = computed(() => {
  return milesAway(me?.lat, me?.lng, message.value?.lat, message.value?.lng)
})

const disableSend = computed(() => {
  return replying.value
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

// Watch for changes in login state
watch(me, (newVal, oldVal) => {
  console.log('Login change', newVal, oldVal)
  if (!oldVal && newVal && reply.value) {
    // We have now logged in - resume our send.
    console.log('Resume send')
    sendReply()
  }
})

// Watch for chat button ref to become available when we have a pending reply
watch(replyToPostChatButton, async (newVal) => {
  if (newVal && pendingReply.value) {
    console.log('Chat button ref now available, executing pending reply')
    pendingReply.value = false

    const { replyToPost: composableReplyToPost } = useReplyToPost()
    const replySent = await composableReplyToPost(newVal)
    if (replySent) {
      sent()
    }
  }
})

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

async function registerOrSend(callback) {
  if (!me && !emailValid.value) {
    email.value?.focus()
  }

  // We've got a reply and an email address. Maybe the email address is a registered user, maybe it's new. If
  // it's a registered user then we want to force them to log in.
  //
  // We attempt to register the user. If the user already exists, then we'll be told about that as an error.
  console.log('Register or send', email.value)
  const validate = await form.value.validate()

  if (validate.valid) {
    try {
      const ret = await instance.proxy.$api.user.add(email.value, false)

      console.log('Returned', ret)
      if (ret.ret === 0 && ret.password) {
        // We registered a new user and logged in.
        loggedInEver.value = true

        await fetchMe(true)

        // Show the new user modal.
        newUserPassword.value = ret.password
        showNewUser.value = true

        await nextTick()
        callback()

        // Now that we are logged in, we can reply.
        newUserModal.value?.show()

        // Once the modal is closed, we will send the reply.
      } else {
        // If anything else happens, then we call sendReply which will force us to log in. Then the watch will
        // spot that we're logged in and trigger the send, so we don't need to do that here.
        console.log('Failed to register - force login', ret)
        callback()
        forceLogin.value = true
      }
    } catch (e) {
      // Probably an existing user. Force ourselves to log in as above.
      console.log('Register exception, force login', e.message)
      callback()
      forceLogin.value = true
    }
  } else {
    callback()
  }
}

async function sendReply(callback) {
  console.log('sendReply', reply.value)
  const validate = await form.value.validate()
  let called = false

  if (validate.valid) {
    if (reply.value) {
      // Save the reply
      replyStore.replyMsgId = props.id
      replyStore.replyMessage = reply.value

      if (collect.value) {
        replyStore.replyMessage +=
          '\r\n\r\nPossible collection times: ' + collect.value
      }

      replyStore.replyingAt = Date.now()
      console.log(
        'State',
        replyStore.replyMsgId,
        replyStore.replyMessage,
        replyStore.replyingAt
      )

      if (myid.value) {
        // We have several things to do:
        // - join a group if need be (doesn't matter which)
        // - post our reply
        // - show/go to the open the popup chat so they see what happened
        replying.value = true
        let found = false
        let tojoin = null

        // We shouldn't need to fetch, but we've seen a Sentry issue where the message groups are not valid.
        const msg = await messageStore.fetch(props.id, true)

        if (msg?.groups) {
          for (const messageGroup of msg.groups) {
            tojoin = messageGroup.groupid
            Object.keys(myGroups.value).forEach((key) => {
              const group = myGroups.value[key]

              if (messageGroup.groupid === group.id) {
                found = true
              }
            })
          }

          if (!found) {
            // Not currently a member.
            await authStore.joinGroup(myid.value, tojoin, false)
          }

          // Now we can send the reply via chat.
          await nextTick()
          if (callback) {
            callback()
            called = true
          }

          // Check if chat button ref is available, if not set pending flag for watch to handle
          if (replyToPostChatButton.value) {
            const { replyToPost: composableReplyToPost } = useReplyToPost()
            const replySent = await composableReplyToPost(
              replyToPostChatButton.value
            )
            if (replySent) {
              sent()
            }
          } else {
            console.log(
              'Chat button ref not available yet, setting pending flag'
            )
            pendingReply.value = true
          }
        }
      } else {
        // We're not logged in yet. We need to force a log in. Once that completes then either the watch in here
        // or default.vue will spot we have a reply to send and make it happen.
        console.log('Force login')
        forceLogin.value = true
      }
    }
  }

  if (!called && callback) {
    callback()
  }
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
