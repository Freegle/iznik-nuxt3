<template>
  <div>
    <b-form-input
      :id="id"
      :state="validationState"
      :aria-describedby="feedbackId"
      :minlength="minLength"
      :maxlength="maxLength"
      v-bind="$attrs"
      @blur="validation.$touch"
    />
    <b-form-invalid-feedback v-if="hasValidationError" :id="feedbackId">
      <span v-if="firstValidationError">{{ firstValidationError }}</span>
    </b-form-invalid-feedback>
  </div>
</template>
<script>
import { useVuelidate } from '@vuelidate/core'
import validationFieldHelpers from '@/mixins/validationFieldHelpers'

export default {
  mixins: [validationFieldHelpers],
  setup(props) {
    return {
      value: props.value,
      v$: useVuelidate(),
    }
  },
  computed: {
    maxLength() {
      return this.validationTypes.includes('maxLength')
        ? this.validation.maxLength.$params.max
        : null
    },
    minLength() {
      return this.validationTypes.includes('minLength')
        ? this.validation.minLength.$params.min
        : null
    },
  },
}
</script>
