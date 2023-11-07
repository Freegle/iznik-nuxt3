<template>
  <div class="d-flex justify-content-around">
    <NoticeMessage
      v-if="showError"
      variant="danger"
      class="posit text-center"
      show
    >
      <div v-if="offline">
        <p>
          It looks like you're offline. Please reload when your network is back.
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
          That might be a bug, or perhaps your network connection broke. Please
          try again - if you continue to have problems then please take a
          screenshot and contact <SupportLink />
        </p>
      </div>
    </NoticeMessage>
    <NoticeMessage
      v-if="showReload && !snoozeReload"
      variant="info"
      class="posit text-center"
      show
    >
      <p>
        The website has been updated with fixes and improvements. Please reload
        this page to pick up the latest version.
      </p>
      <div class="d-flex justify-content-around">
        <b-button variant="white" @click="snooze">Not just now </b-button>
        <b-button variant="primary" @click="reload"> Reload now </b-button>
      </div>
    </NoticeMessage>
  </div>
</template>
<script>
import NoticeMessage from './NoticeMessage'
import { useMiscStore } from '~/stores/misc'
import SupportLink from '~/components/SupportLink'

export default {
  components: {
    NoticeMessage,
    SupportLink,
  },
  data() {
    return {
      showError: false,
      showReload: false,
      snoozeReload: false,
      snoozeTimer: null,
    }
  },
  computed: {
    somethingWentWrong() {
      const miscStore = useMiscStore()
      return miscStore.somethingWentWrong
    },
    needToReload() {
      const miscStore = useMiscStore()
      return miscStore.needToReload
    },
    offline() {
      const miscStore = useMiscStore()
      return !miscStore.online
    },
  },
  watch: {
    somethingWentWrong(newVal) {
      if (newVal) {
        this.showError = true
        setTimeout(() => {
          this.showError = false
        }, 10000)
      }
    },
    needToReload(newVal) {
      if (newVal) {
        this.showReload = true
      }
    },
  },
  beforeUnmount() {
    if (this.snoozeTimer) {
      clearTimeout(this.snoozeTimer)
    }
  },
  methods: {
    reload() {
      window.location.reload()
    },
    snooze() {
      this.snoozeReload = true

      this.snoozeTimer = setTimeout(() => {
        this.snoozeReload = false
      }, 120000)
    },
  },
}
</script>
<style scoped lang="scss">
.posit {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10000;
}
</style>
