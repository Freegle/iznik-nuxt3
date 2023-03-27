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
        <b-alert variant="danger" :model-value="error">
          {{ error }}
        </b-alert>
        <b-alert variant="warning" :model-value="response">
          We've sent you a link to log in. If you don't see it, please check
          your spam folder!
        </b-alert>
        <EmailValidator
          ref="email"
          v-model:email="email"
          v-model:valid="emailValid"
          size="lg"
        />
        <SpinButton
          v-if="emailValid && !response"
          name="envelope"
          spinclass="success"
          variant="primary"
          size="lg"
          :handler="mail"
          label="Mail login link"
          class="mb-2"
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
const ExternalLink = () => import('~/components/ExternalLink')

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
      email: null,
      emailValid: false,
      response: false,
    }
  },
  mounted() {
    if (this.me) {
      this.$router.push('/')
    }
  },
  methods: {
    async mail() {
      const res = await this.authStore.lostPassword(this.email)

      if (res.data.ret === 0) {
        this.response = true
      } else {
        this.error = res.data.status
      }
    },
  },
}
</script>
