<template>
  <client-only>
    <div class="whoami-page">
      <!-- Debug info for Playwright tests -->
      <div
        class="debug-compose-state"
        style="display: none"
        :data-message-count="composeStore.messages?.length || 0"
        :data-has-api="!!composeStore.$api"
        :data-postcode-id="composeStore.postcode?.id || 'none'"
        :data-message-valid="messageValid"
        :data-postcode-valid="postcodeValid"
        :data-logged-in="loggedIn"
        :data-email-valid="emailValid"
      />

      <!-- Compact progress stepper -->
      <div class="stepper-container">
        <WizardProgressCompact :active-stage="4" />
      </div>

      <!-- Main content -->
      <div class="whoami-content">
        <div class="whoami-card">
          <h1 class="whoami-title">Finally, your email address</h1>

          <PostLoggedInEmail v-if="loggedIn" class="logged-in-section" />

          <template v-else>
            <p class="whoami-subtitle">
              We need your email address to let you know when you have replies.
              We won't give your email to anyone else.
            </p>

            <div class="email-input-wrapper">
              <EmailValidator
                v-model:email="email"
                v-model:valid="emailValid"
                center
              />
            </div>

            <EmailBelongsToSomeoneElse
              v-if="emailValid && emailBelongsToSomeoneElse"
              class="mt-3"
              :theirs="email"
            />

            <p class="terms-text">
              You will get emails from us, which you can control or turn off
              from Settings. Read
              <nuxt-link no-prefetch target="_blank" to="/terms">
                Terms of Use
              </nuxt-link>
              and
              <nuxt-link no-prefetch target="_blank" to="/privacy">
                Privacy
              </nuxt-link>
              for details.
            </p>
          </template>
        </div>

        <!-- Error messages -->
        <NoticeMessage v-if="notAllowed" variant="danger" class="mt-3">
          You are not allowed to post on this community.
        </NoticeMessage>
        <NoticeMessage
          v-else-if="unvalidatedEmail"
          variant="danger"
          class="mt-3"
        >
          You tried to post using an email address which has not yet been
          validated. Please check your mailbox (including spam) and validate the
          email, then try again.
        </NoticeMessage>
        <NoticeMessage v-else-if="wentWrong" variant="danger" class="mt-3">
          Something went wrong. Please try again, and if this keeps happening
          then contact
          <ExternalLink href="mailto:support@ilovefreegle.org">
            support </ExternalLink
          >.
        </NoticeMessage>

        <!-- Submit button -->
        <div class="next-section">
          <div class="next-container">
            <b-button
              v-if="canSubmit"
              variant="primary"
              size="lg"
              class="next-btn"
              :disabled="submitting"
              @click="next"
            >
              <span v-if="submitting">Posting...</span>
              <span v-else
                >Freegle it! <v-icon icon="angle-double-right"
              /></span>
            </b-button>
            <b-button
              v-else
              variant="secondary"
              size="lg"
              class="next-btn"
              disabled
            >
              Enter email to continue
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter, useHead, useRuntimeConfig } from '#imports'
import WizardProgressCompact from '~/components/WizardProgressCompact.vue'
import NoticeMessage from '~/components/NoticeMessage.vue'
import ExternalLink from '~/components/ExternalLink.vue'
import EmailValidator from '~/components/EmailValidator.vue'
import EmailBelongsToSomeoneElse from '~/components/EmailBelongsToSomeoneElse.vue'
import PostLoggedInEmail from '~/components/PostLoggedInEmail.vue'
import { useComposeStore } from '~/stores/compose'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { setup, freegleIt } from '~/composables/useCompose'
import { buildHead } from '~/composables/useBuildHead'
import { useMe } from '~/composables/useMe'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const composeStore = useComposeStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const { me } = useMe()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'OFFER',
    'OFFER something to people nearby and see who wants it'
  )
)

// Get store state
const { email } = storeToRefs(composeStore)

// Local state
const emailValid = ref(false)
const emailBelongsToSomeoneElse = ref(false)

// Get setup data from composable
const {
  messageValid,
  postcodeValid,
  loggedIn,
  emailIsntOurs,
  submitting,
  notAllowed,
  unvalidatedEmail,
  wentWrong,
} = await setup('Offer')

// Can submit if logged in, or email is valid and not belonging to someone else
const canSubmit = computed(() => {
  if (loggedIn.value) {
    return true
  }
  return emailValid.value && !emailBelongsToSomeoneElse.value
})

// Reset email belongs to someone else flag when email changes
watch(email, () => {
  emailBelongsToSomeoneElse.value = false
})

onMounted(() => {
  if (loggedIn.value) {
    email.value = me.value?.email
    emailValid.value = email.value?.length > 0
  }
})

async function next() {
  emailBelongsToSomeoneElse.value = false

  try {
    if (emailIsntOurs.value) {
      const inuse = await userStore.emailIsInUse(email.value)

      if (!inuse) {
        await freegleIt('Offer', router, { skipDeadline: true })
      } else if (!loggedIn.value) {
        authStore.forceLogin = true
      } else {
        emailBelongsToSomeoneElse.value = true
      }
    } else {
      await freegleIt('Offer', router, { skipDeadline: true })
    }
  } catch (e) {
    console.error('Error in next():', e)
    wentWrong.value = true
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.whoami-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.stepper-container {
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @include media-breakpoint-up(lg) {
    padding: 1.5rem 2rem;
  }
}

.whoami-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;

  @include media-breakpoint-up(lg) {
    padding: 2rem;
  }
}

.whoami-card {
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.whoami-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-green-background;
  margin-bottom: 0.5rem;
  text-align: center;
}

.whoami-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 1.5rem;
}

.logged-in-section {
  text-align: center;
  padding: 1rem 0;
}

.email-input-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.terms-text {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 1.5rem;
  line-height: 1.4;
  text-align: center;

  a {
    color: $color-green-background;
  }
}

.next-section {
  margin-top: 2rem;
  margin-bottom: 3rem;
}

.next-container {
  display: flex;
  justify-content: center;
}

.next-btn {
  min-width: 280px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
