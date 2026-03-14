<template>
  <div v-if="user">
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
        :variant="user.modmails > 0 ? 'danger' : 'light'"
        title="Recent ModMails"
        class="clickme me-2"
        @click="showModmails"
      >
        <v-icon icon="exclamation-triangle" class="fa-fw" />
        {{
          user.modmails
            ? pluralise('Modmail', user.modmails, true)
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
      :userid="userid"
      :type="type"
      @hidden="showPostingHistoryModal = false"
    />
    <ModLogsModal
      v-if="showLogsModal"
      ref="logs"
      :userid="userid"
      modmailsonly
      @hidden="showLogsModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
})

const userStore = useUserStore()
const user = computed(() => userStore.byId(props.userid))

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) {
      userStore.fetchMT({
        id: uid,
        info: true,
        emailhistory: true,
      })
    }
  },
  { immediate: true }
)

const history = ref(null)
const logs = ref(null)

const type = ref(null)
const showPostingHistoryModal = ref(false)
const showLogsModal = ref(false)

function countType(typeToCount) {
  let count = 0

  if (user.value && user.value.messagehistory) {
    user.value.messagehistory.forEach((entry) => {
      if (entry.type === typeToCount && entry.daysago < 31 && !entry.deleted) {
        count++
      }
    })
  }

  return count
}

const offers = computed(() => countType('Offer'))
const wanteds = computed(() => countType('Wanted'))

const userinfo = computed(() => {
  if (user.value && user.value.info) {
    return user.value.info
  }
  return null
})

function showHistory(typeArg = null) {
  type.value = typeArg
  showPostingHistoryModal.value = true
  history.value?.show()
}

function showModmails() {
  showLogsModal.value = true
  logs.value?.show()
}
</script>
