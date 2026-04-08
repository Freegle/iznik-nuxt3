<template>
  <span v-if="user" class="border border-info rounded p-1">
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
      :variant="userinfo.repliesoffer > 0 ? 'success' : 'light'"
      title="Recent replies to OFFERs"
      class="clickme me-2"
      @click="showReplies('Offer')"
    >
      <v-icon icon="gift" class="fa-fw" /><v-icon icon="reply" class="fa-fw" />
      {{ userinfo.repliesoffer }}
    </b-badge>
    <b-badge
      v-if="userinfo"
      :variant="userinfo.replieswanted > 0 ? 'success' : 'light'"
      title="Recent replies to WANTEDs"
      class="clickme me-2"
      @click="showReplies('Wanted')"
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
      :userid="userid"
      :type="type"
      @hidden="showPostingHistoryModal = false"
    />
    <ModLogsModal
      v-if="showLogsModal"
      ref="logs"
      :userid="userid"
      :modmailsonly="modmailsonly"
      @hidden="showLogsModal = false"
    />
    <ModRepliesModal
      v-if="showRepliesModal"
      ref="repliesModal"
      :userid="userid"
      :type="replyType"
      @hidden="showRepliesModal = false"
    />
  </span>
</template>
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '~/stores/user'
import ModRepliesModal from '~/modtools/components/ModRepliesModal.vue'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
})

const userStore = useUserStore()

const user = computed(() => {
  return userStore.byId(props.userid)
})

const history = ref(null)
const logs = ref(null)
const repliesModal = ref(null)

const type = ref(null)
const replyType = ref(null)
const modmailsonly = ref(false)
const showPostingHistoryModal = ref(false)
const showLogsModal = ref(false)
const showRepliesModal = ref(false)

function countType(typeArg) {
  let count = 0

  if (user.value?.messagehistory) {
    user.value.messagehistory.forEach((entry) => {
      if (entry.type === typeArg && entry.daysago < 31 && !entry.deleted) {
        count++
      }
    })
  }

  return count
}

const offers = computed(() => {
  return countType('Offer')
})

const wanteds = computed(() => {
  return countType('Wanted')
})

const userinfo = computed(() => {
  if (user.value?.info) {
    return user.value.info
  }

  const storeUser = userStore.byId(props.userid)

  if (storeUser?.info) {
    return storeUser.info
  }

  return null
})

onMounted(() => {
  if (!user.value?.info) {
    // Fetch with info so that we can display more.
    userStore.fetch(props.userid)
  }
})

async function showHistory(typeArg = null) {
  type.value = typeArg
  showPostingHistoryModal.value = true
  await nextTick()
  history.value?.show()
}

async function showLogs() {
  modmailsonly.value = false
  showLogsModal.value = true
  await nextTick()
  logs.value?.show()
}

async function showModmails() {
  modmailsonly.value = true
  showLogsModal.value = true
  await nextTick()
  logs.value?.show()
}

async function showReplies(typeArg = null) {
  replyType.value = typeArg
  showRepliesModal.value = true
  await nextTick()
  repliesModal.value?.show()
}
</script>
