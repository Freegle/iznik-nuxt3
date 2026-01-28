<template>
  <div v-if="RecentCounts">
    <p v-if="loading" class="text-faded pulsate">Loading...</p>
    <p v-else>
      During this time there have been
      <strong>{{
        pluralise('new post', RecentCounts.newmessages, true)
      }}</strong>
      and
      <strong>{{
        pluralise('new member', RecentCounts.newmembers, true)
      }}</strong
      >.
    </p>
  </div>
</template>
<script setup>
import { useModDashboard } from '~/modtools/composables/useModDashboard'

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  groupName: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
})

const { loading, RecentCounts } = useModDashboard(props, ['RecentCounts'])
</script>
