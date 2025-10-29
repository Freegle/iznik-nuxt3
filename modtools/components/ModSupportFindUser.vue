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
<script>
import { useUserStore } from '~/stores/user'

export default {
  props: {
    id: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data: function () {
    return {
      searching: false,
      searchuser: null,
      show: 0,
      searched: false,
      searchresults: [],
    }
  },
  computed: {
    expand() {
      return this.searchresults.length === 1
    },
    visible() {
      return this.searchresults && this.searchresults.length
        ? this.searchresults.slice(0, this.show)
        : []
    },
  },
  mounted() {
    // Clear the user cache to make sure we don't display any results before we've searched.
    const userStore = useUserStore()
    userStore.clear()

    if (this.id) {
      console.log('mounted', this.id)
      this.searchuser = this.id
      this.usersearch()
    }
  },
  methods: {
    async usersearch() {
      if (!this.searchuser) {
        return
      }
      const val = this.searchuser.toString().trim()

      if (val) {
        this.searching = true

        this.show = 0
        const userStore = useUserStore()
        userStore.clear()

        await userStore.fetchMT({
          search: val,
          emailhistory: true,
        })
        this.searching = false
        this.searched = true

        // Get a copy of the results here.  The store might change later if we view a chat and have to fetch another
        // user.  That can cause us to get confused.

        // Show most recent first
        this.searchresults = Object.values(userStore.list).sort((a, b) => {
          return (
            new Date(b.lastaccess).getTime() - new Date(a.lastaccess).getTime()
          )
        })
      }
    },
    loadMoreUsers: function ($state) {
      // We use an infinite scroll on the list of chats because even though we have all the data in hand, the less
      // we render onscreen the faster vue is to do so.
      this.show++

      if (this.show > this.searchresults.length) {
        this.show = this.searchresults.length
        $state.complete()
        this.complete = true
      } else {
        $state.loaded()
      }
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
