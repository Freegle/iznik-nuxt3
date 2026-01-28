<template>
  <div>
    <b-input-group class="mb-2">
      <b-form-input
        v-model="searchuser"
        placeholder="Email, numerical id, or ~- encoded id"
        class="max"
        :disabled="searching"
        autocapitalize="none"
        autocomplete="off"
        @keyup="searched = false"
        @keyup.enter.exact="usersearch"
      />
      <slot name="append">
        <b-button variant="primary" @click="usersearch">
          <v-icon v-if="searching" icon="sync" class="fa-spin" />
          <v-icon v-else icon="search" /> Find user
        </b-button>
      </slot>
    </b-input-group>
    <div v-if="!searching && searchuser && searched">
      <ModSupportUser
        v-for="user in visible"
        :id="user.id"
        :key="user.id"
        :expand="expand"
      />
      <infinite-loading :distance="200" @infinite="loadMoreUsers">
        <template #spinner />
        <template #complete>
          <notice-message v-if="!visible?.length">
            No users found.
          </notice-message>
        </template>
      </infinite-loading>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
})

const userStore = useUserStore()

const searching = ref(false)
const searchuser = ref(null)
const show = ref(0)
const searched = ref(false)
const searchresults = ref([])

const expand = computed(() => {
  return searchresults.value.length === 1
})

const visible = computed(() => {
  return searchresults.value && searchresults.value.length
    ? searchresults.value.slice(0, show.value)
    : []
})

onMounted(() => {
  // Clear the user cache to make sure we don't display any results before we've searched.
  userStore.clear()

  if (props.id) {
    console.log('mounted', props.id)
    searchuser.value = props.id
    usersearch()
  }
})

async function usersearch() {
  if (!searchuser.value) {
    return
  }
  const val = searchuser.value.toString().trim()

  if (val) {
    searching.value = true

    show.value = 0
    userStore.clear()

    await userStore.fetchMT({
      search: val,
      emailhistory: true,
    })
    searching.value = false
    searched.value = true

    // Get a copy of the results here.  The store might change later if we view a chat and have to fetch another
    // user.  That can cause us to get confused.

    // Show most recent first
    searchresults.value = Object.values(userStore.list).sort((a, b) => {
      return new Date(b.lastaccess).getTime() - new Date(a.lastaccess).getTime()
    })
  }
}

function loadMoreUsers($state) {
  // We use an infinite scroll on the list of chats because even though we have all the data in hand, the less
  // we render onscreen the faster vue is to do so.
  show.value++

  if (show.value > searchresults.value.length) {
    show.value = searchresults.value.length
    $state.complete()
  } else {
    $state.loaded()
  }
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
