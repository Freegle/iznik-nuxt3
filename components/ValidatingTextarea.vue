<template>
  <div>
    <b-form-textarea
      :id="id"
      :state="validationState"
      :aria-describedby="feedbackId"
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
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
}
</script>
