<template>
  <div>
    <p>Button here to show Bootstrap customisation + env var access.</p>
    <b-button variant="primary"> Test {{ $config.API }} </b-button>
    <p>Time now to show store access and reactivity: {{ miscStore.time }}</p>

    <p v-if="group">
      Fetched group {{ group.namedisplay }} to show use of API component and
      axios
    </p>
  </div>
</template>
<script>
import { useGroupStore } from '../stores/group'
import { useMiscStore } from '../stores/misc'

const GROUP = 21354

// TODO Can we avoid having to default the default layout on each page?  Didn't want to work.
definePageMeta({
  layout: 'default',
})

export default {
  setup() {
    // We don't use the syntactic sugar of <script setup> because they we have to do imports and const definitions
    // multiple times.
    //
    // The first parameter to useLazyAsyncData needs to be a unique key.
    // See https://stackoverflow.com/questions/71383166/rationale-behind-providing-a-key-in-useasyncdata-function
    console.log('Async')
    useLazyAsyncData('group-' + GROUP, () => groupStore.fetch(GROUP))

    // TODO Could we ensure all stores were available in every component?
    const groupStore = useGroupStore()
    const miscStore = useMiscStore()

    return { miscStore, groupStore }
  },
  computed: {
    group() {
      console.log('Computed')
      return this.groupStore.get(GROUP)
    },
  },
}
</script>
