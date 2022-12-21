<template>
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
        <div v-else>
          <h1>Want to leave Freegle?</h1>
          <p>
            We'd love you to stay, but sometimes if you love someone, you have
            to let them go.
          </p>
          <notice-message class="mb-3">
            Too many emails? Don't leave! Go to
            <!-- eslint-disable-next-line-->
            <nuxt-link to="/settings">Settings</nuxt-link>
            and adjust your Email Settings.
          </notice-message>
          <div v-if="loggedIn">
            <div v-if="groupCount" class="mt-2">
              <p>You can leave individual communities:</p>
              <div class="mb-2">
                <GroupSelect v-model="groupid" size="lg" />
                <SpinButton
                  v-if="groupid"
                  variant="primary"
                  name="trash-alt"
                  label="Leave this community"
                  class="mt-2"
                  spinclass="text-white"
                  @click="leave"
                />
              </div>
            </div>
            <NoticeMessage v-if="left" class="mt-2 mb-2" variant="info">
              We've removed you from {{ left }}.
            </NoticeMessage>
            <p>Or you can leave Freegle entirely:</p>
            <b-button
              v-if="!groupid"
              size="lg"
              variant="primary"
              class="mb-2"
              @click="unsubscribe"
            >
              Unsubscribe completely and delete my account
            </b-button>
            <p>If you need help, please mail <SupportLink />.</p>
          </div>
          <div v-else>
            <h4>Please enter your email address</h4>
            <p>We'll email you to confirm.</p>
            <EmailValidator
              v-model:email="email"
              v-model:valid="emailValid"
              label=""
            />
            <SpinButton
              size="lg"
              name="trash-alt"
              variant="primary"
              class="mt-2 mb-2"
              label="Unsubscribe"
              spinclass="text-white"
              :handler="emailConfirm"
            />
            <NoticeMessage v-if="emailSent" variant="primary" class="mt-2 mb-2">
              We've sent you an email to confirm. Please check your email,
              including your spam folder.
            </NoticeMessage>
            <NoticeMessage
              v-else-if="emailProblem"
              variant="warning"
              class="mt-2 mb-2"
            >
              We don't recognise that email address. Please email
              <SupportLink /> and they'll help you out.
            </NoticeMessage>
          </div>
        </div>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
    <ConfirmModal
      ref="confirm"
      title="Permanently delete your account?"
      message="<p>This will delete all your personal data, chats and community memberships.</p><p><strong>It's permanent - you can't undo it or get your data back.</strong></p><p>If you just want to leave one community, please <em>Cancel</em> and go to Settings.</p>"
      @confirm="forget"
    />
    <ForgetFailModal ref="forgetfail" />
  </div>
</template>
<script>
import SpinButton from '../../components/SpinButton'
import EmailValidator from '../../components/EmailValidator'
import { buildHead } from '../../composables/useBuildHead'
import { useAuthStore } from '../../stores/auth'
import { useRoute, useRouter } from '#imports'
import ForgetFailModal from '~/components/ForgetFailModal'
const GroupSelect = () => import('~/components/GroupSelect.vue')
const ConfirmModal = () => import('~/components/ConfirmModal.vue')
const NoticeMessage = () => import('~/components/NoticeMessage')
const ExternalLink = () => import('~/components/ExternalLink')

export default {
  components: {
    SpinButton,
    EmailValidator,
    ForgetFailModal,
    GroupSelect,
    ConfirmModal,
    NoticeMessage,
    ExternalLink,
  },
  mixins: [buildHead],
  setup() {
    const route = useRoute()
    const userid = parseInt(route.params.id)
    const confirmed = route.query.confirm

    const authStore = useAuthStore()

    useHead(
      buildHead(
        'Unsubscribe',
        'Want to leave Freegle?  You can do that from here.'
      )
    )

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
        this.$refs.confirm.show()
      }
    },
    async leave() {
      if (this.groupid) {
        const groupName = this.myGroup(this.groupid).namedisplay
        await this.authStore.leaveGroup(this.myid, this.groupid)
        this.left = groupName
      }

      this.groupid = 0
    },
    async forget() {
      const ret = await this.authStore.forget()

      if (ret) {
        this.$refs.forgetfail.show()
      } else {
        useRouter().push('/unsubscribe/unsubscribed')
      }
    },
    async emailConfirm() {
      if (this.emailValid) {
        const ret = await this.authStore.unsubscribe({
          email: this.email.trim(),
        })

        if (ret.ret === 0) {
          this.emailSent = true
        } else {
          this.emailProblem = true
        }
      }
    },
  },
}
</script>
