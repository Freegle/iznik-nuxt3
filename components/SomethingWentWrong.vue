<template>
  <client-only>
    <div v-if="!unloading" class="d-flex justify-content-around">
      <NoticeMessage
        v-if="showError"
        variant="danger"
        class="posit text-center"
        show
      >
        <div v-if="offline">
          <p>
            It looks like you're offline. Please reload when your network is
            back.
          </p>
          <b-button
            variant="primary"
            class="mt-2"
            @click="window.location.reload()"
          >
            Reload
          </b-button>
        </div>
        <div v-else>
          <p>Sorry, something went wrong.</p>
          <p>
            That might be a bug, or perhaps your network connection broke.
            Please try again - if you continue to have problems then please take
            a screenshot and contact <SupportLink />
          </p>
        </div>
      </NoticeMessage>
      <NoticeMessage
        v-else-if="showReload && !snoozeReload"
        variant="info"
        class="posit text-center"
        show
      >
        <p>
          The website has been updated with fixes and improvements. Please
          reload this page to pick up the latest version.
        </p>
        <div class="d-flex justify-content-around">
          <b-button variant="white" @click="snooze">Not just now </b-button>
          <b-button variant="primary" @click="reload"> Reload now </b-button>
        </div>
      </NoticeMessage>
    </div>
  </client-only>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import NoticeMessage from './NoticeMessage'
import { ref, watch, onBeforeUnmount } from '#imports'
import { useMiscStore } from '~/stores/misc'
import SupportLink from '~/components/SupportLink'

const showError = ref(false)
const showReload = ref(false)
const snoozeReload = ref(false)
const snoozeTimer = ref(null)

const miscStore = useMiscStore()
const { somethingWentWrong, needToReload, offline, unloading } =
  storeToRefs(miscStore)

watch(somethingWentWrong, (newVal) => {
  if (newVal) {
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 10000)
  }
})

watch(needToReload, (newVal) => {
  if (newVal) {
    showReload.value = true
  }
})

function reload() {
  window.location.reload()
}

function snooze() {
  snoozeReload.value = true

  snoozeTimer.value = setTimeout(() => {
    snoozeReload.value = false
  }, 120000)
}

onBeforeUnmount(() => {
  if (snoozeTimer.value) {
    clearTimeout(snoozeTimer.value)
  }
})
</script>
<style scoped lang="scss">
.posit {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10000;
}
</style>
