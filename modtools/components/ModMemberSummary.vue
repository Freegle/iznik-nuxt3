<template>
  <div>
    <h4>
      <b-badge :variant="offers > 0 ? 'success' : 'light'" title="Recent OFFERs" class="clickme" @click="showHistory('Offer')">
        <v-icon icon="gift" class="fa-fw" /> {{ withplural('OFFER', offers, true) }}
        
      </b-badge>
      <b-badge :variant="wanteds > 0 ? 'success' : 'light'" title="Recent WANTEDs" class="clickme" @click="showHistory('Wanted')">
        <v-icon icon="search" class="fa-fw" /> {{ withplural('WANTED', wanteds, true) }}
      </b-badge>
      <b-badge :variant="(member.modmails && member.modmails) > 0 ? 'danger' : 'light'" title="Recent ModMails" class="clickme" @click="showModmails">
        <v-icon icon="exclamation-triangle" class="fa-fw" />  {{ (member.modmails ? member.modmails : 0) | withplural('Modmail', member.modmails.length, true) }}
      </b-badge>
      <b-badge v-if="userinfo" :variant="userinfo.repliesoffer > 0 ? 'success' : 'light'" title="Recent replies to OFFERs" class="clickme d-inline-flex">
        <div class="d-flex mr-1">
          <v-icon icon="gift" class="fa-fw" />
          <v-icon icon="reply" class="fa-fw" />
        </div>
        {{ userinfo.repliesoffer }}
      </b-badge>
      <b-badge v-if="userinfo" :variant="userinfo.replieswanted > 0 ? 'success' : 'light'" title="Recent replies to WANTEDs" class="clickme d-inline-flex">
        <div class="d-flex mr-1">
          <v-icon icon="search" class="fa-fw" />
          <v-icon icon="reply" class="fa-fw" />
        </div>
        {{ userinfo.replieswanted }}
      </b-badge>
      <b-badge v-if="userinfo" :variant="userinfo.expectedreplies > 0 ? 'danger' : 'light'" title="Recent outstanding replies requested" class="clickme">
        <v-icon icon="clock" class="fa-fw" /> {{ (userinfo.expectedreplies || 0) | withplural('RSVP', userinfo.expectedreplies.length, true) }}
      </b-badge>
    </h4>
    <!--ModPostingHistoryModal ref="history" :user="member" :type="type" />
    <ModLogsModal v-if="showLogsModal" ref="logs" :userid="member.userid" modmailsonly /-->
  </div>
</template>
<script>
import pluralize from 'pluralize'

export default {
  props: {
    member: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      type: null,
      showLogsModal: false
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
      /* TODO const user = this.$store.getters['user/get'](this.member.userid)

      if (user && user.info) {
        return user.info
      }*/

      return null
    }
  },
  methods: {
    countType(type) {
      let count = 0

      this.member.messagehistory.forEach(entry => {
        if (entry.type === type && entry.daysago < 31 && !entry.deleted) {
          count++
        }
      })

      return count
    },
    showHistory(type = null) {
      this.type = type
      this.waitForRef('history', () => {
        this.$refs.history.show()
      })
    },
    showModmails() {
      this.modmailsonly = true
      this.showLogsModal = true

      this.waitForRef('logs', () => {
        this.$refs.logs.show()
      })
    },
    withplural(a, b, c) {
      if (Array.isArray(a)) {
        pluralize.addIrregularRule(...a)
        a = a[0]
      }
      return pluralize(a, b, c)
    }
  }
}
</script>
