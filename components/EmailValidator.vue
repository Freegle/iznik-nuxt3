<template>
  <div class="d-flex flex-column">
    <b-form-group
      :label="label"
      label-for="email"
      label-class="mt-0"
      :state="true"
    >
      <Field
        ref="email"
        v-model="currentEmail"
        :rules="validateEmail"
        type="email"
        name="email"
        :class="'email form-control input-' + size"
        :center="center"
        autocomplete="username email"
        :placeholder="'Email address ' + (required ? '' : '(Optional)')"
      />
      <ErrorMessage name="email" class="text-danger font-weight-bold" />
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
import { Field, ErrorMessage } from 'vee-validate'
import { useDomainStore } from '../stores/domain'
import { ref } from '#imports'
import { EMAIL_REGEX } from '~/constants'

export default {
  components: { Field, ErrorMessage },
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
      async handler(newVal) {
        if (newVal && newVal.includes('@')) {
          // Ask the server to spot typos in this domain.
          const domain = newVal.substring(newVal.indexOf('@') + 1)

          // Wait for the first dot, as that will be long enough that we don't thrash the server.
          if (domain.includes('.')) {
            this.suggestedDomains = []

            const ret = await this.domainStore.fetch({
              domain,
            })

            if (ret && ret.ret === 0) {
              this.suggestedDomains = ret.suggestions
            }
          }
        }

        this.$emit('update:email', newVal)
        const validate = await this.$refs.email?.validate()
        if (validate) {
          this.$emit('update:valid', validate.valid)
        }
      },
    },
  },
  methods: {
    validateEmail(value) {
      if (!value && !this.required) {
        return true
      }

      if (!value) {
        return 'Please enter an email address.'
      }

      if (!new RegExp(EMAIL_REGEX).test(value)) {
        return 'Please enter a valid email address.'
      }

      return true
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
