<template>
  <NoticeMessage v-if="showIt" variant="info">
    <div class="d-flex justify-content-between align-items-center">
      <span>
        We've updated our
        <nuxt-link to="/privacy">Privacy Policy</nuxt-link>.
      </span>
      <b-button variant="secondary" size="sm" @click="seenIt">
        Hide this
      </b-button>
    </div>
  </NoticeMessage>
</template>
<script setup>
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const me = ref(useAuthStore().user)
const lastUpdate = dayjs('2025-02-26')

if (me.value && !me.value?.settings?.lastPrivacySeen) {
  // Not seen any privacy notice so far.  Mark the current date as the last seen.
  await seenIt()
}

const showIt = computed(() => {
  if (!me.value) {
    // Don't show logged out.
    return false
  }

  const lastSeen = dayjs(me.value.settings.lastPrivacySeen)
  return lastSeen.isBefore(lastUpdate)
})

async function seenIt() {
  const settings = me.value.settings
  settings.lastPrivacySeen = lastUpdate.toISOString()
  await authStore.saveAndGet({
    settings,
  })
}
</script>
