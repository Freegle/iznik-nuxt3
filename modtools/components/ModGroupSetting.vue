<template>
  <b-form-group :label="label">
    <b-form-text v-if="description" class="mb-2">
      {{ description }}
    </b-form-text>
    <b-input-group v-if="type === 'input'">
      <b-form-input v-model="value" />
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
      <b-form-input v-model="value" type="number" :step="step" />
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
        :labels="{ checked: toggleChecked, unchecked: toggleUnchecked }"
        variant="modgreen"
        :disabled="readonly"
        @change="save"
      />
    </div>
  </b-form-group>
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
  },
  setup() {
    const modGroupStore = useModGroupStore()
    return { modGroupStore }
  },
  data: function () {
    return {
      value: null,
      mounted: false, // Stops save during load process
    }
  },
  computed: {
    readonly() {
      return this.group.myrole !== 'Owner'
    },
    group() {
      return this.modGroupStore.get(this.groupid)
    },
  },
  watch: {
    groupid(newval) {
      this.getValueFromGroup()
    },
  },
  mounted() {
    this.getValueFromGroup()
    this.$nextTick(() => {
      this.mounted = true
    })
  },
  methods: {
    /**
     * From https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object
     *
     * Dynamically sets a deeply nested value in an object.
     * Optionally "bores" a path to it if its undefined.
     * @function
     * @param {!object} obj  - The object which contains the value you want to change/set.
     * @param {!array} path  - The array representation of path to the value you want to change/set.
     * @param {!mixed} value - The value you want to set it to.
     * @param {boolean} setrecursively - If true, will set value of non-existing path as well.
     */
    setDeep(obj, path, value, setrecursively = false) {
      let level = 0

      path.reduce((a, b) => {
        level++

        if (
          setrecursively &&
          typeof a[b] === 'undefined' &&
          level !== path.length
        ) {
          a[b] = {}
          return a[b]
        }

        if (level === path.length) {
          a[b] = value
          return value
        } else {
          return a[b]
        }
      }, obj)
    },

    async save(callbackorvalue) {
      if (this.mounted) {
        const data = {
          id: this.groupid,
        }

        const p = this.name.indexOf('.')
        let val =
          typeof callbackorvalue !== 'function' ? callbackorvalue : this.value

        if (typeof val === 'boolean') {
          val = val ? 1 : 0
        }

        if (p === -1) {
          // Top level property
          data[this.name] = val
        } else {
          // Lower down - we send the top one but we need to modify it wherever it is.
          const top = this.name.substring(0, p)
          const topobj = this.modGroupStore.get(this.groupid)

          this.setDeep(topobj, this.name.split('.'), val)
          data[top] = topobj[top]
        }

        await this.modGroupStore.updateMT(data)
      }
      if (typeof callbackorvalue === 'function') callbackorvalue()
    },
    getValueFromGroup() {
      let obj = this.modGroupStore.get(this.groupid)

      if (obj) {
        let name = this.name
        let p

        do {
          p = name.indexOf('.')

          if (p === -1) {
            // Got there.
            if (this.type === 'toggle') {
              this.value =
                typeof obj[name] === 'boolean'
                  ? obj[name]
                  : Boolean(parseInt(obj[name]))
            } else {
              this.value = obj[name]
            }
          } else {
            const l1 = name.substring(0, p)
            const l2 = name.substring(p + 1)
            obj = obj[l1]
            name = l2
          }
        } while (p !== -1 && obj)
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
</style>
