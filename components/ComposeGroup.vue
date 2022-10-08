<template>
  <b-form-select
    v-model="group"
    :style="(width ? 'width: ' + width + 'px' : '') + '; max-width: 300px;'"
    :options="groupOptions"
  />
</template>
<script>
import { useComposeStore } from '../stores/compose'
import { useMiscStore } from '~/stores/misc'
import { useGroupStore } from '~/stores/group'
import api from '~/api'

export default {
  props: {
    width: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup() {
    const miscStore = useMiscStore()
    const groupStore = useGroupStore
    const composeStore = useComposeStore()

    return { miscStore, groupStore, composeStore }
  },
  computed: {
    group: {
      get() {
        let ret = this.composeStore.group

        if (!ret) {
          if (this.postcode?.groupsnear) {
            ret = this.postcode.groupsnear[0].id
          }
        }

        return ret
      },
      set(newVal) {
        this.composeStore.group = newVal
      },
    },
    postcode() {
      return this.composeStore.postcode
    },
    groupOptions() {
      const ret = []
      const ids = []

      if (this.postcode && this.postcode.groupsnear) {
        for (const group of this.postcode.groupsnear) {
          if (group.type === 'Freegle') {
            ret.push({
              value: group.id,
              text: group.namedisplay ? group.namedisplay : group.nameshort,
            })

            ids[group.id] = true
          }
        }
      }

      // Add any other groups we are a member of and might want to select.
      for (const group of this.myGroups) {
        if (!ids[group.id]) {
          ret.push({
            value: group.id,
            text: group.namedisplay ? group.namedisplay : group.nameshort,
          })

          ids[group.id] = true
        }
      }

      return ret
    },
  },
  async mounted() {
    // The postcode we have contains a list of groups.  That list might contain groups which are no longer valid,
    // for example if they have been merged.  So we want to refetch the postcode so that our store gets updated.
    if (this.postcode) {
      const runtimeConfig = useRuntimeConfig()

      const location = await api(runtimeConfig).location.fetch({
        typeahead: this.postcode.name,
      })

      if (location?.ret === 0 && location?.locations.length > 0) {
        this.composeStore.postcode = location.locations[0]
      }
    }
  },
}
</script>
