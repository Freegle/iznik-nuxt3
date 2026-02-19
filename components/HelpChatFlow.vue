<template>
  <div class="help-flow">
    <!-- Breadcrumb trail (at top) -->
    <div v-if="history.length > 0" class="flow-breadcrumb">
      <button class="breadcrumb-btn" @click="goToStart">
        <v-icon icon="home" class="me-1" />Start
      </button>
      <span
        v-for="(item, index) in history"
        :key="index"
        class="breadcrumb-item"
      >
        <v-icon icon="chevron-right" class="breadcrumb-sep" />
        <button class="breadcrumb-btn" @click="goBack(index)">
          {{ item.label }}
        </button>
      </span>
    </div>

    <!-- Header (only on start) -->
    <h2 v-if="currentNodeId === 'start'" class="flow-header">
      How can we help?
    </h2>

    <!-- Current question/answer -->
    <div class="flow-content">
      <div v-if="currentNode" class="flow-card">
        <p v-if="currentNode.text" class="flow-text">{{ currentNode.text }}</p>

        <!-- Options to choose from -->
        <div v-if="currentNode.options" class="flow-options">
          <button
            v-for="opt in currentNode.options"
            :key="opt.id"
            class="flow-option"
            :class="{ 'flow-option--back': opt.id.startsWith('back-') }"
            @click="selectOption(opt)"
          >
            <v-icon v-if="opt.icon" :icon="opt.icon" class="option-icon" />
            <span>{{ opt.label }}</span>
            <v-icon
              v-if="!opt.id.startsWith('back-')"
              icon="chevron-right"
              class="chevron"
            />
          </button>
        </div>

        <!-- Link to another page -->
        <div v-if="currentNode.link" class="flow-link">
          <nuxt-link
            :to="currentNode.link.to"
            class="link-btn"
            @click="onLinkClick(currentNode.link)"
          >
            <v-icon
              v-if="currentNode.link.icon"
              :icon="currentNode.link.icon"
              class="me-2"
            />
            {{ currentNode.link.text }}
          </nuxt-link>
        </div>

        <!-- Action button -->
        <div v-if="currentNode.action" class="flow-action">
          <button class="action-btn" @click="currentNode.action.handler">
            <v-icon
              v-if="currentNode.action.icon"
              :icon="currentNode.action.icon"
              class="me-2"
            />
            {{ currentNode.action.text }}
          </button>
        </div>

        <!-- HTML content for detailed answers -->
        <div
          v-if="currentNode.html"
          class="flow-html"
          v-html="currentNode.html"
        />

        <!-- App download links -->
        <div v-if="currentNode.showAppLinks" class="flow-app-links">
          <div class="app-links">
            <ExternalLink
              href="https://play.google.com/store/apps/details?id=org.ilovefreegle.direct"
            >
              <img src="/en-play-badge.png" alt="Get it on Google Play" />
            </ExternalLink>
            <ExternalLink
              href="https://itunes.apple.com/gb/app/freegle/id970045029?ls=1&mt=8"
            >
              <img
                src="/app-store-black-sm.png"
                alt="Download on the App Store"
              />
            </ExternalLink>
          </div>
          <p class="app-note">
            Available in UK app stores. Android 5.1/iOS 13 or later.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Contact section (separate card) -->
  <div class="contact-wrapper">
    <div class="contact-section">
      <button class="contact-header" @click="toggleContact">
        <v-icon icon="comment" class="contact-icon" />
        <span>Contact volunteers</span>
        <v-icon
          :icon="contactExpanded ? 'chevron-up' : 'chevron-down'"
          class="expand-icon"
        />
      </button>

      <div v-if="contactExpanded" class="contact-options">
        <button
          class="contact-option"
          :class="{ active: contactMode === 'usage' }"
          @click="contactMode = 'usage'"
        >
          <v-icon icon="question-circle" class="option-icon" />
          <span>Help using Freegle</span>
        </button>
        <button
          class="contact-option"
          :class="{ active: contactMode === 'technical' }"
          @click="contactMode = 'technical'"
        >
          <v-icon icon="bug" class="option-icon" />
          <span>A technical problem</span>
        </button>

        <!-- Contact form for usage help -->
        <div v-if="contactMode === 'usage'" class="contact-content">
          <p class="contact-text">
            Your local volunteer team are happy to help with questions about
            using Freegle.
          </p>
          <div v-if="loggedIn" class="contact-card">
            <GroupRememberSelect
              v-model="contactGroupId"
              remember="contactmods"
              class="mb-3"
            />
            <ChatButton
              :groupid="contactGroupId"
              size="md"
              title="Contact community volunteers"
              variant="primary"
            />
          </div>
          <NoticeMessage v-else variant="info">
            Please log in to contact your community volunteers.
          </NoticeMessage>
        </div>

        <!-- Technical support -->
        <div v-if="contactMode === 'technical'" class="contact-content">
          <p class="contact-text">
            For technical problems like bugs or errors, please contact our
            technical support team.
          </p>
          <div class="support-card">
            <SupportLink />
            <p class="support-note">
              Please include details of what you were trying to do and any error
              messages you saw.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import GroupRememberSelect from '~/components/GroupRememberSelect'
import ChatButton from '~/components/ChatButton'
import NoticeMessage from '~/components/NoticeMessage'
import SupportLink from '~/components/SupportLink'
import ExternalLink from '~/components/ExternalLink'
import { useAuthStore } from '~/stores/auth'
import { useClientLog } from '~/composables/useClientLog'

const authStore = useAuthStore()
const loggedIn = computed(() => authStore.user !== null)
const { action: logAction } = useClientLog()
const contactGroupId = ref(null)

// Contact section state (separate from main flow)
const contactExpanded = ref(false)
const contactMode = ref(null)

function toggleContact() {
  contactExpanded.value = !contactExpanded.value
  if (!contactExpanded.value) {
    contactMode.value = null
  }
}

const currentNodeId = ref('start')
const history = ref([])

const helpTree = {
  start: {
    options: [
      { id: 'posting', label: 'Posting items', icon: 'gift' },
      { id: 'replying', label: 'Replying to posts', icon: 'comments' },
      { id: 'emails', label: 'Emails & notifications', icon: 'envelope' },
      { id: 'account', label: 'My account', icon: 'user' },
      { id: 'about', label: 'About Freegle', icon: 'info-circle' },
      { id: 'donate', label: 'Can I donate?', icon: 'heart' },
    ],
  },

  // === POSTING ===
  posting: {
    text: 'What about posting?',
    options: [
      {
        id: 'posting-taken',
        label: 'Mark item as TAKEN/RECEIVED',
        icon: 'check',
      },
      { id: 'posting-repost', label: 'Repost an item', icon: 'redo' },
      { id: 'posting-edit', label: 'Edit my post', icon: 'pen' },
      { id: 'posting-choosing', label: 'Choosing who gets it', icon: 'users' },
      {
        id: 'posting-selling',
        label: 'Can I sell freegled items?',
        icon: 'shopping-cart',
      },
      { id: 'back-start', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'posting-taken': {
    text: "To mark your item as TAKEN or RECEIVED, go to My Posts, find your post, and click the 'Mark as TAKEN' or 'Mark as RECEIVED' button. If you have multiple posts, you may need to click the post to expand it first.",
    link: { to: '/myposts', text: 'Go to My Posts', icon: 'arrow-right' },
  },
  'posting-repost': {
    text: "If you've not had any replies, your post will auto-repost. You can see when in My Posts. If you have had replies, use the Repost button there.",
    link: { to: '/myposts', text: 'Go to My Posts', icon: 'arrow-right' },
  },
  'posting-edit': {
    text: 'To edit your post, go to My Posts, click on your post, then use the Edit button.',
    link: { to: '/myposts', text: 'Go to My Posts', icon: 'arrow-right' },
  },
  'posting-choosing': {
    text: "Unless you're in a hurry, it's better to wait and see who replies before choosing. You can see in someone's profile how close they are and their ratings from other freeglers. Some people use first-come-first-served, but you don't have to. It's up to you!",
    options: [
      { id: 'posting', label: 'More posting help', icon: 'arrow-left' },
      { id: 'start', label: 'Start over', icon: 'home' },
    ],
  },
  'posting-selling': {
    text: "Reselling keeps stuff out of landfill too, but please don't sell items you got from Freegle without the agreement of the person who gave them to you.",
    options: [
      { id: 'posting', label: 'More posting help', icon: 'arrow-left' },
      { id: 'start', label: 'Start over', icon: 'home' },
    ],
  },

  // === REPLYING ===
  replying: {
    text: 'What about replying to posts?',
    options: [
      { id: 'replying-how', label: 'How to reply to a post', icon: 'reply' },
      { id: 'replying-withdrawn', label: 'Post was withdrawn', icon: 'times' },
      {
        id: 'replying-no-response',
        label: "Poster hasn't replied",
        icon: 'clock',
      },
      { id: 'back-start', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'replying-how': {
    text: "When you see something you want, click the Reply button on the post. Send a friendly message - many people like to know why you want the item or what you'll use it for.",
    options: [
      { id: 'replying', label: 'More replying help', icon: 'arrow-left' },
      { id: 'start', label: 'Start over', icon: 'home' },
    ],
  },
  'replying-withdrawn': {
    text: 'If a post has been withdrawn, it means the item is no longer available. The poster may have given it to someone else or changed their mind. Keep browsing - new items are posted all the time!',
    options: [
      { id: 'replying', label: 'More replying help', icon: 'arrow-left' },
      { id: 'start', label: 'Start over', icon: 'home' },
    ],
  },
  'replying-no-response': {
    text: "Posters can get lots of replies and may take time to respond. If you haven't heard back after a few days, the item may have gone to someone else. You can check your Chats to see if there's been any response.",
    link: { to: '/chats', text: 'Go to Chats', icon: 'arrow-right' },
  },

  // === EMAILS ===
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
      { id: 'back-start', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'emails-fewer': {
    text: "You can reduce the number and frequency of emails in Settings under 'Mail Settings'. You can choose to get a daily digest instead of individual emails.",
    link: { to: '/settings', text: 'Go to Settings', icon: 'arrow-right' },
  },
  'emails-unsubscribe': {
    text: 'Sorry to see you go! You can unsubscribe from all Freegle emails. If you just want fewer emails, consider changing your mail settings instead.',
    link: { to: '/unsubscribe', text: 'Unsubscribe', icon: 'arrow-right' },
  },
  'emails-change': {
    text: "You can change your email address in Settings under 'Personal Information'.",
    link: { to: '/settings', text: 'Go to Settings', icon: 'arrow-right' },
  },

  // === ACCOUNT ===
  account: {
    text: 'What about your account?',
    options: [
      { id: 'account-data', label: 'My data & privacy', icon: 'shield-alt' },
      { id: 'account-settings', label: 'Account settings', icon: 'cog' },
      { id: 'account-app', label: 'Mobile app', icon: 'mobile-alt' },
      { id: 'back-start', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'account-data': {
    text: 'You can view and download your data, and read our privacy policy. We take your privacy seriously.',
    link: { to: '/mydata', text: 'View my data', icon: 'arrow-right' },
  },
  'account-settings': {
    text: 'Manage your account settings including notifications, email preferences, and personal information.',
    link: { to: '/settings', text: 'Go to Settings', icon: 'arrow-right' },
  },
  'account-app': {
    text: "We have free apps for iOS and Android! Search 'Freegle' in your app store. The app gives you notifications of replies so you don't have to rely on email.",
    showAppLinks: true,
  },

  // === ABOUT FREEGLE ===
  about: {
    text: 'What would you like to know about Freegle?',
    options: [
      { id: 'about-rules', label: 'Rules & guidelines', icon: 'list' },
      {
        id: 'about-integrations',
        label: 'TrashNothing & LoveJunk',
        icon: 'handshake',
      },
      { id: 'about-how', label: 'How Freegle is run', icon: 'users' },
      { id: 'about-volunteer', label: 'Volunteering', icon: 'hands-helping' },
      { id: 'back-start', label: 'Back', icon: 'arrow-left' },
    ],
  },
  'about-rules': {
    text: 'Freegle is about giving and receiving freely. Items must be legal, appropriate, and genuinely free. Be respectful, turn up when you say you will, and let people know if plans change.',
    link: { to: '/terms', text: 'Read full terms', icon: 'arrow-right' },
  },
  'about-integrations': {
    text: "TrashNothing is another reuse platform - we're friends with them! Posts often appear on both sites, and you might get replies from their members. LoveJunk is mainly for paid disposal but also shows some Freegle posts. Treat replies from either just like any other freegler.",
    options: [
      { id: 'about', label: 'More about Freegle', icon: 'arrow-left' },
      { id: 'start', label: 'Start over', icon: 'home' },
    ],
  },
  'about-how': {
    text: 'Freegle is a registered charity run entirely by volunteers. We have no paid staff - every penny donated goes towards keeping the service running.',
    link: { to: '/about', text: 'Learn more about us', icon: 'arrow-right' },
  },
  'about-volunteer': {
    text: 'Freegle is run by volunteers! You can help by becoming a supporter, helping run your local community, or volunteering nationally with publicity, fundraising, graphics, UX, or development.',
    link: { to: '/donate', text: 'Become a supporter', icon: 'heart' },
  },

  // === DONATE (top-level) ===
  donate: {
    text: "If you're able to donate, it helps keep Freegle running. Monthly donations are particularly helpful. We can claim Gift Aid if you're a UK taxpayer.",
    link: { to: '/donate', text: 'Donate to Freegle', icon: 'heart' },
  },

  // === NAVIGATION ===
  'back-start': {
    goto: 'start',
  },
}

const currentNode = computed(() => {
  return helpTree[currentNodeId.value]
})

// Handle goto redirects
watch(
  currentNodeId,
  (newId) => {
    const node = helpTree[newId]
    if (node?.goto) {
      currentNodeId.value = node.goto
      history.value = []
    }
  },
  { immediate: true }
)

function selectOption(opt) {
  logAction('help_option_click', {
    option_id: opt.id,
    option_label: opt.label,
  })

  if (opt.id === 'start') {
    goToStart()
    return
  }

  // Add to history unless going back
  if (!opt.id.startsWith('back-')) {
    history.value.push({ id: currentNodeId.value, label: opt.label })
  }

  currentNodeId.value = opt.id
}

function onLinkClick(link) {
  logAction('help_link_click', {
    link_to: link.to,
    link_text: link.text,
  })
}

function goToStart() {
  currentNodeId.value = 'start'
  history.value = []
}

function goBack(index) {
  const target = history.value[index]
  history.value = history.value.slice(0, index)
  currentNodeId.value = target.id
}
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.help-flow {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.flow-header {
  color: $color-green-background;
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0;
  padding: 1.5rem 1.5rem 0;
  text-align: center;
}

.flow-content {
  padding: 1.5rem;
}

.flow-card {
  min-height: 200px;
}

.flow-text {
  font-size: 1.1rem;
  color: $color-gray--darker;
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.flow-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flow-option {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  background: $color-gray--lighter;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: white;
    border-color: $color-green-background;
    color: $color-green-background;

    .chevron {
      transform: translateX(4px);
    }
  }

  .option-icon {
    width: 20px;
    margin-right: 0.75rem;
    color: $color-green-background;
  }

  span {
    flex: 1;
  }

  .chevron {
    color: $color-gray--dark;
    font-size: 0.8rem;
    transition: transform 0.2s;
  }

  &--back {
    background: transparent;
    border: none;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    color: $color-gray--dark;
    margin-top: 0.5rem;

    .option-icon {
      color: $color-gray--dark;
      width: 16px;
    }

    &:hover {
      background: transparent;
      border: none;
      color: $color-green-background;

      .option-icon {
        color: $color-green-background;
      }
    }
  }
}

.flow-link,
.flow-action {
  margin-top: 1.25rem;
}

.link-btn,
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: $color-green-background;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: darken($color-green-background, 8%);
    color: white;
  }
}

.flow-html {
  margin-top: 1rem;
  line-height: 1.6;
}

.flow-app-links {
  margin-top: 1rem;
}

.app-links {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;

  img {
    height: 40px;
  }
}

.app-note {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-top: 0.5rem;
}

.flow-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.75rem 1.5rem;
  background: $color-gray--lighter;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.85rem;
}

.breadcrumb-btn {
  background: none;
  border: none;
  color: $color-blue--bright;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.breadcrumb-sep {
  color: $color-gray--dark;
  font-size: 0.7rem;
}

.contact-wrapper {
  margin-top: 1rem;
}

.contact-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.contact-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: $color-green-background;

  .contact-icon {
    width: 20px;
    margin-right: 0.75rem;
    color: $color-green-background;
  }

  span {
    flex: 1;
    text-align: left;
  }

  .expand-icon {
    color: $color-gray--dark;
    transition: transform 0.2s;
  }

  &:hover .expand-icon {
    color: $color-green-background;
  }
}

.contact-options {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.contact-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: $color-gray--lighter;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: $color-green-background;
  }

  &.active {
    background: white;
    border-color: $color-green-background;
    color: $color-green-background;
  }

  .option-icon {
    width: 18px;
    margin-right: 0.75rem;
    color: $color-green-background;
  }
}

.contact-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.contact-text {
  font-size: 0.95rem;
  color: $color-gray--darker;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.contact-card,
.support-card {
  padding: 1rem;
  background: $color-gray--lighter;
  border-radius: 8px;
}

.support-note {
  margin-top: 0.75rem;
  margin-bottom: 0;
  font-size: 0.9rem;
  color: $color-gray--dark;
}
</style>
