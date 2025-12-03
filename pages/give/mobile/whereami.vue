<template>
  <div class="app-give-whereami" :class="{ 'has-sticky-ad': stickyAdRendered }">
    <!-- Main content -->
    <div class="app-content">
      <h1 class="page-title">Now, tell us where it is</h1>
      <p class="page-subtitle">
        We'll use this to show your offer to people nearby. Don't worry, we
        won't give other people your postcode.
      </p>

      <div class="form-section">
        <PostCode
          :value="initialPostcode"
          :no-store="false"
          @selected="postcodeSelect"
          @cleared="postcodeClear"
        />
      </div>

      <div v-if="!closed && postcodeValid" class="form-section">
        <label class="form-label">Your local community:</label>
        <ComposeGroup />
      </div>

      <div v-if="postcodeValid && noGroups" class="no-groups-notice">
        <NoticeMessage variant="info">
          We're really sorry, but there are no communities near there. If you'd
          like to start one, please
          <ExternalLink href="mailto:newgroups@ilovefreegle.org">
            get in touch!
          </ExternalLink>
        </NoticeMessage>
      </div>

      <!-- Email section for logged out users -->
      <div v-if="!loggedIn && postcodeValid && !noGroups" class="form-section">
        <h2 class="section-title">Your email address</h2>
        <p class="section-subtitle">
          We need your email address to let you know when you have replies. We
          won't give your email to anyone else.
        </p>
        <EmailValidator
          v-model:email="email"
          v-model:valid="emailValid"
          class="email-validator"
        />
        <EmailBelongsToSomeoneElse
          v-if="emailValid && emailBelongsToSomeoneElse"
          class="mt-2"
          :theirs="email"
        />
        <p class="terms-text">
          You will get emails from us, which you can control or turn off from
          Settings. Read
          <nuxt-link no-prefetch target="_blank" to="/terms">
            Terms of Use
          </nuxt-link>
          and
          <nuxt-link no-prefetch target="_blank" to="/privacy">
            Privacy
          </nuxt-link>
          for details.
        </p>
      </div>
    </div>

    <!-- Footer with Freegle it button -->
    <div class="app-footer" :class="{ 'has-sticky-ad': stickyAdRendered }">
      <b-button
        v-if="canSubmit"
        variant="primary"
        size="lg"
        class="w-100"
        :disabled="submitting"
        @click="submitOffer"
      >
        <span v-if="submitting">Posting...</span>
        <span v-else>Freegle it! <v-icon icon="angle-double-right" /></span>
      </b-button>
      <b-button v-else variant="secondary" size="lg" class="w-100" disabled>
        {{
          !postcodeValid
            ? 'Enter postcode to continue'
            : 'Enter email to continue'
        }}
      </b-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import PostCode from '~/components/PostCode.vue'
import ComposeGroup from '~/components/ComposeGroup.vue'
import NoticeMessage from '~/components/NoticeMessage.vue'
import ExternalLink from '~/components/ExternalLink.vue'
import EmailValidator from '~/components/EmailValidator.vue'
import EmailBelongsToSomeoneElse from '~/components/EmailBelongsToSomeoneElse.vue'
import { useComposeStore } from '~/stores/compose'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import {
  setup,
  postcodeSelect,
  postcodeClear,
  freegleIt,
} from '~/composables/useCompose'

const router = useRouter()
const composeStore = useComposeStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const miscStore = useMiscStore()

// Check if sticky ad is rendered
const stickyAdRendered = computed(() => miscStore.stickyAdRendered)

// Get store state
const { email } = storeToRefs(composeStore)

// Local state
const emailValid = ref(false)
const emailBelongsToSomeoneElse = ref(false)

// Get setup data from composable
const {
  initialPostcode,
  postcodeValid,
  noGroups,
  closed,
  submitting,
  loggedIn,
  emailIsntOurs,
} = await setup('Offer')

// Can submit if postcode is valid, group not closed, no group issues, and either logged in or email is valid
const canSubmit = computed(() => {
  if (!postcodeValid.value || closed.value || noGroups.value) {
    return false
  }
  if (loggedIn.value) {
    return true
  }
  return emailValid.value && !emailBelongsToSomeoneElse.value
})

// Reset email belongs to someone else flag when email changes
watch(email, () => {
  emailBelongsToSomeoneElse.value = false
})

async function submitOffer() {
  emailBelongsToSomeoneElse.value = false

  if (emailIsntOurs.value) {
    // Need to check if it's ok to use
    const inuse = await userStore.emailIsInUse(email.value)

    if (inuse) {
      if (!loggedIn.value) {
        // User is not logged in and the email belongs to an existing account.
        // Force them to log in rather than showing the merge dialog.
        authStore.forceLogin = true
        return
      }
      // User is logged in but trying to use an email from a different account.
      // Show the merge dialog.
      emailBelongsToSomeoneElse.value = true
      return
    }
  }

  // Pass skipDeadline flag since we already collected deadline info in options page
  await freegleIt('Offer', router, { skipDeadline: true })
}
</script>

<style scoped lang="scss">
@import 'assets/css/sticky-banner.scss';

.app-give-whereami {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  padding-bottom: 80px;

  &.has-sticky-ad {
    padding-bottom: calc(80px + $sticky-banner-height-mobile);

    @media (min-height: $mobile-tall) {
      padding-bottom: calc(80px + $sticky-banner-height-mobile-tall);
    }
  }
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  text-align: center;
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #212529;
}

.no-groups-notice {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #212529;
}

.section-subtitle {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.email-validator {
  margin-bottom: 0.5rem;
}

.terms-text {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 1rem;
  line-height: 1.4;

  a {
    color: #28a745;
  }
}

.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: #fff;
  z-index: 100;

  &.has-sticky-ad {
    bottom: $sticky-banner-height-mobile;

    @media (min-height: $mobile-tall) {
      bottom: $sticky-banner-height-mobile-tall;
    }
  }
}

// Center the PostCode component
:deep(.d-flex) {
  justify-content: center;
}
</style>
