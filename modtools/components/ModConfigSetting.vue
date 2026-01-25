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
<script>
import { useModConfigStore } from '~/stores/modconfig'

export default {
  props: {
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
  },
  setup() {
    const modConfigStore = useModConfigStore()
    return { modConfigStore }
  },
  data: function () {
    return {
      forSave: null,
    }
  },
  computed: {
    config() {
      return this.modConfigStore.current
    },
    setifrequired() {
      if (this.required) {
        return this.forSave && this.forSave.trim().length > 0
      }
      return true
    },
    value: {
      get() {
        let ret = null

        if (this.config) {
          if (this.type === 'toggle') {
            ret = this.config[this.name]

            if (this.valueChecked) {
              ret = ret === this.valueChecked
            }
          } else {
            ret = this.config[this.name]
          }
        }
        return ret
      },
      set(newval) {
        this.forSave = newval
      },
    },
    toggleValue: {
      get() {
        return Boolean(this.value)
      },
      set(newval) {
        this.value = newval
      },
    },
  },
  methods: {
    async save(callbackorvalue) {
      const data = {
        id: this.configid,
      }

      if (this.type === 'toggle') {
        this.forSave = callbackorvalue
        // We can override the values sent.
        if (this.forSave) {
          data[this.name] = this.valueChecked ? this.valueChecked : this.forSave
        } else {
          data[this.name] = this.valueUnchecked
            ? this.valueUnchecked
            : this.forSave
        }
      } else {
        if (this.forSave === null && this.type === 'input' && this.config) {
          this.forSave = this.config[this.name]
        }
        data[this.name] = this.forSave
      }

      await this.modConfigStore.updateConfig(data)
      if (typeof callbackorvalue === 'function') callbackorvalue()
    },
  },
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

input,
select {
  max-width: 300px;
}
</style>
