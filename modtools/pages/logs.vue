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
      <b-tab @click="showSystemLogs">
        <template #title>
          <h2 class="ml-2 mr-2">System Logs (WIP)</h2>
        </template>
      </b-tab>
    </b-tabs>

    <!-- Standard Mod Logs for Messages/Members tabs -->
    <ModLogs
      v-if="groupid && activeTab !== 2"
      ref="logs"
      :key="'modlogs-' + bump"
      class="bg-white"
      :groupid="groupid"
      @busy="busy = true"
      @idle="busy = false"
    />

    <!-- System Logs from Loki -->
    <ModSystemLogs
      v-if="activeTab === 2"
      :key="'systemlogs-' + bump"
      class="bg-white p-3"
      :groupid="systemLogsGroupid"
    />
  </div>
</template>
<script>
import { useLogsStore } from '~/stores/logs'
import { useModGroupStore } from '~/stores/modgroup'
import ModSystemLogs from '~/modtools/components/ModSystemLogs.vue'

export default {
  components: {
    ModSystemLogs,
  },
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
      systemLogsGroupid: null,
    }
  },
  watch: {
    groupid() {
      if (this.activeTab !== 2) {
        this.clear(this.type)
      }
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
    showSystemLogs() {
      this.activeTab = 2
      this.bump = Date.now()
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
