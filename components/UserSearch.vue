<template>
  <div class="d-flex gap-3">
    <b-button :to="'/browse/' + search.term" variant="white d-inline text-wrap">
      <v-icon icon="search" /> {{ search.term }}
      <span class="text-muted small">{{ searchAgo }}</span>
    </b-button>
    <SpinButton
      no-border
      variant="white"
      icon-name="trash-alt"
      done-icon=""
      @handle="deleteSearch"
    />
  </div>
</template>
<script>
import dayjs from 'dayjs'
import pluralize from 'pluralize'
import { useSearchStore } from '../stores/search'
import SpinButton from './SpinButton'

export default {
  components: { SpinButton },
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
  computed: {
    searchAgo() {
      const daysago = dayjs().diff(dayjs(this.search.date), 'day')
      return pluralize('day', daysago, true) + ' ago'
    },
  },
  methods: {
    async deleteSearch(callback) {
      await this.searchStore.delete(this.search.id, this.myid)
      callback()
    },
  },
}
</script>
