<template>
  <div class="d-flex mb-4">
    <b-form-group :label="label">
      <b-form-text v-if="description" class="mb-2">
        {{ description }}
      </b-form-text>
      <b-form-text v-if="!haveValue" class="mb-2 text-small dangerimp">
        No answer given yet.
      </b-form-text>
      <b-input-group v-if="type === 'input'">
        <b-input v-model="bsetting" />
      </b-input-group>
      <b-input-group v-if="type === 'number'">
        <b-input v-model="bsetting" type="number" :step="step" />
      </b-input-group>
      <div v-else-if="type === 'textarea'">
        <b-row>
          <b-col>
            <b-form-textarea v-model="bsetting" :rows="rows" />
          </b-col>
        </b-row>
      </div>
      <div v-else-if="type === 'toggle'">
        <OurToggle
          v-model="bsetting"
          class="mt-2"
          :height="30"
          :width="toggleWidth"
          :font-size="14"
          :sync="true"
          :labels="{
            checked: haveValue ? toggleChecked : 'N/A',
            unchecked: haveValue ? toggleUnchecked : 'N/A',
          }"
          variant="modgreen"
          :disabled="readonly"
        />
      </div>
    </b-form-group>
    <div v-if="newRule" class="text-danger font-weight-bold">&nbsp;New</div>
  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  setting: {
    type: null,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: 'input',
  },
  step: {
    type: Number,
    required: false,
    default: 1,
  },
  rows: {
    type: Number,
    required: false,
    default: 3,
  },
  toggleWidth: {
    type: Number,
    required: false,
    default: 150,
  },
  toggleChecked: {
    type: String,
    required: false,
    default: null,
  },
  toggleUnchecked: {
    type: String,
    required: false,
    default: null,
  },
  newRule: {
    type: Boolean,
    required: false,
    default: false,
  },
  readonly: {
    type: Boolean,
    required: true,
    default: false,
  },
})

const emit = defineEmits(['change'])

const haveValue = computed(() => props.setting != null)

const bsetting = computed({
  get() {
    return props.setting
  },
  set(newval) {
    emit('change', newval)
  },
})
</script>
<style scoped lang="scss">
//@import 'color-vars';

input,
select {
  max-width: 300px;
}

.dangerimp {
  color: $color-red !important;
  font-weight: bold;
}
</style>
