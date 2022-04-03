<template>
  <div>
    <p>Button here to show Bootstrap customisation + env var access.</p>
    <b-button variant="primary"> Test {{ config.API }} </b-button>
    <p>Time now to show store access and reactivity: {{ miscStore.time }}</p>

    <p v-if="group2">Fetched group {{ group2.namedisplay }}</p>
  </div>
</template>
<script setup>
import { useGroupStore } from '../stores/group'

const GROUP = 21354
const groupStore = useGroupStore()

import { useMiscStore } from '../stores/misc'
const { group } = useLazyAsyncData('group-' + GROUP, () => groupStore.fetch(21354))
</script>
<script>
import { useGroupStore } from '../stores/group'

const GROUP = 21354
const groupStore = useGroupStore()
const config = useRuntimeConfig()

// TODO Can we avoid having to default the default layout on each page?  Didn't want to work.
definePageMeta({
  layout: 'default',
})

const miscStore = useMiscStore()


export default {
  computed: {
    group2() {
      console.log("Computed group")
      return groupStore.get(GROUP)
    },
  },
  mounted() {
    console.log('Page mounted')
  },
}
</script>
