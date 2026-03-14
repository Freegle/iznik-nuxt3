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
import { useGroupStore } from '~/stores/group'
import { useMe } from '~/composables/useMe'

const props = defineProps({
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
})

const emit = defineEmits(['update:modelValue'])
const miscStore = useMiscStore()
const groupStore = useGroupStore()
const { me, myGroups } = useMe()

const selectedGroup = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)

    if (props.remember) {
      miscStore.set({
        key: 'groupselect-' + props.remember,
        value: val,
      })
    }
  },
})

const groups = computed(() => {
  let ret = []
  if (props.listall) {
    ret = Object.values(groupStore.summaryList).filter((g) => {
      return g.id
    })
  } else {
    ret = myGroups.value
  }

  ret = ret || []
  return ret
})

const sortedGroups = computed(() => {
  // We need to clone the groups, because we're about to sort.  Sort is in-place, which means we trigger
  // reactivity changes and end up with a render loop.
  let grps = cloneDeep(groups.value)
  grps = grps.sort((a, b) => {
    if (!a.namedisplay) {
      console.error('Bad group in GroupSelect', a, b, groups.value)
    }
    return a.namedisplay
      .toLowerCase()
      .localeCompare(b.namedisplay.toLowerCase())
  })

  return grps
})

const groupOptions = computed(() => {
  const grps = []

  if (props.customName) {
    grps.push({
      value: props.customVal,
      text: props.customName,
      selected: selectedGroup.value === props.customVal,
    })
  }

  if (props.all) {
    grps.push({
      value: 0,
      text: props.active
        ? '-- My active communities --'
        : props.allMy
        ? '-- All my communities --'
        : '-- All communities --',
      selected: selectedGroup.value === 0,
    })
  } else {
    grps.push({
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
      grps.push({
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
            text +=
              ' (' +
              group.work[type] +
              ')' +
              (group.mysettings && group.mysettings.active === 0
                ? ' - backup'
                : '')
          }
        })
      }

      grps.push({
        value: group.id,
        text,
        selected: selectedGroup.value === group.id,
      })
    }
  }

  return grps
})

const invalidSelection = computed(() => {
  return (
    groupOptions.value.length > 0 &&
    !groupOptions.value.some((option) => option.selected)
  )
})

// Watch for invalid selection and reset to 0 if needed
watch(
  invalidSelection,
  (val) => {
    if (val && props.restrict) selectedGroup.value = 0
  },
  { immediate: true }
)

// Commented out code from the original component:
// watch(groupOptions, (val) => {
//   // If we only have one real group then don't force them to choose.
//   let count = 0
//   let group = null
//   val.forEach((option) => {
//     if (option.value > 0) {
//       group = option.value
//       count++
//     }
//   })
//
//   if (count === 1 && selectedGroup.value === 0) {
//     selectedGroup.value = group
//   }
// }, { immediate: true })

onMounted(async () => {
  if (props.listall) {
    await groupStore.fetch()
  }

  if (props.remember) {
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
