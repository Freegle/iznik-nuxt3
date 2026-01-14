<template>
  <span class="border border-info rounded p-1">
    <b-badge
      variant="light"
      class="clickme me-2"
      title="Recent OFFERs"
      @click="showHistory('Offer')"
    >
      <v-icon icon="gift" class="fa-fw" /> {{ offers }}
    </b-badge>
    <b-badge
      variant="light"
      class="clickme me-2"
      title="Recent WANTEDs"
      @click="showHistory('Wanted')"
    >
      <v-icon icon="search" class="fa-fw" /> {{ wanteds }}
    </b-badge>
    <b-badge
      :variant="user.modmails > 0 ? 'danger' : 'light'"
      class="clickme me-2"
      title="ModMails"
      @click="showModmails"
    >
      <v-icon icon="exclamation-triangle" class="fa-fw" /> {{ user.modmails }}
    </b-badge>
    <b-badge
      v-if="userinfo"
      :variant="userinfo.replies > 0 ? 'success' : 'light'"
      title="Recent replies to OFFERs"
      class="me-2"
    >
      <v-icon icon="gift" class="fa-fw" /><v-icon icon="reply" class="fa-fw" />
      {{ userinfo.repliesoffer }}
    </b-badge>
    <b-badge
      v-if="userinfo"
      :variant="userinfo.replies > 0 ? 'success' : 'light'"
      title="Recent replies to WANTEDs"
      class="me-2"
    >
      <v-icon icon="search" class="fa-fw" /><v-icon
        icon="reply"
        class="fa-fw"
      />
      {{ userinfo.replieswanted }}
    </b-badge>
    <b-badge
      v-if="userinfo"
      :variant="userinfo.expectedreplies > 0 ? 'danger' : 'light'"
      title="Recent outstanding replies requested"
      class="me-2"
    >
      <v-icon icon="clock" class="fa-fw" /> {{ userinfo.expectedreplies || 0 }}
    </b-badge>
    <b-button
      variant="link"
      size="sm"
      class="clickme me-2"
      @click="showHistory(null)"
    >
      Posts
    </b-button>
    <b-button variant="link" size="sm" @click="showLogs"> Logs </b-button>
    <ModPostingHistoryModal
      v-if="showPostingHistoryModal"
      ref="history"
      :user="user"
      :type="type"
      @hidden="showPostingHistoryModal = false"
    />
    <ModLogsModal
      v-if="showLogsModal"
      ref="logs"
      :userid="user.id"
      :modmailsonly="modmailsonly"
      @hidden="showLogsModal = false"
    />
  </span>
</template>
<script>
import { useUserStore } from '~/stores/user'

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data: function () {
    return {
      type: null,
      modmailsonly: false,
      showPostingHistoryModal: false,
      showLogsModal: false,
    }
  },
  computed: {
    offers() {
      return this.countType('Offer')
    },
    wanteds() {
      return this.countType('Wanted')
    },
    userinfo() {
      if (this.user.info) {
        return this.user.info
      }

      const user = this.userStore.byId(this.userid)

      if (user && user.info) {
        return user.info
      }

      return null
    },
  },
  mounted() {
    if (!this.user.info) {
      // Fetch with info so that we can display more.
      this.userStore.fetch(this.user.id)
    }
  },
  methods: {
    countType(type) {
      let count = 0

      if (this.user && this.user.messagehistory) {
        this.user.messagehistory.forEach((entry) => {
          if (entry.type === type) {
            count++
          }
        })
      }

      return count
    },
    showHistory(type = null) {
      this.type = type
      this.showPostingHistoryModal = true
      this.$refs.history?.show()
    },
    showLogs() {
      console.log('showLogs')
      this.modmailsonly = false

      this.showLogsModal = true
      this.$refs.logs?.show()
    },
    showModmails() {
      this.modmailsonly = true

      this.showLogsModal = true
      this.$refs.logs?.show()
    },
  },
}
</script>
