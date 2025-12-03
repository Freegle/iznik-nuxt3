<template>
  <div class="search-chip">
    <nuxt-link :to="'/browse/' + search.term" class="search-term">
      {{ search.term }}
    </nuxt-link>
    <span class="search-ago">{{ searchAgo }}</span>
    <button class="search-delete" @click="deleteSearch">
      <v-icon icon="times" />
    </button>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
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
  if (daysago === 0) return 'today'
  if (daysago === 1) return '1d'
  return daysago + 'd'
})

async function deleteSearch() {
  await searchStore.delete(props.search.id, myid.value)
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.search-chip {
  display: inline-flex;
  align-items: center;
  background: $color-gray--lighter;
  border-radius: 20px;
  padding: 6px 10px;
  gap: 8px;
}

.search-term {
  color: $color-black;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
}

.search-ago {
  font-size: 0.75rem;
  color: $color-gray--dark;
}

.search-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: $color-gray--dark;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;

  &:hover {
    background: $color-gray--light;
    color: $color-black;
  }
}
</style>
