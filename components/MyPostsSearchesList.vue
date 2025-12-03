<template>
  <div class="searches-section">
    <div class="searches-header">
      <v-icon icon="search" class="me-2" />
      <span class="searches-title">Your Searches</span>
    </div>
    <div v-if="searches?.length" class="searches-list">
      <UserSearch
        v-for="search in searches"
        :key="'search-' + search.id"
        :search="search"
      />
    </div>
    <div v-else class="searches-empty">
      <p>No saved searches yet</p>
      <nuxt-link to="/find" class="search-link">
        <v-icon icon="search" class="me-1" />Ask for something
      </nuxt-link>
    </div>
  </div>
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
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.searches-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.searches-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: $color-blue--bright;
}

.searches-title {
  font-weight: 600;
  font-size: 1rem;
}

.searches-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.searches-empty {
  text-align: center;
  padding: 16px;
  color: $color-gray--dark;

  p {
    margin-bottom: 12px;
  }
}

.search-link {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: $color-blue--bright;
  color: white;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    background: darken($color-blue--bright, 10%);
    color: white;
  }
}
</style>
