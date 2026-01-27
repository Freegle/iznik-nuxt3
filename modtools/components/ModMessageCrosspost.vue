<template>
  <div class="small">
    <span class="text-danger">
      Crosspost
      <v-icon icon="hashtag" class="text-muted" scale="0.5" />
      {{ message.id }}
      <nuxt-link :to="'/message/' + message.id">
        <em>{{ message.subject }}</em>
        {{ timeago(message.arrival) }} on <em>{{ groupname }}</em>
      </nuxt-link>
    </span>
    <span v-if="message.collection != 'Approved'">
      <span class="text-muted">in</span>
      <span class="text-danger">
        {{ message.collection }}
      </span>
    </span>
    <span v-else-if="message.outcome">, now {{ message.outcome }}</span
    ><span v-else class="text-normal">, still open</span>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useGroupStore } from '~/stores/group'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const groupStore = useGroupStore()

const group = computed(() => {
  return groupStore.get(props.message.groupid)
})

const groupname = computed(() => {
  return group.value ? group.value.namedisplay : null
})

onMounted(() => {
  const g = groupStore.get(props.message.groupid)

  if (!g) {
    groupStore.fetch(props.message.groupid)
  }
})
</script>
