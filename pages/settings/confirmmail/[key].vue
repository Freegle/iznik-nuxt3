<template>
  <client-only v-if="me">
    <div>
      <b-row class="m-0">
        <b-col cols="0" md="3" class="d-none d-md-block" />
        <b-col cols="12" md="6" class="p-0">
          <b-modal
            id="successmodal"
            v-model="succeeded"
            scrollable
            title="Verification Succeeded"
            no-stacking
          >
            <template #default>
              <b-row>
                <b-col>
                  <p>
                    Thanks - we've verified your email address. Happy freegling!
                  </p>
                  <p>
                    Don't forget to check your spam folder - sometimes mails end
                    up in there.
                  </p>
                </b-col>
              </b-row>
            </template>
            <template #footer>
              <b-button variant="primary" @click="closed"> Close </b-button>
            </template>
          </b-modal>
          <b-modal
            id="failuremodal"
            v-model="failed"
            scrollable
            title="Verification Failed"
            no-stacking
          >
            <template #default>
              <b-row>
                <b-col>
                  <p>Sorry - we failed to verify your email address.</p>
                  <p>
                    <strong>Please try again.</strong> Resend verification mail
                    to:
                  </p>
                  <b-form-input
                    v-model="email"
                    placeholder="Enter your email"
                    class="mb-2"
                  />
                  <p>
                    <!-- eslint-disable-next-line -->
                  If you keep having trouble, please mail <ExternalLink href="mailto:support@ilovefreegle.org">support@ilovefreegle.org</ExternalLink>.
                  </p>
                </b-col>
              </b-row>
            </template>
            <template #footer>
              <b-button variant="white" @click="closed"> Cancel </b-button>
              <b-button variant="primary" @click="resend">
                Resend verification mail
              </b-button>
            </template>
          </b-modal>
          <b-modal
            id="retrymodal"
            v-model="resent"
            scrollable
            title="Verification Sent"
            no-stacking
          >
            <template #default>
              <b-row>
                <b-col>
                  <p>
                    We've resent the mail. Please check your email, including
                    your spam folders
                  </p>
                  <p>
                    If you have multiple verification mails, please click on the
                    most recent.
                  </p>
                  <p>
                    <!-- eslint-disable-next-line -->
                  If you keep having trouble, please mail <ExternalLink href="mailto:support@ilovefreegle.org">support@ilovefreegle.org</ExternalLink>.
                  </p>
                </b-col>
              </b-row>
            </template>
            <template #footer>
              <b-button variant="primary" @click="closed"> Close </b-button>
            </template>
          </b-modal>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
    </div>
  </client-only>
</template>
<script>
import { useAuthStore } from '~/stores/auth'
import { buildHead } from '~/composables/useBuildHead'
import { useRoute, useRouter } from '#imports'
const ExternalLink = () => import('~/components/ExternalLink')

export default {
  components: { ExternalLink },
  setup() {
    definePageMeta({
      layout: 'login',
    })
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    const key = route.params.key

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Confirm Email',
        'Confirm your email address so that we send mails to the right place.'
      )
    )

    const authStore = useAuthStore()

    return {
      authStore,
      key,
    }
  },
  data() {
    return {
      succeeded: false,
      failed: false,
      resent: false,
      email: null,
    }
  },
  async mounted() {
    this.email = this.me?.email

    try {
      await this.authStore.saveAndGet({
        key: this.key,
      })

      this.succeeded = true
    } catch (e) {
      this.failed = true
    }
  },
  methods: {
    closed() {
      const router = useRouter()
      router.push('/chitchat')
    },
    async resend() {
      const data = await this.authStore.saveEmail({
        email: this.me.email,
      })

      if (data && (data.ret === 0 || data.ret === 10)) {
        this.resent = true
      }
    },
  },
}
</script>
