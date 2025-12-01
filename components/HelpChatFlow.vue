<template>
  <div class="help-chat">
    <div class="chat-container">
      <!-- Chat messages -->
      <div ref="messagesContainer" class="chat-messages">
        <TransitionGroup name="message">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['chat-message', msg.type]"
          >
            <div v-if="msg.type === 'bot'" class="bot-avatar">
              <v-icon icon="heart" />
            </div>
            <div class="message-content">
              <p v-if="msg.text" class="message-text">{{ msg.text }}</p>
              <div v-if="msg.options" class="message-options">
                <button
                  v-for="opt in msg.options"
                  :key="opt.id"
                  class="option-btn"
                  @click="selectOption(opt)"
                >
                  <v-icon v-if="opt.icon" :icon="opt.icon" class="me-2" />
                  {{ opt.label }}
                </button>
              </div>
              <div v-if="msg.component" class="message-component">
                <component :is="msg.component" v-bind="msg.componentProps" />
              </div>
              <div v-if="msg.link" class="message-link">
                <nuxt-link :to="msg.link.to" class="help-link">
                  <v-icon
                    v-if="msg.link.icon"
                    :icon="msg.link.icon"
                    class="me-1"
                  />
                  {{ msg.link.text }}
                </nuxt-link>
              </div>
              <div v-if="msg.action" class="message-action">
                <button class="action-btn" @click="msg.action.handler">
                  <v-icon
                    v-if="msg.action.icon"
                    :icon="msg.action.icon"
                    class="me-1"
                  />
                  {{ msg.action.text }}
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
        <div v-if="typing" class="chat-message bot typing">
          <div class="bot-avatar">
            <v-icon icon="heart" />
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset button -->
    <div v-if="messages.length > 1" class="chat-reset">
      <button class="reset-btn" @click="reset">
        <v-icon icon="redo" class="me-1" /> Start over
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const emit = defineEmits(['contact-volunteers', 'show-faq'])

const messagesContainer = ref(null)
const messages = ref([])
const typing = ref(false)

const helpTree = {
  start: {
    text: "Hi! I'm here to help. What do you need assistance with?",
    options: [
      { id: 'posting', label: 'Posting items', icon: 'gift' },
      { id: 'emails', label: 'Emails & notifications', icon: 'envelope' },
      { id: 'account', label: 'My account', icon: 'user' },
      { id: 'other', label: 'Something else', icon: 'question-circle' },
    ],
  },
  posting: {
    text: 'What would you like to know about posting?',
    options: [
      {
        id: 'posting-taken',
        label: 'Mark item as TAKEN/RECEIVED',
        icon: 'check',
      },
      { id: 'posting-repost', label: 'Repost an item', icon: 'redo' },
      { id: 'posting-edit', label: 'Edit my post', icon: 'pen' },
      { id: 'posting-back', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'posting-taken': {
    text: 'To mark your item as TAKEN or RECEIVED:',
    followUp: {
      text: "Go to My Posts, find your post, and click the 'Mark as TAKEN' or 'Mark as RECEIVED' button.",
      link: { to: '/myposts', text: 'Go to My Posts', icon: 'arrow-right' },
    },
  },
  'posting-repost': {
    text: 'Items without replies auto-repost. If you have replies, use the Repost button in My Posts.',
    link: { to: '/myposts', text: 'Go to My Posts', icon: 'arrow-right' },
  },
  'posting-edit': {
    text: 'To edit your post, go to My Posts, click on your post, then use the Edit button.',
    link: { to: '/myposts', text: 'Go to My Posts', icon: 'arrow-right' },
  },
  'posting-back': {
    goto: 'start',
  },
  emails: {
    text: 'What about emails?',
    options: [
      { id: 'emails-fewer', label: 'Get fewer emails', icon: 'envelope' },
      {
        id: 'emails-unsubscribe',
        label: 'Unsubscribe completely',
        icon: 'times',
      },
      { id: 'emails-change', label: 'Change email address', icon: 'pen' },
      { id: 'emails-back', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'emails-fewer': {
    text: "You can reduce emails in Settings under 'Mail Settings'.",
    link: { to: '/settings', text: 'Go to Settings', icon: 'arrow-right' },
  },
  'emails-unsubscribe': {
    text: 'Sorry to see you go! You can unsubscribe here.',
    link: { to: '/unsubscribe', text: 'Unsubscribe', icon: 'arrow-right' },
  },
  'emails-change': {
    text: "Change your email in Settings under 'Personal Information'.",
    link: { to: '/settings', text: 'Go to Settings', icon: 'arrow-right' },
  },
  'emails-back': {
    goto: 'start',
  },
  account: {
    text: 'What about your account?',
    options: [
      { id: 'account-data', label: 'My data & privacy', icon: 'shield-alt' },
      { id: 'account-settings', label: 'Account settings', icon: 'cog' },
      { id: 'account-back', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'account-data': {
    text: 'You can view and download your data, and read our privacy policy.',
    link: { to: '/mydata', text: 'View my data', icon: 'arrow-right' },
  },
  'account-settings': {
    text: 'Manage your account settings here.',
    link: { to: '/settings', text: 'Go to Settings', icon: 'arrow-right' },
  },
  'account-back': {
    goto: 'start',
  },
  other: {
    text: 'I can help with a few more things:',
    options: [
      { id: 'other-app', label: 'Mobile app', icon: 'mobile-alt' },
      { id: 'other-volunteer', label: 'Volunteering', icon: 'hands-helping' },
      { id: 'other-contact', label: 'Contact a human', icon: 'comment' },
      { id: 'other-faq', label: 'Browse all FAQs', icon: 'list' },
      { id: 'other-back', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'other-app': {
    text: "We have free apps for iOS and Android! Search 'Freegle' in your app store.",
    options: [{ id: 'start', label: 'Ask something else', icon: 'arrow-left' }],
  },
  'other-volunteer': {
    text: 'Freegle is run by volunteers. You can help by becoming a supporter or joining your local team.',
    link: { to: '/donate', text: 'Become a supporter', icon: 'heart' },
  },
  'other-contact': {
    text: "I'll connect you with our community volunteers.",
    action: {
      text: 'Contact volunteers',
      icon: 'comment',
      handler: () => emit('contact-volunteers'),
    },
  },
  'other-faq': {
    text: 'Here are all our frequently asked questions:',
    action: {
      text: 'Show all FAQs',
      icon: 'list',
      handler: () => emit('show-faq'),
    },
  },
  'other-back': {
    goto: 'start',
  },
}

async function addBotMessage(nodeId) {
  const node = helpTree[nodeId]
  if (!node) return

  if (node.goto) {
    await addBotMessage(node.goto)
    return
  }

  typing.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))
  typing.value = false

  const msg = { type: 'bot' }

  if (node.text) msg.text = node.text
  if (node.options) msg.options = node.options
  if (node.link) msg.link = node.link
  if (node.action) msg.action = node.action
  if (node.component) {
    msg.component = node.component
    msg.componentProps = node.componentProps
  }

  messages.value.push(msg)

  if (node.followUp) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    typing.value = true
    await new Promise((resolve) => setTimeout(resolve, 500))
    typing.value = false

    const followMsg = { type: 'bot' }
    if (node.followUp.text) followMsg.text = node.followUp.text
    if (node.followUp.link) followMsg.link = node.followUp.link
    if (node.followUp.action) followMsg.action = node.followUp.action
    messages.value.push(followMsg)
  }

  await nextTick()
  scrollToBottom()
}

function selectOption(opt) {
  // Add user message
  messages.value.push({
    type: 'user',
    text: opt.label,
  })

  // Process the selection
  addBotMessage(opt.id)
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function reset() {
  messages.value = []
  addBotMessage('start')
}

onMounted(() => {
  addBotMessage('start')
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.help-chat {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-container {
  max-height: 500px;
  overflow: hidden;
}

.chat-messages {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      background: $color-green-background;
      color: white;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.bot {
    .message-content {
      background: $color-gray--lighter;
      border-radius: 18px 18px 18px 4px;
    }
  }

  &.typing {
    .message-content {
      padding: 16px 20px;
    }
  }
}

.bot-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: $color-green-background;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
}

.message-text {
  margin: 0;
  line-height: 1.5;
}

.message-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.option-btn {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: white;
  border: 1px solid $color-gray--light;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: $color-green-background;
    color: white;
    border-color: $color-green-background;
  }
}

.message-link {
  margin-top: 12px;
}

.help-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: $color-blue--bright;
  color: white;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: darken($color-blue--bright, 10%);
    color: white;
  }
}

.message-action {
  margin-top: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: $color-green-background;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: darken($color-green-background, 10%);
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;

  span {
    width: 8px;
    height: 8px;
    background: $color-gray--dark;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

.chat-reset {
  padding: 12px 20px;
  border-top: 1px solid $color-gray--lighter;
  text-align: center;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid $color-gray--light;
  border-radius: 16px;
  font-size: 0.8rem;
  color: $color-gray--dark;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $color-gray--lighter;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
