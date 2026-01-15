<template>
  <div class="bg-white">
    <ScrollToTop />
    <b-tabs v-model="activeTab" content-class="mt-3" card>
      <b-tab @click="clear('messages', true)">
        <template #title>
          <h2 class="ml-2 mr-2">Messages</h2>
        </template>
        <div class="d-flex flex-wrap">
          <ModGroupSelect v-model="groupid" modonly />
          <b-input-group class="flex max">
            <b-form-input
              v-model="term"
              type="text"
              placeholder="Search name/email/subject"
              autocapitalize="none"
              @keyup.enter="search"
            />
            <b-button variant="primary" :disabled="busy" @click="search">
              <v-icon icon="search" />
            </b-button>
          </b-input-group>
        </div>
      </b-tab>
      <b-tab to="/logs/members" @click="clear('memberships', true)">
        <template #title>
          <h2 class="ml-2 mr-2">Members</h2>
        </template>
        <div class="d-flex flex-wrap">
          <ModGroupSelect v-model="groupid" modonly />
          <b-input-group class="flex max">
            <b-form-input
              v-model="term"
              type="text"
              placeholder="Search name/email/subject"
              autocapitalize="none"
              @keyup.enter="search"
            />
            <b-button variant="primary" @click="search">
              <v-icon icon="search" />
            </b-button>
          </b-input-group>
        </div>
      </b-tab>
    </b-tabs>

    <!-- Standard Mod Logs for Messages/Members tabs -->
    <ModLogs
      v-if="groupid"
      ref="logs"
      :key="'modlogs-' + bump"
      class="bg-white"
      :groupid="groupid"
      @busy="busy = true"
      @idle="busy = false"
    />
  </div>
</template>
<script>
import { useLogsStore } from '~/stores/logs'
import { useModGroupStore } from '~/stores/modgroup'

export default {
  setup() {
    const logsStore = useLogsStore()
    return { logsStore }
  },
  data: function () {
    return {
      bump: 0,
      groupid: null,
      type: 'messages',
      term: null,
      busy: false,
      activeTab: 0,
    }
  },
  watch: {
    groupid() {
      this.clear(this.type)
    },
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    this.clear(this.type)
  },
  methods: {
    clear(type, term) {
      this.bump = Date.now()
      this.type = type

      if (term) {
        this.term = null
      }

      this.logsStore.setParams({
        type,
        search: this.term ? this.term.trim() : null,
      })

      this.logsStore.clear()
    },
    search() {
      this.clear(this.type)
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
