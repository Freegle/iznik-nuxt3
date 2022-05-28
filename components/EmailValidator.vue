<template>
  <div class="d-flex flex-column">
    <b-form-group :label="label" :label-for="uid" label-class="mt-0">
      <validating-form-input
        :id="uid"
        v-model:valid="emailValid"
        v-model="currentEmail"
        type="email"
        name="email"
        :size="size"
        :min-length="1"
        class="email"
        :validation="emailValidator"
        validation-enabled
        :validation-messages="{
          email: 'Please enter a valid email address.',
        }"
        :center="center"
        autocomplete="username email"
        placeholder="Email address"
      />
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
      This means you use your Apple ID to sign in.
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email as emailValidation } from '@vuelidate/validators'
import { uid } from '../composables/useId'
import ValidatingFormInput from '../components/ValidatingFormInput'
import validationHelpers from '@/mixins/validationHelpers'

export default {
  components: { ValidatingFormInput },
  mixins: [validationHelpers],
  props: {
    email: {
      type: String,
      required: false,
      default: null,
    },
    valid: {
      type: Boolean,
      required: true,
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
    const id = uid('email')

    return {
      uid: id,
      v$: useVuelidate(),
      currentEmail: ref(props.email),
    }
  },
  data() {
    return {
      suggestedDomains: [],
      emailValidator: emailValidation,
      emailValid: false,
    }
  },
  watch: {
    currentEmail: {
      immediate: true,
      async handler(newVal) {
        if (newVal && newVal.includes('@')) {
          // Ask the server to spot typos in this domain.
          const domain = newVal.substring(newVal.indexOf('@') + 1)

          // Wait for the first dot, as that will be long enough that we don't thrash the server.
          if (domain.includes('.')) {
            this.suggestedDomains = []
            const runtimeConfig = useRuntimeConfig()

            const ret = await this.$axios.get(
              runtimeConfig.APIv1 + '/domains',
              {
                params: {
                  domain,
                },
              }
            )

            if (ret && ret.data && ret.data.ret === 0) {
              this.suggestedDomains = ret.data.suggestions
            }
          }
        }

        // This check needs to be here rather than in checkState to ensure the vuelidate has got itself sorted out.
        this.checkState(newVal)
      },
    },
  },
  mounted() {
    this.checkState(this.currentEmail)
  },
  methods: {
    checkState(email) {
      if (email !== this.email) {
        // Emitting a null or '' value does not trigger an update of the prop in the parent.  I don't know whether
        // this is intentional, but the consequence is that the email appears to remain valid.  By emitting a space
        // we at least trigger this component to update and notice that the email is not valid.
        this.$emit('update:email', email ? email.trim() : ' ')

        if (email) {
          this.v$.$touch()

          // Wait for vuelidate to sort itself out.
          this.$nextTick(() => {
            const valid = !this.v$.email.$invalid
            this.$emit('update:valid', valid)
          })
        } else {
          this.v$.$reset()

          // Signal that the email is no longer valid.  The watch doesn't get called to make this happen, so you
          // can end up with an empty email by typing one, then selecting and deleting it.
          this.$emit('update:valid', false)
        }
      }
    },
  },
  validations: {
    email: { required, emailValidation },
  },
}
</script>

<style scoped>
.email {
  width: 100%;
  max-width: 480px;
}
</style>
