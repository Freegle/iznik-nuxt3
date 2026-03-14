<template>
  <div>
    <div
      v-for="member in visibleMembers"
      :key="'memberlist-' + member.id"
      class="p-0 mt-2"
    >
      <ModMember
        :member="member"
        :actions="false"
        :expand-comments="parseInt(filter) === 1"
      />
    </div>
  </div>
</template>

<script setup>
import { setupModMembers } from '~/composables/useModMembers'

const { filter, visibleMembers } = setupModMembers()
</script>
