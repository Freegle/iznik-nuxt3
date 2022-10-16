<template>
  <div v-if="!removed">
    <b-button :to="'/browse/' + search.term" variant="white d-inline">
      <v-icon icon="search" /> {{ search.term }}
      <span class="text-muted small">{{ searchAgo }}</span>
    </b-button>
    <span class="ml-3 d-inline clickme" @click="deleteSearch">
      <v-icon v-if="removing" icon="sync" class="text-success fa-spin" />
      <v-icon v-else icon="trash-alt" title="Delete this search" />
    </span>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import pluralize from 'pluralize'
import { useSearchStore } from '../stores/search'

export default {
  props: {
    search: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const searchStore = useSearchStore()

    return {
      searchStore,
    }
  },
  data() {
    return {
      removing: false,
      removed: false,
    }
  },
  computed: {
    searchAgo() {
      const daysago = dayjs().diff(dayjs(this.search.date), 'day')
      return pluralize('day', daysago, true) + ' ago'
    },
  },
  methods: {
    async deleteSearch() {
      await this.searchStore.delete(this.search.id, this.myid)
      this.removed = true

      setTimeout(() => {
        this.removed = false
      }, 2000)
    },
  },
}
</script>
