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
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useLogsStore } from '~/stores/logs'
import { useModGroupStore } from '~/stores/modgroup'

const logsStore = useLogsStore()

const bump = ref(0)
const groupid = ref(null)
const type = ref('messages')
const term = ref(null)
const busy = ref(false)
const activeTab = ref(0)

function clear(newType, clearTerm) {
  bump.value = Date.now()
  type.value = newType

  if (clearTerm) {
    term.value = null
  }

  logsStore.setParams({
    type: newType,
    search: term.value ? term.value.trim() : null,
  })

  logsStore.clear()
}

function search() {
  clear(type.value)
}

watch(groupid, () => {
  clear(type.value)
})

onMounted(() => {
  const modGroupStore = useModGroupStore()
  modGroupStore.getModGroups()
  clear(type.value)
})
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
