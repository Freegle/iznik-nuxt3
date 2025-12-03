<template>
  <client-only>
    <div class="unsubscribe-page">
      <!-- Mobile Layout -->
      <div class="d-block d-md-none mobile-unsubscribe">
        <NoticeMessage v-if="wrongUser" class="m-3">
          <p>
            You've tried to unsubscribe from one user, but you're logged in as
            another. Please log out and try again.
          </p>
          <p>
            <!-- eslint-disable-next-line -->
            If you need help, please mail <ExternalLink href="mailto:support@ilovefreegle.org">our Support Volunteers</ExternalLink>.
          </p>
        </NoticeMessage>
        <DeletedRestore v-else-if="me?.deleted" :bottom="false" class="m-3" />
        <div v-else class="mobile-content">
          <div class="mobile-header">
            <v-icon icon="heart-broken" class="mobile-header__icon" />
            <h1 class="mobile-header__title">Want to leave?</h1>
            <p class="mobile-header__subtitle">
              We'd love you to stay, but sometimes you have to let go.
            </p>
          </div>

          <div v-if="loggedIn" class="mobile-body">
            <div v-if="groupCount" class="mobile-section">
              <p class="mobile-section__label">Leave a specific community:</p>
              <GroupSelect v-model="groupid" size="lg" class="mb-2" />
              <SpinButton
                v-if="groupid"
                variant="primary"
                icon-name="trash-alt"
                label="Leave this community"
                class="w-100"
                @handle="leave"
              />
            </div>

            <NoticeMessage v-if="left" class="mb-3" variant="info">
              We've removed you from {{ left }}.
            </NoticeMessage>

            <div v-if="!groupid" class="mobile-section">
              <p class="mobile-section__label">Or choose an option:</p>
              <div class="mobile-actions">
                <NuxtLink to="/settings" class="mobile-btn mobile-btn--primary">
                  <v-icon icon="cog" class="me-2" />
                  Get fewer emails
                </NuxtLink>
                <button
                  class="mobile-btn mobile-btn--danger"
                  @click="unsubscribe"
                >
                  <v-icon icon="trash-alt" class="me-2" />
                  Leave completely
                </button>
              </div>
            </div>

            <p class="mobile-help">Need help? Contact <SupportLink />.</p>
          </div>

          <div v-else class="mobile-body">
            <div class="mobile-section">
              <p class="mobile-section__label">Enter your email to continue:</p>
              <EmailValidator
                v-model:email="email"
                v-model:valid="emailValid"
                label=""
                class="mb-3"
              />
              <div class="mobile-actions">
                <NuxtLink to="/settings" class="mobile-btn mobile-btn--primary">
                  <v-icon icon="cog" class="me-2" />
                  Get fewer emails
                </NuxtLink>
                <SpinButton
                  icon-name="trash-alt"
                  variant="danger"
                  class="mobile-btn mobile-btn--danger"
                  label="Leave completely"
                  @handle="emailConfirm"
                />
              </div>
            </div>

            <NoticeMessage v-if="emailSent" variant="primary" class="mt-3">
              We've sent you an email to confirm. Please check your inbox and
              spam folder.
            </NoticeMessage>
            <NoticeMessage
              v-else-if="emailProblem"
              variant="warning"
              class="mt-3"
            >
              <span v-if="unknown">We don't recognise that email.</span>
              <span v-else>Something went wrong.</span>
              Please email <SupportLink />.
            </NoticeMessage>
          </div>
        </div>
      </div>

      <!-- Desktop Layout -->
      <b-row class="m-0 d-none d-md-flex">
        <b-col cols="0" md="3" />
        <b-col cols="12" md="6" class="bg-white pt-2">
          <NoticeMessage v-if="wrongUser">
            <p>
              You've tried to unsubscribe from one user, but you're logged in as
              another. Please log out and try again.
            </p>
            <p>
              <!-- eslint-disable-next-line -->
            If you need help, please mail <ExternalLink href="mailto:support@ilovefreegle.org">our Support Volunteers</ExternalLink>.
            </p>
          </NoticeMessage>
          <DeletedRestore v-else-if="me?.deleted" :bottom="false" />
          <div v-else>
            <h1>Want to leave Freegle?</h1>
            <p>
              We'd love you to stay, but sometimes if you love someone, you have
              to let them go.
            </p>
            <div v-if="loggedIn">
              <div v-if="groupCount" class="mt-2">
                <p>You can leave individual communities:</p>
                <div class="mb-2">
                  <GroupSelect v-model="groupid" size="lg" />
                  <SpinButton
                    v-if="groupid"
                    variant="primary"
                    icon-name="trash-alt"
                    label="Leave this community"
                    class="mt-2"
                    @handle="leave"
                  />
                </div>
              </div>
              <NoticeMessage v-if="left" class="mt-2 mb-2" variant="info">
                We've removed you from {{ left }}.
              </NoticeMessage>
              <template v-if="!groupid">
                <p>
                  You can get fewer emails and stay a member, or you can leave
                  Freegle completely:
                </p>
                <div class="d-flex justify-content-between flex-wrap">
                  <nuxt-link to="/settings" no-prefetch>
                    <b-button size="lg" variant="primary" class="mb-2 mr-2">
                      <v-icon icon="cog" />
                      <span class="ml-1"> Get fewer emails </span>
                    </b-button>
                  </nuxt-link>
                  <b-button
                    size="lg"
                    variant="danger"
                    class="mb-2"
                    @click="unsubscribe"
                  >
                    <v-icon icon="trash-alt" />
                    <span class="ml-1"> Leave Freegle completely </span>
                  </b-button>
                </div>
              </template>
              <p>If you need help, please mail <SupportLink />.</p>
            </div>
            <div v-else>
              <h4>Please enter your email address</h4>
              <p>We'll email you to confirm that you want to leave Freegle.</p>
              <EmailValidator
                v-model:email="email"
                v-model:valid="emailValid"
                label=""
                class="mb-2"
              />
              <div class="d-flex justify-content-between flex-wrap mt-4">
                <nuxt-link to="/settings" no-prefetch class="mb-2 mr-2">
                  <b-button size="lg" variant="primary">
                    <v-icon icon="cog" />
                    <span class="ml-1"> Get fewer emails </span>
                  </b-button>
                </nuxt-link>
                <SpinButton
                  size="lg"
                  icon-name="trash-alt"
                  variant="danger"
                  class="mb-2"
                  label="Leave Freegle completely"
                  @handle="emailConfirm"
                />
              </div>
              <NoticeMessage
                v-if="emailSent"
                variant="primary"
                class="mt-2 mb-2"
              >
                We've sent you an email to confirm. Please check your email,
                including your spam folder.
              </NoticeMessage>
              <NoticeMessage
                v-else-if="emailProblem"
                variant="warning"
                class="mt-2 mb-2"
              >
                <span v-if="unknown"
                  >We don't recognise that email address.</span
                >
                <span v-else>Something went wrong.</span>
                Please email
                <SupportLink /> and they'll help you out.
              </NoticeMessage>
            </div>
          </div>
        </b-col>
        <b-col cols="0" md="3" />
      </b-row>
      <ConfirmModal
        v-if="showConfirmModal"
        title="Permanently delete your account?"
        message="<p>This will delete all your personal data, chats and community memberships.</p><p><strong>It's permanent - you can't undo it or get your data back.</strong></p><p>If you just want to leave one community, please <em>Cancel</em> and select the community from the drop-down list.</p>"
        @confirm="forget"
        @hidden="showConfirmModal = false"
      />
      <ForgetFailModal
        v-if="showForgetFailModal"
        @hidden="showForgetFailModal = false"
      />
    </div>
  </client-only>
</template>
<script setup>
import {
  ref,
  computed,
  onMounted,
  defineAsyncComponent,
  useRoute,
  useRouter,
  useHead,
  useRuntimeConfig,
} from '#imports'
import { buildHead } from '~/composables/useBuildHead'
import { useAuthStore } from '~/stores/auth'
import SpinButton from '~/components/SpinButton.vue'
import EmailValidator from '~/components/EmailValidator.vue'
import SupportLink from '~/components/SupportLink.vue'
import { useMe } from '~/composables/useMe'

const ForgetFailModal = defineAsyncComponent(() =>
  import('~/components/ForgetFailModal.vue')
)
const GroupSelect = defineAsyncComponent(() =>
  import('~/components/GroupSelect.vue')
)
const ConfirmModal = defineAsyncComponent(() =>
  import('~/components/ConfirmModal.vue')
)
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage.vue')
)
const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink.vue')
)
const DeletedRestore = defineAsyncComponent(() =>
  import('~/components/DeletedRestore.vue')
)

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const authStore = useAuthStore()
const { me, myid, myGroups, myGroup, loggedIn } = useMe()

// Setup head
useHead(
  buildHead(
    route,
    runtimeConfig,
    'Unsubscribe',
    'Want to leave Freegle?  You can do that from here.'
  )
)

// Data properties
const groupid = ref(null)
const email = ref(null)
const emailValid = ref(false)
const emailSent = ref(false)
const emailProblem = ref(false)
const wrongUser = ref(false)
const left = ref(null)
const unknown = ref(false)
const showForgetFailModal = ref(false)
const showConfirmModal = ref(false)

// Route parameters
const userid = parseInt(route.params.id)
const confirmed = route.query.confirm

// Computed properties
const groupCount = computed(() => {
  return myGroups.value.length
})

// Methods
function unsubscribe() {
  if (!me.value) {
    // If we're trying to do this, we must have logged in at some point in the past, even if not on this device
    // and therefore not according to our store. Set that, which will force us to show the log in rather than
    // sign up variant of the login modal.
    authStore.loggedInEver = true
    authStore.forceLogin = true
  } else {
    showConfirmModal.value = true
  }
}

async function leave(callback) {
  if (groupid.value) {
    const groupName = myGroup(groupid.value).namedisplay
    await authStore.leaveGroup(myid.value, groupid.value)
    left.value = groupName
  }

  groupid.value = 0
  callback()
}

async function forget() {
  const ret = await authStore.forget()

  if (ret) {
    unknown.value = ret?.ret === 2
    showForgetFailModal.value = true
  } else {
    router.push('/unsubscribe/unsubscribed')
  }
}

async function emailConfirm(callback) {
  if (emailValid.value) {
    const ret = await authStore.unsubscribe(email.value.trim())
    emailProblem.value = !ret.worked
    unknown.value = ret.unknown
    emailSent.value = ret.worked
  }

  callback()
}

// Lifecycle hooks
onMounted(() => {
  if (confirmed) {
    if (userid === myid.value) {
      forget()
    } else if (myid.value) {
      wrongUser.value = true
    } else {
      // Almost always this means they've clicked on the same link twice. Tell them we've removed the account
      // otherwise they'll get confused.
      router.push('/unsubscribe/unsubscribed')
    }
  }
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'assets/css/_color-vars.scss';

.mobile-unsubscribe {
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    $color-red--bg-gradient 0%,
    $color-white 50%
  );
}

.mobile-content {
  padding: 1rem;
}

.mobile-header {
  text-align: center;
  padding: 1.5rem 0 1rem;

  &__icon {
    font-size: 2.5rem;
    color: $color-red;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: $color-black;
    margin: 0 0 0.5rem 0;
  }

  &__subtitle {
    font-size: 0.9rem;
    color: $color-gray--darker;
    margin: 0;
  }
}

.mobile-body {
  background: $color-white;
  padding: 1rem;
  box-shadow: 0 1px 4px $color-black-opacity-08;
}

.mobile-section {
  margin-bottom: 1rem;

  &__label {
    font-size: 0.85rem;
    font-weight: 600;
    color: $color-gray--dark;
    margin-bottom: 0.5rem;
  }
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  :deep(.btn) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.mobile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  &--primary {
    background: $colour-success;
    color: white;

    &:hover {
      background: darken($colour-success, 5%);
      color: white;
    }
  }

  &--danger {
    background: $color-red;
    color: white;

    &:hover {
      background: darken($color-red, 5%);
      color: white;
    }
  }
}

.mobile-help {
  font-size: 0.8rem;
  color: $color-gray--dark;
  text-align: center;
  margin: 1rem 0 0 0;
}
</style>
