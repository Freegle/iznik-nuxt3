<template>
  <div>
    <p>Button here to show Bootstrap customisation + env var access.</p>
    <b-button variant="primary"> Test {{ $config.API }} </b-button>
    <p>Time now to show store access and reactivity: {{ miscStore.time }}</p>

    <p v-if="group">
      Fetched group {{ group.namedisplay }} to show use of API component and
      axios
    </p>
    {{ messages }}
  </div>
</template>
<script>
import { getActivePinia, createPinia, setActivePinia } from 'pinia'
import { useGroupStore } from '../stores/group'
import { useMiscStore } from '../stores/misc'
import { useIsochroneStore } from '../stores/isochrone'

const GROUP = 21354

// TODO Can we avoid having to default the default layout on each page?  Didn't want to work.
definePageMeta({
  layout: 'default',
})

export default {
  setup() {
    // We don't use the syntactic sugar of <script setup> because they we have to do imports and const definitions
    // multiple times.
    if (!getActivePinia()) {
      // This seems to be needed for SSR.
      const pinia = createPinia()
      setActivePinia(pinia)
    }

    // TODO Could we ensure all stores were available in every component?
    const groupStore = useGroupStore()
    const miscStore = useMiscStore()
    const isochroneStore = useIsochroneStore()

    // The first parameter to useLazyAsyncData needs to be a unique key.
    // See https://stackoverflow.com/questions/71383166/rationale-behind-providing-a-key-in-useasyncdata-function
    useLazyAsyncData('group-' + GROUP, () => groupStore.fetch(GROUP))
    useLazyAsyncData('isochrone', () => isochroneStore.fetch())

    return { miscStore, groupStore, isochroneStore }
  },
  computed: {
    group() {
      return this.groupStore.get(GROUP)
    },
    messages() {
      return this.isochroneStore.get()
    },
  },
}
</script>
