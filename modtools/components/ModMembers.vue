<template>
  <div>
    members.length: {{ members.length  }}.  visibleMembers.length: {{ visibleMembers.length  }}. filter: {{ filter }}
    <div v-for="(member, ix) in visibleMembers" :key="'memberlist-' + member.id" class="p-0 mt-2">
      <ModMember :member="member" :index="ix" :actions="false" :expand-comments="parseInt(filter) === 1" />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group';
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc';
import { setupModMembers } from '../composables/useModMembers'

const authStore = useAuthStore()
const groupStore = useGroupStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()

const {
  busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, nextAfterRemoved, filter, distance, summary, members, visibleMembers, work,
} = setupModMembers()

onMounted(async () => {
  console.log('###ModMembers onMounted')
})

</script>
