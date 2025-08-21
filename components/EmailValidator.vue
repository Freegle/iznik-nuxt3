<template>
  <div class="d-flex flex-column">
    <b-form-group
      :label="label"
      :label-for="uniqueId"
      label-class="mt-0"
      :state="true"
    >
      <VeeForm ref="form" as="">
        <Field
          :id="uniqueId"
          ref="email"
          v-model="currentEmail"
          :rules="validateEmail"
          type="email"
          name="email"
          :class="'email form-control input-' + size + ' ' + inputClass"
          :center="center"
          autocomplete="username email"
          :placeholder="'Email address ' + (required ? '' : '(Optional)')"
        />
        <ErrorMessage name="email" class="text-danger font-weight-bold" />
      </VeeForm>
    </b-form-group>
    <div
      v-if="suggestedDomains && suggestedDomains.length"
      class="text-info small mb-2"
    >
      Did you mean <strong>{{ suggestedDomains[0] }}</strong
      >?
    </div>
    <div
      v-if="
        props.email &&
        props.email.indexOf &&
        props.email.indexOf('privaterelay.appleid.com') !== -1
      "
      class="text-muted small mb-3"
    >
      This means you use your Apple ID to log in.
    </div>
  </div>
</template>
<script setup>
import { Field, ErrorMessage, Form as VeeForm } from 'vee-validate'
import { ref, computed, watch } from 'vue'
import { useDomainStore } from '../stores/domain'
import { uid } from '../composables/useId'
import { useRuntimeConfig } from '#app'
import { EMAIL_REGEX } from '~/constants'

const props = defineProps({
  email: {
    type: String,
    required: false,
    default: null,
  },
  required: {
    type: Boolean,
    required: false,
    default: true,
  },
  center: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: 'lg',
  },
  id: {
    type: String,
    required: false,
    default: '',
  },
  label: {
    type: String,
    required: false,
    default: "What's your email address?",
  },
  inputClass: {
    type: String,
    required: false,
    default: '',
  },
})

const emit = defineEmits(['update:email', 'update:valid'])

// Setup
const domainStore = useDomainStore()
const currentEmail = ref(props.email)
const suggestedDomains = ref([])
const form = ref(null)

// Create a domain validation cache outside of the component instance
const domainValidationCache = new Map()

// Computed properties
const uniqueId = computed(() => {
  return uid('login-')
})

// Watch for prop changes
watch(
  () => props.email,
  (newVal) => {
    currentEmail.value = newVal
  }
)

// Watch for email changes
watch(
  currentEmail,
  async (newVal) => {
    emit('update:email', newVal)

    if (newVal && newVal?.includes('@')) {
      // Ask the server to spot typos in this domain.
      const domain = newVal.substring(newVal.indexOf('@') + 1)

      // Wait for the first dot, as that will be long enough that we don't thrash the server.
      if (domain.includes('.')) {
        suggestedDomains.value = []

        try {
          const ret = await domainStore.fetch({
            domain,
          })

          if (ret && ret.ret === 0) {
            suggestedDomains.value = ret.suggestions
          }
        } catch (error) {
          // Domain suggestion API can legitimately fail (network issues, server problems, etc.)
          // In this case, we simply don't provide suggestions rather than showing an error
          console.log('Domain suggestion API failed:', error.message)
          suggestedDomains.value = []
        }
      }
    }
  },
  { immediate: true }
)

// Methods
function requestGoogleDnsResolve(domain) {
  const url = new URL('https://dns.google/resolve')
  url.search = new URLSearchParams({ name: domain }).toString()
  const abortController = new AbortController()
  const timer = setTimeout(() => abortController.abort(), 10 * 1000)

  return fetch(url, { signal: abortController.signal })
    .then((response) => response.json())
    .finally(() => clearTimeout(timer))
}

async function checkValidDomain(value) {
  let isValidDomain = true
  const domain = value.substring(value.indexOf('@') + 1)

  const runtimeConfig = useRuntimeConfig()
  const userDomain = runtimeConfig.public.USER_DOMAIN

  if (domain?.indexOf(userDomain) !== -1) {
    // Users can't add an email which is for our own domain.
    return false
  }

  try {
    const request = domainValidationCache.has(domain)
      ? domainValidationCache.get(domain)
      : requestGoogleDnsResolve(domain)

    domainValidationCache.set(domain, request)

    const { Status: status } = await request

    isValidDomain = status === 0
  } catch (_) {
    // if something doesn't work with google domain check we ignore this check
  }

  return isValidDomain
}

async function validateEmail(value) {
  console.log('Validating', value)
  if (!value && !props.required) {
    console.log('No value and not required')
    emit('update:valid', true)
    return
  }

  if (!value) {
    console.log('No value')
    emit('update:valid', false)
    return 'Please enter an email address.'
  }

  if (!new RegExp(EMAIL_REGEX).test(value)) {
    console.log('Invalid email')
    emit('update:valid', false)
    return 'Please enter a valid email address.'
  }

  const isValidDomain = await checkValidDomain(value)
  if (isValidDomain) {
    console.log('Valid domain')
  } else {
    console.log('Invalid domain')
  }

  emit('update:valid', isValidDomain)
  return (
    isValidDomain ||
    "Please check your email domain - maybe you've made a typo?"
  )
}

function focus() {
  form.value.validate()
}

// Expose methods to parent components
defineExpose({
  focus,
})
</script>
<style scoped>
.email {
  width: 100%;
  max-width: 480px;
}
</style>
