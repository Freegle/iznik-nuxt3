<template>
  <div>
    <b-row class="m-0">
      <b-col cols="12" lg="6" offset-lg="3" class="bg-white">
        <h1>Forgotten your password?</h1>
        <p>
          If you usually log in using Facebook or Google, then you don't use a
          password - just click those buttons.
        </p>
        <p>
          If you usually log in with your email address and a password you set
          up for Freegle, then enter your email address and we'll mail you a
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
          v-model:email="email"
          v-model:valid="emailValid"
          size="lg"
        />
        <p class="mt-3">
          <strong>Used to sign in with Yahoo?</strong> We no longer support
          logging in with a Yahoo button, but you can log in with your Yahoo
          email and a Freegle password. You can use this page to get a login
          link and set a new password for your account.
        </p>
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
<script setup>
import { useRoute, useRouter } from 'vue-router'
import {
  ref,
  onMounted,
  defineAsyncComponent,
  useRuntimeConfig,
  useHead,
} from '#imports'
import SpinButton from '~/components/SpinButton'
import EmailValidator from '~/components/EmailValidator'
import { buildHead } from '~/composables/useBuildHead'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'

const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink')
)

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { me } = useMe()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Lost Password',
    "Lost your password?  We'll help you log back in."
  )
)

const error = ref(null)
const worked = ref(false)
const unknown = ref(false)
const email = ref(null)
const emailValid = ref(false)

async function mail(callback) {
  error.value = null
  worked.value = false
  unknown.value = false

  const ret = await authStore.lostPassword(email.value)

  error.value = !ret.worked && !ret.unknown
  unknown.value = ret.unknown
  worked.value = ret.worked
  callback()
}

onMounted(() => {
  if (me.value) {
    router.push('/')
  }
})
</script>
