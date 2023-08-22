<template>
  <b-card
    class="mt-2"
    border-variant="info"
    header="info"
    header-bg-variant="info"
    header-text-variant="white"
    no-body
  >
    <template #header>
      <h2 class="d-inline header--size3">
        <v-icon icon="search" scale="2" /> Your Searches
      </h2>
    </template>
    <b-card-body class="p-1 p-lg-3">
      <b-card-text class="text-center">
        <p v-if="searches?.length > 0" class="text-muted">
          What you've recently searched for - click to search again. These are
          also email alerts - we'll mail you matching posts.
        </p>
        <ul
          v-if="searches?.length"
          class="list-group list-group-horizontal flex-wrap"
        >
          <UserSearch
            v-for="search in searches"
            :key="'search-' + search.id"
            :search="search"
            class="text-start mt-1 list-group-item bg-white border text-nowrap mr-2"
          />
        </ul>
        <div v-else>
          <p>Nothing here yet. Why not...</p>
          <b-button to="/find" class="mt-1" size="lg" variant="secondary">
            <v-icon icon="shopping-cart" />&nbsp;Ask for stuff
          </b-button>
        </div>
      </b-card-text>
    </b-card-body>
  </b-card>
</template>

<script setup>
import dayjs from 'dayjs'
import { useSearchStore } from '~/stores/search'
import UserSearch from '~/components/UserSearch.vue'

const searchStore = useSearchStore()

const searches = computed(() => {
  // Show the searches within the last 90 days, most recent first. Anything older is less likely to be relevant
  // and it stops it growing forever, forcing them to delete things.

  let ret = searchStore?.list

  if (ret) {
    const now = dayjs()
    ret = ret.filter((a) => {
      const daysago = now.diff(dayjs(a.date), 'day')
      return daysago <= 90
    })
    ret.sort((a, b) => a.daysago - b.daysago)
  }

  return ret
})
</script>
