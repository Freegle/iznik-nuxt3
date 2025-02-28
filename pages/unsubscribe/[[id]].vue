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
<script>
import { buildHead } from '../../composables/useBuildHead'
import { useAuthStore } from '../../stores/auth'
import SpinButton from '~/components/SpinButton'
import EmailValidator from '~/components/EmailValidator'
import { useRoute, useRouter } from '#imports'
const ForgetFailModal = defineAsyncComponent(() =>
  import('~/components/ForgetFailModal')
)
const GroupSelect = defineAsyncComponent(() =>
  import('~/components/GroupSelect.vue')
)
const ConfirmModal = defineAsyncComponent(() =>
  import('~/components/ConfirmModal.vue')
)
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink')
)
const DeletedRestore = defineAsyncComponent(() =>
  import('~/components/DeletedRestore')
)

export default {
  components: {
    SpinButton,
    EmailValidator,
    ForgetFailModal,
    GroupSelect,
    ConfirmModal,
    NoticeMessage,
    ExternalLink,
    DeletedRestore,
  },
  mixins: [buildHead],
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Unsubscribe',
        'Want to leave Freegle?  You can do that from here.'
      )
    )

    const userid = parseInt(route.params.id)
    const confirmed = route.query.confirm

    const authStore = useAuthStore()

    return {
      authStore,
      userid,
      confirmed,
    }
  },
  data() {
    return {
      groupid: null,
      email: null,
      emailValid: false,
      emailSent: false,
      emailProblem: false,
      wrongUser: false,
      left: null,
      unknown: false,
      showForgetFailModal: false,
      showConfirmModal: false,
    }
  },
  computed: {
    groupCount() {
      return this.myGroups.length
    },
  },
  mounted() {
    if (this.confirmed) {
      if (this.userid === this.myid) {
        this.forget()
      } else if (this.myid) {
        this.wrongUser = true
      } else {
        // Almost always this means they've clicked on the same link twice.  Tell them we've removed the account
        // otherwise they'll get confused.
        useRouter().push('/unsubscribe/unsubscribed')
      }
    }
  },
  methods: {
    unsubscribe() {
      if (!this.me) {
        // If we're trying to do this, we must have logged in at some point in the past, even if not on this device
        // and therefore not according to our store.  Set that, which will force us to show the log in rather than
        // sign up variant of the login modal.
        this.authStore.loggedInEver = true
        this.authStore.forceLogin = true
      } else {
        this.showConfirmModal = true
      }
    },
    async leave(callback) {
      if (this.groupid) {
        const groupName = this.myGroup(this.groupid).namedisplay
        await this.authStore.leaveGroup(this.myid, this.groupid)
        this.left = groupName
      }

      this.groupid = 0
      callback()
    },
    async forget() {
      const ret = await this.authStore.forget()

      if (ret) {
        this.unknown = ret?.ret === 2
        this.showForgetFailModal = true
      } else {
        useRouter().push('/unsubscribe/unsubscribed')
      }
    },
    async emailConfirm(callback) {
      if (this.emailValid) {
        const ret = await this.authStore.unsubscribe(this.email.trim())
        this.emailProblem = !ret.worked
        this.unknown = ret.unknown
        this.emailSent = ret.worked
      }

      callback()
    },
  },
}
</script>
