<template>
  <div class="d-flex mb-3">
    <b-form-group :label="label">
      <b-form-text v-if="description" class="mb-2">
        {{ description }}
      </b-form-text>
      <b-form-text v-if="!haveValue" class="mb-2 text-small dangerimp">
        No answer given yet.
      </b-form-text>
      <b-input-group v-if="type === 'input'">
        <b-input v-model="value" />
        <slot name="append">
          <SpinButton
            variant="white"
            icon-name="save"
            label="Save"
            :disabled="readonly"
            @handle="save"
          />
        </slot>
      </b-input-group>
      <b-input-group v-if="type === 'number'">
        <b-input v-model="value" type="number" :step="step" />
        <slot name="append">
          <SpinButton
            variant="white"
            icon-name="save"
            label="Save"
            :disabled="readonly"
            @handle="save"
          />
        </slot>
      </b-input-group>
      <div v-else-if="type === 'textarea'">
        <b-row>
          <b-col>
            <b-form-textarea v-model="value" :rows="rows" />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <SpinButton
              variant="white"
              icon-name="save"
              label="Save"
              class="mt-2"
              :disabled="readonly"
              @handle="save"
            />
          </b-col>
        </b-row>
      </div>
      <div v-else-if="type === 'toggle'">
        <OurToggle
          v-model="value"
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
          @change="save"
        />
      </div>
    </b-form-group>
    <div v-if="newRule" class="text-danger font-weight-bold">&nbsp;New</div>
  </div>
</template>
<script>
import { useModGroupStore } from '@/stores/modgroup'

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    groupid: {
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
  },
  setup() {
    const modGroupStore = useModGroupStore()
    return { modGroupStore }
  },
  data: function () {
    return {
      value: null,
    }
  },
  computed: {
    readonly() {
      return this.group.myrole !== 'Owner'
    },
    group() {
      return this.modGroupStore.get(this.groupid)
    },
    haveValue() {
      let rules = this.modGroupStore.get(this.groupid).rules || {}
      rules = typeof rules === 'string' ? JSON.parse(rules) : rules
      return this.name in rules
    },
  },
  watch: {
    groupid(newval) {
      this.getValueFromGroup()
    },
  },
  mounted() {
    this.getValueFromGroup()
  },
  methods: {
    async tooglesave() {
      this.value = !this.value
      await this.save()
    },
    async save() {
      let rules = this.modGroupStore.get(this.groupid).rules || {}
      rules = typeof rules === 'string' ? JSON.parse(rules) : rules
      rules[this.name] = this.value

      await this.modGroupStore.updateMT({
        id: this.groupid,
        rules,
      })
    },
    getValueFromGroup() {
      let rules = this.modGroupStore.get(this.groupid).rules || {}
      rules = typeof rules === 'string' ? JSON.parse(rules) : rules

      const name = this.name

      if (this.type === 'toggle') {
        this.value =
          typeof rules[name] === 'boolean'
            ? rules[name]
            : Boolean(parseInt(rules[name]))
      } else {
        this.value = rules[name]
      }
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

.dangerimp {
  color: $color-red !important;
  font-weight: bold;
}
</style>
