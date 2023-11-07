<template>
  <div v-if="!removed">
    <b-button :to="'/browse/' + search.term" variant="white d-inline">
      <v-icon icon="search" /> {{ search.term }}
      <span class="text-muted small">{{ searchAgo }}</span>
    </b-button>
    <SpinButton
      transparent
      variant="white"
      class="ml-3 d-inline"
      name="trash-alt"
      done-icon="trash-alt"
      label=""
      icon-class=""
      :show-spinner="removing"
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
      this.removing = true
      await this.searchStore.delete(this.search.id, this.myid)
      this.removing = false
      this.removed = true

      setTimeout(() => {
        this.removed = false
      }, 2000)
    },
  },
}
</script>
