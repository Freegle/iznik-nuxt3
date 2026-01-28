<template>
  <b-form-group :label="label">
    <b-form-text v-if="description" class="mb-2">
      {{ description }}
    </b-form-text>
    <b-input-group v-if="type === 'input'">
      <b-form-input v-model="value" :disabled="disabled" />
      <slot v-if="!disabled && setifrequired" name="append">
        <SpinButton
          variant="white"
          icon-name="save"
          label="Save"
          @handle="save"
        />
      </slot>
    </b-input-group>
    <div v-else-if="type === 'textarea'">
      <b-row>
        <b-col>
          <b-form-textarea v-model="value" :rows="rows" :disabled="disabled" />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <SpinButton
            v-if="!disabled"
            variant="white"
            icon-name="save"
            label="Save"
            class="mt-2"
            @handle="save"
          />
        </b-col>
      </b-row>
    </div>
    <div v-else-if="type === 'toggle'">
      <OurToggle
        v-model="toggleValue"
        class="mt-2"
        :height="30"
        :width="toggleWidth"
        :font-size="14"
        :sync="true"
        :labels="{ checked: toggleChecked, unchecked: toggleUnchecked }"
        variant="modgreen"
        :disabled="disabled"
        @change="save"
      />
    </div>
    <div v-else-if="type === 'select'">
      <b-form-select
        v-model="value"
        :options="options"
        class="mt-2"
        :disabled="disabled"
        @change="save"
      />
    </div>
  </b-form-group>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useModConfigStore } from '~/stores/modconfig'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  configid: {
    type: Number,
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
  valueChecked: {
    type: String,
    required: false,
    default: null,
  },
  valueUnchecked: {
    type: String,
    required: false,
    default: null,
  },
  options: {
    type: Array,
    required: false,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const modConfigStore = useModConfigStore()

const forSave = ref(null)

const config = computed(() => modConfigStore.current)

const setifrequired = computed(() => {
  if (props.required) {
    return forSave.value && forSave.value.trim().length > 0
  }
  return true
})

const value = computed({
  get() {
    let ret = null

    if (config.value) {
      if (props.type === 'toggle') {
        ret = config.value[props.name]

        if (props.valueChecked) {
          ret = ret === props.valueChecked
        }
      } else {
        ret = config.value[props.name]
      }
    }
    return ret
  },
  set(newval) {
    forSave.value = newval
  },
})

const toggleValue = computed({
  get() {
    return Boolean(value.value)
  },
  set(newval) {
    value.value = newval
  },
})

async function save(callbackorvalue) {
  const data = {
    id: props.configid,
  }

  if (props.type === 'toggle') {
    forSave.value = callbackorvalue
    // We can override the values sent.
    if (forSave.value) {
      data[props.name] = props.valueChecked ? props.valueChecked : forSave.value
    } else {
      data[props.name] = props.valueUnchecked
        ? props.valueUnchecked
        : forSave.value
    }
  } else {
    if (forSave.value === null && props.type === 'input' && config.value) {
      forSave.value = config.value[props.name]
    }
    data[props.name] = forSave.value
  }

  await modConfigStore.updateConfig(data)
  if (typeof callbackorvalue === 'function') callbackorvalue()
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

input,
select {
  max-width: 300px;
}
</style>
