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
<script>
import cloneDeep from 'lodash.clonedeep'
import { useMiscStore } from '~/stores/misc'
import { useModGroupStore } from '~/stores/modgroup'

export default {
  props: {
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
  },
  setup() {
    const miscStore = useMiscStore()
    const modGroupStore = useModGroupStore()

    return { miscStore, modGroupStore }
  },
  computed: {
    selectedGroup: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)

        if (this.remember) {
          this.miscStore.set({
            key: 'groupselect-' + this.remember,
            value: val,
          })
        }
      },
    },
    groups() {
      let ret = []
      if (this.listall) {
        ret = Object.values(this.modGroupStore.list).filter((g) => {
          // console.log('===GroupSelect groups A',g.id)
          return g.id
        })
      } else {
        ret = this.myGroups
        /* Used to be needed to get latest work but now not
        for( const g of ret){
          console.log('===GroupSelect group',g.work)
          if( this.modGroupStore.list[g.id]){
            g.work = this.modGroupStore.list[g.id].work
          }
        } */
      }

      ret = ret || []
      return ret
    },
    sortedGroups() {
      // We need to clone the groups, because we're about to sort.  Sort is in-place, which means we trigger
      // reactivity changes and end up with a render loop.
      let groups = cloneDeep(this.groups)
      groups = groups.sort((a, b) => {
        if (!a.namedisplay) {
          console.error('Bad group in GroupSelect', a, b, this.groups)
        }
        return a.namedisplay
          .toLowerCase()
          .localeCompare(b.namedisplay.toLowerCase())
      })

      return groups
    },
    groupOptions() {
      // console.log('MGS groupOptions')
      const groups = []

      if (this.customName) {
        groups.push({
          value: this.customVal,
          text: this.customName,
          selected: this.selectedGroup === this.customVal,
        })
      }

      if (this.all) {
        groups.push({
          value: 0,
          text: this.active
            ? '-- My active communities --'
            : this.allMy
            ? '-- All my communities --'
            : '-- All communities --',
          selected: this.selectedGroup === 0,
        })
      } else {
        groups.push({
          value: 0,
          text: '-- Please choose --',
          selected: this.selectedGroup === 0,
        })
      }

      if (this.systemwide) {
        // Check we're allowed.
        if (
          this.me &&
          (this.me.systemrole === 'Admin' || this.me.systemrole === 'Support')
        ) {
          groups.push({
            value: -2,
            text: '-- Systemwide --',
            selected: this.selectedGroup === -2,
          })
        }
      }

      for (const group of this.sortedGroups) {
        if (
          this.listall ||
          !this.modonly ||
          group.role === 'Owner' ||
          group.role === 'Moderator'
        ) {
          // console.log('MGS groupOptions group',group.namedisplay, group.work)
          let text = group.namedisplay

          if (this.work) {
            this.work.forEach((type) => {
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

          groups.push({
            value: group.id,
            text,
            selected: this.selectedGroup === group.id,
          })
        }
      }

      return groups
    },

    invalidSelection() {
      return (
        this.groupOptions.length > 0 &&
        !this.groupOptions.some((option) => option.selected)
      )
    },
  },
  watch: {
    invalidSelection: {
      immediate: true,
      handler(val) {
        if (val && this.restrict) this.selectedGroup = 0
      },
    },
    // groupOptions: {
    //   immediate: true,
    //   handler(val) {
    //     // If we only have one real group then don't force them to choose.
    //     let count = 0
    //     let group = null
    //     val.forEach((option) => {
    //       if (option.value > 0) {
    //         group = option.value
    //         count++
    //       }
    //     })
    //
    //     if (count === 1 && this.selectedGroup === 0) {
    //       this.selectedGroup = group
    //     }
    //   },
    // },
  },
  async mounted() {
    // MT CHANGED
    if (this.listall) {
      await this.modGroupStore.listMT({
        grouptype: 'Freegle',
      })
    }
    // console.log('ModGroupSelect', this.remember, this.modelValue)
    if (this.remember && !this.modelValue) {
      let val = this.miscStore.get('groupselect-' + this.remember)
      // console.log('ModGroupSelect val',this.modelValue,val)

      if (typeof val !== 'undefined') {
        val = parseInt(val)
        this.groups.forEach((g) => {
          if (g.id === val) {
            this.selectedGroup = g.id
          }
        })
      }
    }
  },
}
</script>
<style scoped>
select {
  max-width: 400px !important;
}
</style>
