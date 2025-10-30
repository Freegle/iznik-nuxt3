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
<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import pluralize from 'pluralize'
import SpinButton from './SpinButton'
import { useSearchStore } from '~/stores/search'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  search: {
    type: Object,
    required: true,
  },
})

const searchStore = useSearchStore()
const authStore = useAuthStore()
const myid = computed(() => authStore.user?.id)

const searchAgo = computed(() => {
  const daysago = dayjs().diff(dayjs(props.search.date), 'day')
  return pluralize('day', daysago, true) + ' ago'
})

async function deleteSearch(callback) {
  await searchStore.delete(props.search.id, myid.value)
  callback()
}
</script>
