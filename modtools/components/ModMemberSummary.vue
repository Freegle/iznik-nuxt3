<template>
  <div>
    <h4>
      <b-badge
        :variant="offers > 0 ? 'success' : 'light'"
        title="Recent OFFERs"
        class="clickme me-2"
        @click="showHistory('Offer')"
      >
        <v-icon icon="gift" class="fa-fw" />
        {{ pluralise(['OFFER', 'OFFERs'], offers, true) }}
      </b-badge>
      <b-badge
        :variant="wanteds > 0 ? 'success' : 'light'"
        title="Recent WANTEDs"
        class="clickme me-2"
        @click="showHistory('Wanted')"
      >
        <v-icon icon="search" class="fa-fw" />
        {{ pluralise(['WANTED', 'WANTEDs'], wanteds, true) }}
      </b-badge>
      <b-badge
        :variant="member.modmails > 0 ? 'danger' : 'light'"
        title="Recent ModMails"
        class="clickme me-2"
        @click="showModmails"
      >
        <v-icon icon="exclamation-triangle" class="fa-fw" />
        {{
          member.modmails
            ? pluralise('Modmail', member.modmails, true)
            : '0 Modmails'
        }}
      </b-badge>
      <b-badge
        v-if="userinfo"
        :variant="userinfo.repliesoffer > 0 ? 'success' : 'light'"
        title="Recent replies to OFFERs"
        class="clickme d-inline-flex me-2"
      >
        <div class="d-flex mr-1">
          <v-icon icon="gift" class="fa-fw" />
          <v-icon icon="reply" class="fa-fw" />
        </div>
        {{ userinfo.repliesoffer }}
      </b-badge>
      <b-badge
        v-if="userinfo"
        :variant="userinfo.replieswanted > 0 ? 'success' : 'light'"
        title="Recent replies to WANTEDs"
        class="clickme d-inline-flex me-2"
      >
        <div class="d-flex mr-1">
          <v-icon icon="search" class="fa-fw" />
          <v-icon icon="reply" class="fa-fw" />
        </div>
        {{ userinfo.replieswanted }}
      </b-badge>
      <b-badge
        v-if="userinfo"
        :variant="userinfo.expectedreplies > 0 ? 'danger' : 'light'"
        title="Recent outstanding replies requested"
        class="clickme me-2"
      >
        <v-icon icon="clock" class="fa-fw" />
        {{ pluralise(['RSVP', 'RSVPs'], userinfo.expectedreplies || 0, true) }}
      </b-badge>
    </h4>
    <ModPostingHistoryModal
      v-if="showPostingHistoryModal"
      ref="history"
      :user="member"
      :type="type"
      @hidden="showPostingHistoryModal = false"
    />
    <ModLogsModal
      v-if="showLogsModal"
      ref="logs"
      :userid="member.id"
      modmailsonly
      @hidden="showLogsModal = false"
    />
  </div>
</template>
<script>
import { pluralise } from '../composables/usePluralise'

import { useUserStore } from '~/stores/user'

export default {
  props: {
    member: {
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
      const user = this.userStore.byId(this.member.userid)

      if (user && user.info) {
        return user.info
      }

      return null
    },
  },
  mounted() {
    if (this.member.id) {
      this.userStore.fetchMT({
        id: this.member.userid,
        info: true,
      })
    }
  },
  methods: {
    countType(type) {
      let count = 0

      if (this.member && this.member.messagehistory) {
        this.member.messagehistory.forEach((entry) => {
          if (entry.type === type && entry.daysago < 31 && !entry.deleted) {
            count++
          }
        })
      }

      return count
    },
    async showHistory(type = null) {
      this.type = type
      this.showPostingHistoryModal = true
      await nextTick()
      this.$refs.history.show()
    },
    async showModmails() {
      this.modmailsonly = true

      this.showLogsModal = true
      await nextTick()
      this.$refs.logs.show()
    },
  },
}
</script>
