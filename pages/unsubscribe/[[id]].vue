<template>
  <client-only>
    <div>
      <b-row class="m-0">
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
