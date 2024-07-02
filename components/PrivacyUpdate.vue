<template>
  <NoticeMessage v-if="showIt" variant="info">
    <div class="d-flex justify-content-between">
      <div class="d-flex flex-column justify-content-around">
        <div>
          <v-icon icon="info-circle" /> We've updated our
          <nuxt-link to="/privacy">Privacy Policy</nuxt-link>.
        </div>
      </div>
      <div>
        <b-button variant="secondary" @click="seenIt">Hide this</b-button>
      </div>
    </div>
  </NoticeMessage>
</template>
<script setup>
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const me = ref(useAuthStore().user)
const lastUpdate = dayjs('2024-04-15')

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
