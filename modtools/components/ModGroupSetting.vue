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
<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useModGroupStore } from '@/stores/modgroup'

const props = defineProps({
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
})

const modGroupStore = useModGroupStore()

const value = ref(null)
const mounted = ref(false)

const group = computed(() => modGroupStore.get(props.groupid))

const readonly = computed(() => group.value?.myrole !== 'Owner')

/**
 * From https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object
 *
 * Dynamically sets a deeply nested value in an object.
 * Optionally "bores" a path to it if its undefined.
 */
function setDeep(obj, path, val, setrecursively = false) {
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
      a[b] = val
      return val
    } else {
      return a[b]
    }
  }, obj)
}

function getValueFromGroup() {
  let obj = modGroupStore.get(props.groupid)

  if (obj) {
    let name = props.name
    let p

    do {
      p = name.indexOf('.')

      if (p === -1) {
        // Got there.
        if (props.type === 'toggle') {
          value.value =
            typeof obj[name] === 'boolean'
              ? obj[name]
              : Boolean(parseInt(obj[name]))
        } else {
          value.value = obj[name]
        }
      } else {
        const l1 = name.substring(0, p)
        const l2 = name.substring(p + 1)
        obj = obj[l1]
        name = l2
      }
    } while (p !== -1 && obj)
  }
}

async function save(callbackorvalue) {
  if (mounted.value) {
    const data = {
      id: props.groupid,
    }

    const p = props.name.indexOf('.')
    let val =
      typeof callbackorvalue !== 'function' ? callbackorvalue : value.value

    if (typeof val === 'boolean') {
      val = val ? 1 : 0
    }

    if (p === -1) {
      // Top level property
      data[props.name] = val
    } else {
      // Lower down - we send the top one but we need to modify it wherever it is.
      const top = props.name.substring(0, p)
      const topobj = modGroupStore.get(props.groupid)

      setDeep(topobj, props.name.split('.'), val)
      data[top] = topobj[top]
    }

    await modGroupStore.updateMT(data)
  }
  if (typeof callbackorvalue === 'function') callbackorvalue()
}

watch(
  () => props.groupid,
  () => {
    getValueFromGroup()
  }
)

onMounted(() => {
  getValueFromGroup()
  nextTick(() => {
    mounted.value = true
  })
})
</script>
<style scoped lang="scss">
//@import 'color-vars';

input,
select {
  max-width: 300px;
}
</style>
