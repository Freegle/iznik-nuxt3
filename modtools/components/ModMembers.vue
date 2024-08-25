<template>
  <div>
    <div v-for="member in visibleMembers" :key="'memberlist-' + member.id" class="p-0 mt-2">
      <ModMember :member="member" :actions="false" :expand-comments="parseInt(filter) === 1" />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group';
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc';

const authStore = useAuthStore()
const groupStore = useGroupStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()

const visibleMembers = computed(() => {
  return []
})

onMounted(async () => {
  console.log('###ModMembers onMounted')
})

</script>
