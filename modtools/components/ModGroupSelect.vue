<template>
  <div>
    <label
      v-if="label"
      for="communitieslist"
      :class="labelSrOnly ? 'visually-hidden' : ''"
      >{{ label }}</label
    >
    <b-form-select
      id="communitieslist"
      v-model="selectedGroup"
      :size="size"
      :options="groupOptions"
      :disabled="disabled"
    />
  </div>
</template>
<script setup>
import { computed, watch, onMounted } from 'vue'
import cloneDeep from 'lodash.clonedeep'
import { useMiscStore } from '~/stores/misc'
import { useModGroupStore } from '~/stores/modgroup'
import { useMe } from '~/composables/useMe'

/**
 * Selected value
 *
 *   if null
 *     if   all=true       --> "all groups"
 *     else all=false      --> "you must select a group"
 *   else if it's a number --> use that group id
 *
 * (0 is not a valid group number)
 */
const props = defineProps({
  label: {
    type: String,
    required: false,
    default: '',
  },
  labelSrOnly: {
    type: Boolean,
    required: false,
    default: false,
  },
  modelValue: {
    type: Number,
    default: 0,
  },
  // Whether we show "All my groups" or "Please choose a group"
  all: {
    type: Boolean,
    required: false,
    default: false,
  },
  allMy: {
    type: Boolean,
    required: false,
    default: true,
  },
  // Whether to list all Freegle groups.
  listall: {
    type: Boolean,
    required: false,
    default: false,
  },
  // Whether to show the systemwide option.  This will only show if we're an system admin.
  systemwide: {
    type: Boolean,
    required: false,
    default: false,
  },
  // Whether to only show groups on which we are a mod.
  modonly: {
    type: Boolean,
    required: false,
    default: false,
  },
  // Whether "All my communities" should be "My active communities"
  active: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  // Whether to show work counts in the group names.
  work: {
    type: Array,
    required: false,
    default() {
      return []
    },
  },
  // Whether to restrict to our own groups
  restrict: {
    type: Boolean,
    required: false,
    default: true,
  },
  remember: {
    type: String,
    required: false,
    default: null,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  customName: {
    type: String,
    required: false,
    default: null,
  },
  customVal: {
    type: Number,
    required: false,
    default: null,
  },
  // When true, the modelValue was explicitly set from URL and should not
  // be overridden by the remembered value (even if modelValue is 0).
  urlOverride: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const miscStore = useMiscStore()
const modGroupStore = useModGroupStore()
const { me } = useMe()

const selectedGroup = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    if (modGroupStore.received) {
      // Only update once all groups received
      emit('update:modelValue', val)

      if (props.remember) {
        miscStore.set({
          key: 'groupselect-' + props.remember,
          value: val,
        })
      }
    }
  },
})

const groups = computed(() => {
  let ret = []
  if (props.listall) {
    ret = Object.values(modGroupStore.allGroups).filter((g) => {
      return g.id
    })
  } else {
    ret = Object.values(modGroupStore.list)
  }

  ret = ret || []
  return ret
})

const sortedGroups = computed(() => {
  // We need to clone the groups, because we're about to sort.  Sort is in-place, which means we trigger
  // reactivity changes and end up with a render loop.
  let groupList = cloneDeep(groups.value)
  groupList = groupList.sort((a, b) => {
    if (!a.namedisplay) {
      console.error('Bad group in ModGroupSelect', a, b, groups.value)
    }
    return a.namedisplay
      .toLowerCase()
      .localeCompare(b.namedisplay.toLowerCase())
  })

  return groupList
})

const groupOptions = computed(() => {
  const groupList = []

  if (props.customName) {
    groupList.push({
      value: props.customVal,
      text: props.customName,
      selected: selectedGroup.value === props.customVal,
    })
  }

  if (props.all) {
    groupList.push({
      value: 0,
      text: props.active
        ? '-- My active communities --'
        : props.allMy
        ? '-- All my communities --'
        : '-- All communities --',
      selected: selectedGroup.value === 0,
    })
  } else {
    groupList.push({
      value: 0,
      text: '-- Please choose --',
      selected: selectedGroup.value === 0,
    })
  }

  if (props.systemwide) {
    // Check we're allowed.
    if (
      me.value &&
      (me.value.systemrole === 'Admin' || me.value.systemrole === 'Support')
    ) {
      groupList.push({
        value: -2,
        text: '-- Systemwide --',
        selected: selectedGroup.value === -2,
      })
    }
  }

  for (const group of sortedGroups.value) {
    if (
      props.listall ||
      !props.modonly ||
      group.role === 'Owner' ||
      group.role === 'Moderator'
    ) {
      let text = group.namedisplay

      if (props.work) {
        props.work.forEach((type) => {
          if (group.work && group.work[type]) {
            text += ' (' + group.work[type] + ')'
          }
        })
      }
      if (group.mysettings && group.mysettings.active === 0) {
        text += ' - backup'
      }

      groupList.push({
        value: group.id,
        text,
        selected: selectedGroup.value === group.id,
      })
    }
  }

  return groupList
})

const invalidSelection = computed(() => {
  return (
    groupOptions.value.length > 0 &&
    !groupOptions.value.some((option) => option.selected)
  )
})

const groupsloaded = computed(() => modGroupStore.received)

watch(
  invalidSelection,
  (val) => {
    if (val && props.restrict) selectedGroup.value = 0
  },
  { immediate: true }
)

watch(groupsloaded, () => {
  // Only restore remembered group if no explicit value was set from URL.
  // Check urlOverride prop for cases where modelValue is 0 (All communities)
  // but was explicitly set from URL params.
  if (props.modelValue || props.urlOverride) {
    return
  }
  const val = miscStore.get('groupselect-' + props.remember)
  if (val && val !== props.modelValue) {
    emit('update:modelValue', val)
  }
})

onMounted(() => {
  // Only restore remembered group if no explicit value was set.
  // Check urlOverride for cases where modelValue is 0 but explicit.
  if (props.remember && !props.modelValue && !props.urlOverride) {
    let val = miscStore.get('groupselect-' + props.remember)

    if (typeof val !== 'undefined') {
      val = parseInt(val)
      groups.value.forEach((g) => {
        if (g.id === val) {
          selectedGroup.value = g.id
        }
      })
    }
  }
})
</script>
<style scoped>
select {
  max-width: 400px !important;
}
</style>
