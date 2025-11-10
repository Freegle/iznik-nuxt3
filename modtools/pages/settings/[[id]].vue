<template>
  <div class="bg-white">
    <b-tabs v-model="tabIndex" content-class="mt-3" card>
      <b-tab>
        <template #title>
          <h2 class="ml-2 mr-2">Personal</h2>
        </template>
        <ModSettingsPersonal />
      </b-tab>
      <b-tab>
        <template #title>
          <h2 class="ml-2 mr-2">Community</h2>
        </template>
        <ModSettingsGroup :initial-group="loadGroup" />
      </b-tab>
      <b-tab>
        <template #title>
          <h2 class="ml-2 mr-2">Standard Messages</h2>
        </template>
        <ModSettingsModConfig />
      </b-tab>
      <b-tab>
        <template #title>
          <h2 class="ml-2 mr-2 text-muted">Bulk Operations</h2>
        </template>
        <p>
          All the old bulk operations were to do with Yahoo. We will need to do
          some new ones for native groups. TODO-ED
        </p>
        <ul>
          <li>Taking new members off moderation based on rules.</li>
        </ul>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script setup>
import { useModGroupStore } from '@/stores/modgroup'

const tabIndex = ref(0)
const loadGroup = ref(null)

const route = useRoute()
loadGroup.value = parseInt(route.params.id) || null

onMounted(() => {
  const modGroupStore = useModGroupStore()
  modGroupStore.getModGroups()
  if (loadGroup.value) {
    // We've been asked to load group setting.
    tabIndex.value = 1
  }
})
</script>
