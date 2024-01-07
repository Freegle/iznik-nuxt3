<template>
  <div>
    <b-row class="m-0">
      <b-col cols="12" lg="6" offset-lg="3" class="bg-white">
        <h1>Forgotten your password?</h1>
        <p>
          If you usually log in using Facebook, Google or Yahoo, then you don't
          use a password - just click those buttons.
        </p>
        <p>
          But if you usually log in with your email address and a password you
          set up for Freegle, then enter your email address and we'll mail you a
          link so that you can log in.
        </p>
        <b-alert variant="warning" :model-value="worked">
          We've sent you a link to log in. If you don't see it, please check
          your spam folder!
        </b-alert>
        <b-alert variant="danger" :model-value="error">
          Something went wrong. If this happens again, please contact
          <ExternalLink href="mailto:support@ilovefreegle.org"
            >support@ilovefreegle.org</ExternalLink
          >.
        </b-alert>
        <b-alert variant="danger" :model-value="unknown">
          We don't know that email address. If you have trouble finding your
          account, please mail
          <ExternalLink href="mailto:support@ilovefreegle.org"
            >support@ilovefreegle.org</ExternalLink
          >.
        </b-alert>
        <EmailValidator
          ref="email"
          v-model:email="email"
          v-model:valid="emailValid"
          size="lg"
        />
        <SpinButton
          v-if="emailValid && !worked"
          icon-name="envelope"
          variant="primary"
          size="lg"
          label="Mail login link"
          class="mb-2"
          @handle="mail"
        />
        <p>
          <!-- eslint-disable-next-line -->
          If you have trouble, you can also contact <ExternalLink href="mailto:support@ilovefreegle.org">support@ilovefreegle.org</ExternalLink>.
        </p>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import SpinButton from '~/components/SpinButton'
import EmailValidator from '~/components/EmailValidator'
import { buildHead } from '~/composables/useBuildHead'
import { useAuthStore } from '~/stores/auth'
const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink')
)

export default {
  components: {
    SpinButton,
    EmailValidator,
    ExternalLink,
  },
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    const authStore = useAuthStore()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Lost Password',
        "Lost your password?  We'll help you log back in."
      )
    )

    return {
      authStore,
    }
  },
  data() {
    return {
      error: null,
      worked: false,
      unknown: false,
      email: null,
      emailValid: false,
    }
  },
  mounted() {
    if (this.me) {
      this.$router.push('/')
    }
  },
  methods: {
    async mail(callback) {
      this.error = null
      this.worked = false
      this.unknown = false

      const ret = await this.authStore.lostPassword(this.email)

      this.error = !ret.worked && !ret.unknown
      this.unknown = ret.unknown
      this.worked = ret.worked
      callback()
    },
  },
}
</script>
