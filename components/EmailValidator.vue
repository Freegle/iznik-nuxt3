<template>
  <div class="d-flex flex-column">
    <b-form-group
      :label="label"
      label-for="email"
      label-class="mt-0"
      :state="true"
    >
      <VeeForm ref="form" as="">
        <Field
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
      v-if="email && email.indexOf('privaterelay.appleid.com') !== -1"
      class="text-muted small mb-3"
    >
      This means you use your Apple ID to log in.
    </div>
  </div>
</template>
<script>
import { Field, ErrorMessage, Form as VeeForm } from 'vee-validate'
import { useDomainStore } from '../stores/domain'
import { ref } from '#imports'
import { EMAIL_REGEX } from '~/constants'

const domainValidationCache = new Map()

export default {
  components: { Field, ErrorMessage, VeeForm },
  props: {
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
  },
  setup(props) {
    const domainStore = useDomainStore()
    const currentEmail = ref(props.email)

    return {
      domainStore,
      currentEmail,
    }
  },
  data() {
    return {
      suggestedDomains: [],
    }
  },
  watch: {
    email(newVal) {
      this.currentEmail = newVal
    },
    currentEmail: {
      immediate: true,
      handler(newVal) {
        this.$emit('update:email', newVal)

        if (newVal && newVal.includes('@')) {
          // Ask the server to spot typos in this domain.
          const domain = newVal.substring(newVal.indexOf('@') + 1)

          // Wait for the first dot, as that will be long enough that we don't thrash the server.
          if (domain.includes('.')) {
            this.suggestedDomains = []
          }
        }
      },
    },
  },
  methods: {
    requestGoogleDnsResolve(domain) {
      const url = new URL('https://dns.google/resolve')
      url.search = new URLSearchParams({ name: domain }).toString()
      const abortController = new AbortController()
      const timer = setTimeout(() => abortController.abort(), 10 * 1000)

      return fetch(url, { signal: abortController.signal })
        .then((response) => response.json())
        .finally(() => clearTimeout(timer))
    },
    async checkValidDomain(value) {
      let isValidDomain = true
      const domain = value.substring(value.indexOf('@') + 1)

      try {
        const request = domainValidationCache.has(domain)
          ? domainValidationCache.get(domain)
          : this.requestGoogleDnsResolve(domain)

        domainValidationCache.set(domain, request)

        const { Status: status } = await request

        isValidDomain = status === 0
      } catch (_) {
        // if something doesn't work with google domain check we ignore this check
      }
      return isValidDomain
    },
    async validateEmail(value) {
      if (!value && !this.required) {
        this.$emit('update:valid', true)
        return
      }

      if (!value) {
        this.$emit('update:valid', false)
        return 'Please enter an email address.'
      }

      if (!new RegExp(EMAIL_REGEX).test(value)) {
        this.$emit('update:valid', false)
        return 'Please enter a valid email address.'
      }

      const isValidDomain = await this.checkValidDomain(value)
      this.$emit('update:valid', isValidDomain)
      return (
        isValidDomain ||
        "Please check your email domain - maybe you've made a typo?"
      )
    },
  },
}
</script>
<style scoped>
.email {
  width: 100%;
  max-width: 480px;
}
</style>
