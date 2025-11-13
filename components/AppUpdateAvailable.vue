<template>
  <div v-if="mobileStore.appupdaterequired || mobileStore.appupdateavailable">
    <NoticeMessage
      v-if="mobileStore.appupdaterequired"
      variant="danger"
      class="mb-2"
    >
      <p class="font-weight-bold mb-1">Update Required</p>
      <p class="mb-2">
        A new version of the app is required. Please update to continue using
        Freegle.
      </p>
      <b-button variant="primary" size="sm" @click="openStore">
        Update Now
      </b-button>
    </NoticeMessage>
    <NoticeMessage
      v-else-if="mobileStore.appupdateavailable"
      variant="info"
      class="mb-2"
    >
      <p class="font-weight-bold mb-1">Update Available</p>
      <p class="mb-2">
        A new version of the app is available. Update to get the latest features
        and improvements.
      </p>
      <b-button variant="primary" size="sm" @click="openStore">
        Update Now
      </b-button>
    </NoticeMessage>
  </div>
</template>

<script setup>
import { useMobileStore } from '~/stores/mobile'

const mobileStore = useMobileStore()

const openStore = () => {
  const url = mobileStore.isiOS
    ? 'https://apps.apple.com/gb/app/freegle/id1530645914'
    : 'https://play.google.com/store/apps/details?id=org.ilovefreegle.direct'

  window.open(url, '_blank')
}
</script>
