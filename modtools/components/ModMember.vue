<template>
  <div v-if="member">
    <b-card bg-variant="white" no-body>
      <b-card-header class="d-flex justify-content-between flex-wrap">
        <div>
          <div v-if="isLJ">LoveJunk user #{{ user.ljuserid }}</div>
          <div v-else-if="email">
            <!-- eslint-disable-next-line -->
            <ModClipboard class="me-1" :value="email" />
            <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
          </div>
        </div>
        <div>
          <ProfileImage
            :image="user.profile?.turl || user.profile?.paththumb"
            :name="user.displayname || member.fullname"
            class="ms-1 mb-1 inline"
            is-thumbnail
            size="sm"
          />
          {{ user.displayname || member.fullname }}
        </div>
        <div v-if="member.added || member.joined">
          <v-icon icon="calendar-alt" />
          {{ datetimeshort(member.added || member.joined) }}
        </div>
        <div><v-icon icon="hashtag" />{{ member.userid }}</div>
      </b-card-header>
      <b-card-body>
        <ModDeletedOrForgotten v-if="user" :userid="member.userid" />
        <NoticeMessage v-if="banned" variant="danger" class="mb-2">
          This freegler is banned from this group.
        </NoticeMessage>
        <div v-if="heldByUser">
          <NoticeMessage variant="warning" class="mb-2">
            <p v-if="me.id === heldByUser.id">
              You held this member. Other people will see a warning to check
              with you before releasing them.
            </p>
            <p v-else>
              Held by <strong>{{ heldByUser.displayname }}</strong
              >. Please check before releasing them.
            </p>
            <ModMemberButton
              v-if="heldByUser"
              :userid="member.userid"
              :groupid="member.groupid"
              :spammerid="user.spammer?.id"
              variant="warning"
              icon="play"
              release
              label="Release"
            />
          </NoticeMessage>
        </div>
        <ModComments
          :userid="member.userid"
          :expand-comments="expandComments"
        />
        <ModSpammer
          v-if="user.spammer"
          :userid="member.userid"
          :sameip="sameip"
        />
        <NoticeMessage
          v-if="member.reviewreason && member.reviewrequestedat"
          variant="danger"
          class="mb-2"
        >
          This freegler is flagged: {{ member.reviewreason }}
        </NoticeMessage>
        <NoticeMessage
          v-if="user.activedistance > 50"
          variant="warning"
          class="mb-2"
        >
          This freegler recently active on groups
          {{ user.activedistance }} miles apart.
        </NoticeMessage>
        <ModBouncing v-if="user.bouncing" :userid="member.userid" />
        <NoticeMessage v-if="member.bandate">
          Banned
          <span :title="datetime(member.bandate)">{{
            timeago(member.bandate)
          }}</span>
          <span v-if="member.bannedby"> by #{{ member.bannedby }}</span> - check
          logs for info.
          <b-button variant="link" size="sm" @click="confirmUnban(member)">
            Unban
          </b-button>
        </NoticeMessage>
        <div class="d-flex justify-content-between flex-wrap">
          <div class="border border-info p-1 flex-grow-1 me-1">
            <SettingsGroup
              v-if="groupid"
              :emailfrequency="member.emailfrequency"
              :membership-m-t="member"
              xclass="border border-info p-1 flex-grow-1 me-1"
              @update:emailfrequency="
                settingsChange('emailfrequency', groupid, $event)
              "
              @update:eventsallowed="
                settingsChange('eventsallowed', groupid, $event)
              "
              @update:volunteeringallowed="
                settingsChange('volunteeringallowed', groupid, $event)
              "
            />
            <div class="fw-bold mt-1">Moderation status:</div>
            <ModModeration
              :userid="member.userid"
              :membership="member"
              class="order-2 order-md-3 order-lg-4"
            />
          </div>
          <div>
            <ModMemberSummary :userid="member.userid" />
            <ModMemberEngagement :userid="member.userid" />
            <div v-if="user.info && user.info.publiclocation">
              Public location: {{ user.info.publiclocation.location }}
            </div>
            <ModMemberActions
              v-if="!footeractions"
              :userid="member.userid"
              :groupid="groupid"
              :banned="Boolean(member.bandate)"
            />
            <ModMemberships :userid="member.userid" />
            <ModMemberLogins :userid="member.userid" />
            <b-button
              v-if="user.emails && user.emails.length"
              variant="link"
              @click="showEmails = !showEmails"
            >
              <v-icon icon="envelope" />
              <span v-if="showEmails">
                <span class="d-inline d-sm-none"> Hide </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', user.emails.length, true) }}
                </span>
              </span>
              <span v-else>
                <span class="d-inline d-sm-none">
                  {{ user.emails.length }}
                </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', user.emails.length, true) }}
                </span>
              </span>
            </b-button>
            <b-button variant="link" @click="showHistory(null)">
              View posts
            </b-button>
            <b-button variant="link" @click="showLogs"> View logs </b-button>
            <b-button variant="link" :to="'/profile/' + member.userid">
              View profile
            </b-button>
            <div v-if="showEmails">
              <div v-for="e in user.emails" :key="e.id">
                {{ e.email }} <v-icon v-if="e.preferred" icon="star" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="user && user.id && !isTN && !isLJ">
          <hr />
          <div class="d-flex justify-content-between flex-wrap">
            <OurToggle
              v-model="notifications.email"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{ checked: 'Chat On', unchecked: 'Chat Off' }"
              variant="modgreen"
              class="mb-2"
              @change="changeNotification($event, 'email')"
            />
            <OurToggle
              v-model="notifications.emailmine"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{ checked: 'Own Chats On', unchecked: 'Own Chats Off' }"
              variant="modgreen"
              class="mb-2"
              @change="changeNotification($event, 'emailmine')"
            />
            <OurToggle
              v-model="settings.notificationmails"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Notification/ChitChat On',
                unchecked: 'Notification/ChitChat On',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeNotifChitchat"
            />
            <OurToggle
              v-model="relevantallowed"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Suggestions On',
                unchecked: 'Suggestions Off',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeRelevant"
            />
            <OurToggle
              v-model="newslettersallowed"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Newsletters On',
                unchecked: 'Newsletters Off',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeNewsletter"
            />
            <OurToggle
              v-model="autorepost"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Autorepost On',
                unchecked: 'Autorepost Off',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeAutorepost"
            />
          </div>
        </div>
      </b-card-body>
      <b-card-footer class="d-flex justify-content-between flex-wrap">
        <ModMemberButtons
          :membershipid="member.id"
          :modconfigid="configid"
          :actions="footeractions"
        />
        <div
          class="d-flex justify-content-between justify-content-md-end flex-grow-1"
        >
          <ModRole
            v-if="groupid && member.role"
            :userid="member.userid"
            :groupid="groupid"
            :role="member.role"
          />
          <!--div v-if="chatid" class="d-inline btn border">
            <v-icon class="me-1 text-link" icon="comments" />
            <NuxtLink :to="'/chats/' + chatid">Chat</NuxtLink>
          </div-->
          <b-button variant="white" class="me-2 mb-1" @click="showChat">
            <v-icon icon="comments" /> View Chat
          </b-button>
          <ChatButton
            :userid="member.userid"
            :groupid="member.groupid"
            title="Chat"
            variant="white"
            class="ms-1"
          />
        </div>
      </b-card-footer>
    </b-card>
    <ModPostingHistoryModal
      v-if="showPostingHistoryModal"
      ref="history"
      :userid="member.userid"
      :type="type"
      @hidden="showPostingHistoryModal = false"
    />
    <ModLogsModal
      v-if="showLogsModal"
      ref="logs"
      :userid="member.userid"
      @hidden="showLogsModal = false"
    />
    <ConfirmModal
      v-if="showUnbanModal"
      ref="unbanConfirm"
      :title="showUnbanModalTitle"
      @confirm="unban"
      @hidden="showUnbanModal = false"
    />
    <ModChatModal
      v-if="showModChatModal && chatid"
      :id="chatid"
      ref="modChatModal"
      :pov="0"
      @hidden="showModChatModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'
import { useModConfigStore } from '~/stores/modconfig'
import { useChatStore } from '~/stores/chat'
import { useMe } from '~/composables/useMe'
import { usePreferredEmail } from '~/modtools/composables/usePreferredEmail'

const props = defineProps({
  membershipid: {
    type: Number,
    required: true,
  },
  spammerlist: {
    type: Boolean,
    required: false,
    default: false,
  },
  footeractions: {
    type: Boolean,
    required: false,
    default: true,
  },
  expandComments: {
    type: Boolean,
    required: false,
    default: false,
  },
  sameip: {
    type: Array,
    required: false,
    default: null,
  },
})

const chatStore = useChatStore()
const memberStore = useMemberStore()

const member = computed(() => memberStore.get(props.membershipid))
const userStore = useUserStore()
const modConfigStore = useModConfigStore()
const { me, myGroups } = useMe()

const history = ref(null)
const logs = ref(null)
const unbanConfirm = ref(null)
const modChatModal = ref(null)

const showEmails = ref(false)
const type = ref(null)
const showPostingHistoryModal = ref(false)
const showLogsModal = ref(false)
const showUnbanModal = ref(false)
const showUnbanModalTitle = ref('')
const showModChatModal = ref(false)
const banned = ref(false)
const chatid = ref(0)

const groupid = computed(() => {
  return member.value?.groupid
})

const configid = computed(() => {
  let id = null
  myGroups.value.forEach((group) => {
    if (group.id === groupid.value) {
      id = group.configid
    }
  })
  return id
})

watch(
  configid,
  async (id) => {
    if (id) {
      await modConfigStore.fetchById(id)
    }
  },
  { immediate: true }
)

const user = computed(() => {
  // Full user data from store, populated by fetchMT on mount.
  // Falls back to props.member for fields not yet loaded.
  const storeUser = userStore.list[member.value?.userid]
  if (!storeUser) return member.value

  // The member store may have richer data (e.g. spammer object from
  // spammer.js addAll) than the user store (which has spammer as a boolean).
  // Merge member data over user store data so enriched fields aren't lost.
  if (member.value && typeof member.value.spammer === 'object') {
    return { ...storeUser, spammer: member.value.spammer }
  }

  return storeUser
})

const email = usePreferredEmail(user)

// V2 API returns heldby as a numeric user ID, not an object.
const heldByUser = computed(() => {
  const hb = member.value?.heldby
  if (!hb) return null
  // V1 compat: heldby might already be an object
  if (typeof hb === 'object') return hb
  return userStore.byId(hb) || { id: hb, displayname: '#' + hb }
})

const isTN = computed(() => {
  let ret = false
  if (user.value) {
    if (user.value.emails) {
      user.value.emails.forEach((e) => {
        if (e.email && e.email.includes('@user.trashnothing.com')) {
          ret = true
        }
      })
    }
  }

  return ret
})

const isLJ = computed(() => {
  return user.value && user.value.ljuserid
})

const settings = computed(() => {
  if (user.value && user.value.settings && user.value.settings) {
    return user.value.settings
  } else {
    return {}
  }
})

const notifications = computed(() => {
  let ret = {}

  if (settings.value && settings.value.notifications) {
    ret = settings.value.notifications
  } else {
    ret = {
      email: true,
      emailmine: false,
      push: true,
      facebook: true,
      app: true,
    }
  }

  return ret
})

const relevantallowed = computed({
  get() {
    return user.value && Boolean(user.value.relevantallowed)
  },
  set(newval) {
    user.value.relevantallowed = newval
  },
})

const newslettersallowed = computed({
  get() {
    return user.value && Boolean(user.value.newslettersallowed)
  },
  set(newval) {
    user.value.newslettersallowed = newval
  },
})

const autorepost = computed({
  get() {
    return (
      member.value && !isTN.value && Boolean(!member.value.autorepostsdisable)
    )
  },
  set() {},
})

onMounted(() => {
  if (member.value?.banned) {
    banned.value = true
  }

  // Fetch user data — in modtools context, fetch() automatically uses fetchMT.
  if (member.value?.userid) {
    userStore.fetch(member.value.userid)
  }

  // V2 API returns heldby as a numeric ID — fetch the user so we can show their name.
  const hb = member.value?.heldby
  if (hb && typeof hb !== 'object' && !userStore.byId(hb)) {
    userStore.fetch(hb)
  }
})

function showHistory(typeArg = null) {
  type.value = typeArg
  showPostingHistoryModal.value = true
  history.value?.show()
}

function showLogs() {
  showLogsModal.value = true
  logs.value?.show()
}

function settingsChange(param, groupidArg, val) {
  const params = {
    userid: member.value?.userid,
    groupid: groupidArg,
  }
  params[param] = val
  memberStore.update(params)
}

async function changeNotification(e, notifType) {
  const settingsObj = settings.value
  const notificationsObj = notifications.value
  notificationsObj[notifType] = e.value
  settingsObj.notifications = notificationsObj

  await userStore.edit({
    id: user.value.id,
    settings: settingsObj,
  })
}

async function changeRelevant(e) {
  await userStore.edit({
    id: user.value.id,
    relevantallowed: e.value,
  })
}

async function changeNotifChitchat(e) {
  const settingsObj = user.value.settings
  settingsObj.notificationmails = e.value
  await userStore.edit({
    id: user.value.id,
    settings: settingsObj,
  })
}

async function changeNewsletter(e) {
  await userStore.edit({
    id: user.value.id,
    newslettersallowed: e.value,
  })
}

async function changeAutorepost(e) {
  const settingsObj = user.value.settings || {}
  settingsObj.autorepostsdisable = !e.value
  await userStore.edit({
    id: member.value?.userid,
    settings: settingsObj,
  })
}

function confirmUnban(memberArg) {
  showUnbanModal.value = true
  showUnbanModalTitle.value = 'Unban #' + memberArg.userid
  unbanConfirm.value?.show()
}

async function unban() {
  showUnbanModal.value = false
  await memberStore.unban(member.value?.userid, groupid.value)
  // Update the member in the store
  const m = memberStore.get(props.membershipid)
  if (m) {
    delete m.bandate
    delete m.bannedby
  }
}

async function showChat() {
  chatid.value = await chatStore.openChatToMods(
    member.value?.groupid,
    member.value?.userid
  )
  showModChatModal.value = true
  modChatModal.value?.show()
}
</script>
<style scoped lang="scss">
.text-link {
  color: var(--color-link);
}
</style>
